#!/usr/bin/env node

// @flow

import dotenv from 'dotenv'
import inquirer from 'inquirer'
import Nightmare from 'nightmare'
import fs from 'mz/fs'
import yargs from 'yargs'

import { formatTimesheets, formatTimes } from './util'
import { Timesheet } from './types'
import * as robot from './robot'

const setup = async function(callback: Nightmare => Promise<void>) {
  dotenv.load()

  const nightmare = Nightmare({ show: process.env.BURP_SHOW || false })

  if (!process.env.BURP_USER) {
    throw new Error('setup: no "USERNAME" found in process env')
  }
  if (!process.env.BURP_PASS) {
    throw new Error('setup: no "PASSWORD" found in process env')
  }

  await robot.auth(nightmare, process.env.BURP_COMPANY || 'Originate', process.env.BURP_USER, process.env.BURP_PASS)
  await callback(nightmare)
  await nightmare.end()
}

const Commands = {
  init: async function() {
    const { username, password } = await inquirer.prompt([
      { type: 'input', message: 'OpenAir username', name: 'username' },
      { type: 'password', message: 'OpenAir password', name: 'password' },
    ])
    return await fs.writeFile('.env', [`BURP_USER=${username}`, `BURP_PASS=${password}`, ''].join('\n'))
  },

  new: async function() {
    return await setup(async function(nightmare: Nightmare) {
      await robot.newTimesheet(nightmare)
    })
  },

  list: async function() {
    return await setup(async function(nightmare: Nightmare) {
      const timesheets = await robot.timesheets(nightmare)
      console.log(formatTimesheets(timesheets))
    })
  },

  repl: async function() {
    while (true) {
      const { program } = await inquirer.prompt([{ type: 'input', message: '$', name: 'program' }])
      const [head, ...rest] = program.split(' ')
      switch (head) {
        case 'list': {
          await Commands.list()
          break
        }
        case 'new': {
          await Commands.new()
          break
        }
        case 'focus': {
          const needle = rest[0]
          await setup(async function(nightmare: Nightmare) {
            const sheet = await robot.times(nightmare, needle)
            console.log(formatTimes(sheet))
          })
          break
        }
        default: {
          console.warn('i do not recognize your program')
          break
        }
      }
    }
  },
}

const runCommand = command => {
  command()
    .then(() => {})
    .catch(console.error)
}

const main = () => {
  yargs
    .command(
      '$0',
      'an OpenAir domain-specific language',
      () => {},
      () => {
        console.log('try the help command')
      }
    )
    .command('init', 'run this once in a directory you like', () => {}, () => runCommand(Commands.init))
    .command('list', 'list open timesheets', () => {}, () => runCommand(Commands.list))
    .command('repl', 'read! evaluate! print! uh... what was that last one', () => {}, () => runCommand(Commands.repl))
    .help().argv
}

main()
