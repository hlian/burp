#!/usr/bin/env node
'use strict';

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _nightmare = require('nightmare');

var _nightmare2 = _interopRequireDefault(_nightmare);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _passwordPrompt = require('password-prompt');

var _passwordPrompt2 = _interopRequireDefault(_passwordPrompt);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _util = require('./util');

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AUTH_URL = 'https://www.openair.com/index.pl';

const auth = async function (nightmare, company, user, pass) {
  await nightmare.goto(AUTH_URL).wait('#input_company').insert('#input_company', company).insert('#input_user', user).insert('#input_password', pass).click('#oa_comp_login_submit').wait('body.dashboard').title();
};

const listTimesheets = async function (nightmare) {
  await nightmare.click('.nav_modules a[href*="ta"]').wait('.nav_active a[href*="open"]').click('.nav_active a[href*="open"]').wait('.active a[href*="open"]').evaluate(() => Array.from(document.querySelectorAll('tbody [name="rowWithAnchors"].listLight')).map(row => {
    const [,, start, name, user, hours, ...rest] = Array.from(row.children).map(x => x.textContent.trim());
    return { start, name, user, hours };
  })).then(data => {
    console.log((0, _util.formatTimesheets)(data));
  });
};

const setup = async function (callback) {
  _dotenv2.default.load();

  const nightmare = (0, _nightmare2.default)({ show: process.env.BURP_SHOW || false });

  if (!process.env.BURP_USER) {
    throw new Error('setup: no "USERNAME" found in process env');
  }
  if (!process.env.BURP_PASS) {
    throw new Error('setup: no "PASSWORD" found in process env');
  }

  await auth(nightmare, process.env.BURP_COMPANY || 'Originate', process.env.BURP_USER, process.env.BURP_PASS);
  await callback(nightmare);
  await nightmare.end();
};

const init = async function () {
  const username = await (0, _passwordPrompt2.default)('OpenAir username: ');
  const password = await (0, _passwordPrompt2.default)('OpenAir password: ');
  await _fs2.default.writeFile('.env', [`BURP_USER=${username}`, `BURP_PASS=${password}`].join("\n"));
};

const main = () => {
  _yargs2.default.command('$0', 'an OpenAir domain-specific language', () => {}, () => {
    console.log('try the help command');
  }).command('init', 'run this once in a directory you like', () => {}, init).command('list', 'list open timesheets', () => {}, () => setup(listTimesheets).then(() => {}).catch(console.error)).help().argv;
};

main();