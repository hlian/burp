#!/usr/bin/env node
'use strict';

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

var _robot = require('./robot');

var robot = _interopRequireWildcard(_robot);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const setup = async function (callback) {
  _dotenv2.default.load();

  const nightmare = (0, _nightmare2.default)({ show: process.env.BURP_SHOW || false });

  if (!process.env.BURP_USER) {
    throw new Error('setup: no "USERNAME" found in process env');
  }
  if (!process.env.BURP_PASS) {
    throw new Error('setup: no "PASSWORD" found in process env');
  }

  await robot.auth(nightmare, process.env.BURP_COMPANY || 'Originate', process.env.BURP_USER, process.env.BURP_PASS);
  await callback(nightmare);
  await nightmare.end();
};

const Commands = {
  init: async function () {
    const { username, password } = await _inquirer2.default.prompt([{ type: 'input', message: 'OpenAir username', name: 'username' }, { type: 'password', message: 'OpenAir password', name: 'password' }]);
    return await _fs2.default.writeFile('.env', [`BURP_USER=${username}`, `BURP_PASS=${password}`, ''].join('\n'));
  },

  list: async function () {
    return await setup(async function (nightmare) {
      const timesheets = await robot.timesheets(nightmare);
      console.log((0, _util.formatTimesheets)(timesheets));
    });
  },

  repl: async function () {
    while (true) {
      const { program } = await _inquirer2.default.prompt([{ type: 'input', message: '$', name: 'program' }]);
      const [head, ...rest] = program.split(' ');
      switch (head) {
        case 'list':
          {
            await Commands.list();
            break;
          }
        case 'focus':
          {
            const needle = rest[0];
            await setup(async function (nightmare) {
              const sheet = await robot.times(nightmare, needle);
              console.log((0, _util.formatTimes)(sheet));
            });
            break;
          }
        default:
          {
            console.warn('i do not recognize your program');
            break;
          }
      }
    }
  }
};

const runCommand = command => {
  command().then(() => {}).catch(console.error);
};

const main = () => {
  _yargs2.default.command('$0', 'an OpenAir domain-specific language', () => {}, () => {
    console.log('try the help command');
  }).command('init', 'run this once in a directory you like', () => {}, () => runCommand(Commands.init)).command('list', 'list open timesheets', () => {}, () => runCommand(Commands.list)).command('repl', 'read! evaluate! print! uh... what was that last one', () => {}, () => runCommand(Commands.repl)).help().argv;
};

main();