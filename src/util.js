// @flow

import Table from 'tty-table'

import { Timesheet, Time } from './types'

export const formatTimesheets = (data: Timesheet[]): string => {
  const header = [
    { alias: 'Start Date', value: 'start' },
    { alias: 'Name', value: 'name' },
    { alias: 'Hours', value: 'hours' },
  ]
  return Table(header, data).render()
}

export const formatTimes = (data: Time[]): string => {
  const header = [
    { alias: 'Partner', value: 'partner', width: 30 },
    { alias: 'Sentiment', value: 'sentiment' },
    { alias: 'Task', value: 'task' },
    { alias: 'Hours', value: 'hours' },
    { alias: 'Total', value: 'total' },
  ]
  return Table(header, data).render()
}
