#!/usr/bin/env node

// @flow

import dotenv from 'dotenv';
import inquirer from 'inquirer';
import Nightmare from 'nightmare';
import fs from 'mz/fs';
import yargs from 'yargs';

import { formatTimesheets } from './util';
import { Timesheet } from './types';

const AUTH_URL = 'https://www.openair.com/index.pl';

const auth = async function(nightmare: Nightmare, company: string, user: string, pass: string): Promise<void> {
  await nightmare
    .goto(AUTH_URL)
    .wait('#input_company')
    .insert('#input_company', company)
    .insert('#input_user', user)
    .insert('#input_password', pass)
    .click('#oa_comp_login_submit')
  console.log('auth: logging in')
  await nightmare.wait('body.dashboard')
  console.log('auth: logged in')
}

const listTimesheets = async function(nightmare: Nightmare): Promise<Timesheet[]> {
  return await nightmare
    .click('.nav_modules a[href*="ta"]')
    .wait('.nav_active a[href*="open"]')
    .click('.nav_active a[href*="open"]')
    .wait('.active a[href*="open"]')
    .evaluate((): Timesheet[] =>
      Array.from(document.querySelectorAll('tbody [name="rowWithAnchors"].listLight')).map(row => {
        const [,, start, name, user, hours, ...rest] = Array.from(row.children).map(x => x.textContent.trim())
        return { start, name, user, hours };
      })
    )
}

const setup = async function(callback) {
  dotenv.load()

  const nightmare = Nightmare({ show: process.env.BURP_SHOW || false })

  if (!process.env.BURP_USER) {
    throw new Error('setup: no "USERNAME" found in process env')
  }
  if (!process.env.BURP_PASS) {
    throw new Error('setup: no "PASSWORD" found in process env')
  }

  await auth(nightmare, process.env.BURP_COMPANY || 'Originate', process.env.BURP_USER, process.env.BURP_PASS)
  await callback(nightmare)
  await nightmare.end()
}

const Commands = {
  init: async function() {
    const { username, password } = await inquirer.prompt([
      { type: 'input', message: 'OpenAir username', name: 'username' },
      { type: 'password', message: 'OpenAir password', name: 'password' },
    ])
    return await fs.writeFile('.env', [`BURP_USER=${username}`, `BURP_PASS=${password}`, ''].join("\n"))
  },
  list: async function() {
    return await setup(async function(nightmare: Nightmare) {
      const timesheets = await listTimesheets(nightmare);
      console.log(formatTimesheets(timesheets));
    })
  },
  repl: async function() {
    while (true) {
      const { program } = await inquirer.prompt([{ type: 'input', message: '$', name: 'program' }])
      console.log(program);
    }
  }
}

const runCommand = (command) => {
  command().then(() => {}).catch(console.error)
};

const main = () => {
  yargs.command('$0', 'an OpenAir domain-specific language', () => {}, () => {
    console.log('try the help command')
  }).command(
    'init', 'run this once in a directory you like', () => {}, () => runCommand(Commands.init)
  ).command(
    'list', 'list open timesheets', () => {}, () => runCommand(Commands.list)
  ).command(
    'repl', 'read! evaluate! print! uh... what was that last one', () => {}, () => runCommand(Commands.repl)
  ).help().argv
}

main()
