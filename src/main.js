#!/usr/bin/env node

// @flow

import Nightmare from 'nightmare';

const AUTH_URL = 'https://www.openair.com/index.pl';

const auth = async function(nightmare: Nightmare, company: string, user: string, pass: string) {
  await nightmare
    .goto(AUTH_URL)
    .wait('#input_company')
    .insert('#input_company', company)
    .insert('#input_user', user)
    .insert('#input_password', pass)
    .click('#oa_comp_login_submit')
    .wait('body.dashboard')
    .title()
}

const listTimesheets = async function(nightmare: Nightmare) {
  await nightmare
    .click('.nav_modules a[href*="ta"]')
    .wait('.nav_active a[href*="open"]')
    .click('.nav_active a[href*="open"]')
    .wait('.active a[href*="open"]')
    .evaluate(() =>
      Array.from(document.querySelectorAll('tbody [name="rowWithAnchors"].listLight')).map(row =>
        Array.from(row.children).map(y => y.textContent)
      )
    )
    .then(console.log)
}

const main = async function() {
  const nightmare = Nightmare({ show: true, typeInterval: 10 })
  await auth(nightmare, 'Originate', 'hao.lian', 'bK67CTg5zh3quRD49z')
  await listTimesheets(nightmare)
  const url = await nightmare.url()
  console.error('whoa', url)
  return url
}

main().then(x => console.log('main', x)).catch(e => console.error('main', e))
