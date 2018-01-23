'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.times = exports.timesheets = exports.auth = undefined;

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _nightmare = require('nightmare');

var _nightmare2 = _interopRequireDefault(_nightmare);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _util = require('./util');

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Perl is web scale
const AUTH_URL = 'https://www.openair.com/index.pl';

const TIMESHEETS_SELECTOR = 'tbody [name="rowWithAnchors"].listLight';
const TIMES_SELECTOR = '#timesheet_grid tbody tr:not(.gridDataEmptyRow)';

const auth = exports.auth = async function (nightmare, company, user, pass) {
  await nightmare.goto(AUTH_URL).wait('#input_company').insert('#input_company', company).insert('#input_user', user).insert('#input_password', pass).click('#oa_comp_login_submit');
  console.log('auth: logging in');
  await nightmare.wait('body.dashboard');
  console.log('auth: logged in');
};

const timesheets = exports.timesheets = async function (nightmare) {
  return await nightmare.click('.nav_modules a[href*="ta"]').wait('.nav_active a[href*="open"]').click('.nav_active a[href*="open"]').wait('.active a[href*="open"]').evaluate(sel => {
    return Array.from(document.querySelectorAll(sel)).map(row => {
      const [,, start, name, user, hours, ...rest] = Array.from(row.children).map(x => x.textContent.trim());
      return { start, name, user, hours };
    });
  }, TIMESHEETS_SELECTOR);
};

const times = exports.times = async function (nightmare, needle) {
  const sheets = await timesheets(nightmare);
  const index = sheets.findIndex(sheet => sheet.start.includes(needle));
  return await nightmare.evaluate((sel, index) => {
    const rows = Array.from(document.querySelectorAll(sel));
    const row = rows[index].querySelector('a');
    if (!row) throw new Error(`unable to find row ${index}`);
    row.click();
  }, TIMESHEETS_SELECTOR, index).wait('.timesheetControl').evaluate(sel => {
    const rows = Array.from(document.querySelectorAll(sel));
    return rows.map(row => {
      const children = Array.from(row.children);
      const [partner, task, sentiment] = children.filter(cell => cell.matches('.timesheetControl')).map(cell => {
        const selected = cell.querySelector('[selected]');
        return selected ? selected.textContent : '';
      });
      const inputs = children.filter(cell => cell.matches('.timesheetHours')).map(cell => {
        const input = cell.querySelector('[type="text"]');
        return input ? Number.parseInt(input.value.trim() ? input.value : '0') : null;
      });
      return {
        partner,
        task,
        sentiment,
        hours: inputs,
        total: inputs.reduce((a, b) => a + b, 0)
      };
    });
  }, TIMES_SELECTOR);
};