'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTimes = exports.formatTimesheets = undefined;

var _ttyTable = require('tty-table');

var _ttyTable2 = _interopRequireDefault(_ttyTable);

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const formatTimesheets = exports.formatTimesheets = data => {
  const header = [{ alias: 'Start Date', value: 'start' }, { alias: 'Name', value: 'name' }, { alias: 'User', value: 'user' }, { alias: 'Hours', value: 'hours' }];
  return (0, _ttyTable2.default)(header, data).render();
};

const formatTimes = exports.formatTimes = data => {
  const header = [{ alias: 'Partner', value: 'partner', width: 30 }, { alias: 'Sentiment', value: 'sentiment' }, { alias: 'Task', value: 'task' }, { alias: 'Hours', value: 'hours' }, { alias: 'Total', value: 'total' }];
  return (0, _ttyTable2.default)(header, data).render();
};