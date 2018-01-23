// @flow

import dotenv from 'dotenv'
import inquirer from 'inquirer'
import Nightmare from 'nightmare'
import fs from 'mz/fs'
import yargs from 'yargs'

import { formatTimesheets } from './util'
import { Time, Timesheet } from './types'

// Perl is web scale
const AUTH_URL = 'https://www.openair.com/index.pl'

const TIMESHEETS_SELECTOR = 'tbody [name="rowWithAnchors"].listLight'
const TIMES_SELECTOR = '#timesheet_grid tbody tr:not(.gridDataEmptyRow)'

export const auth = async function(nightmare: Nightmare, company: string, user: string, pass: string): Promise<void> {
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

export const timesheets = async function(nightmare: Nightmare): Promise<Timesheet[]> {
  return await nightmare
    .click('.nav_modules a[href*="ta"]')
    .wait('.nav_active a[href*="open"]')
    .click('.nav_active a[href*="open"]')
    .wait('.active a[href*="open"]')
    .evaluate((sel: string): Timesheet[] => {
      return Array.from(document.querySelectorAll(sel)).map(row => {
        const [, , start, name, user, hours, ...rest] = Array.from(row.children).map(x => x.textContent.trim())
        return { start, name, user, hours }
      })
    }, TIMESHEETS_SELECTOR)
}

export const times = async function(nightmare: Nightmare, needle: string): Promise<Time[]> {
  const sheets = await timesheets(nightmare)
  const index = sheets.findIndex(sheet => sheet.start.includes(needle))
  return await nightmare
    .evaluate(
      (sel: string, index: number): void => {
        const rows = Array.from(document.querySelectorAll(sel))
        const row = rows[index].querySelector('a')
        if (!row) throw new Error(`unable to find row ${index}`)
        row.click()
      },
      TIMESHEETS_SELECTOR,
      index
    )
    .wait('.timesheetControl')
    .evaluate((sel: string): Time[] => {
      const rows = Array.from(document.querySelectorAll(sel))
      return rows.map(row => {
        const children = Array.from(row.children)
        const [partner, task, sentiment] = children.filter(cell => cell.matches('.timesheetControl')).map(cell => {
          const selected = cell.querySelector('[selected]')
          return selected ? selected.textContent : ''
        })
        const inputs = children.filter(cell => cell.matches('.timesheetHours')).map(cell => {
          const input: ?HTMLInputElement = (cell.querySelector('[type="text"]'): any)
          return input ? Number.parseInt(input.value.trim() ? input.value : '0') : null
        })
        return {
          partner,
          task,
          sentiment,
          hours: inputs,
          total: inputs.reduce((a, b) => a + b, 0),
        }
      })
    }, TIMES_SELECTOR)
}
