// @flow

import Table from 'tty-table';

import { Timesheet } from './types';

export const formatTimesheets = (data: Timesheet[]): string => {
  const header = [
    { alias : "Start Date", value: "start" },
    { alias : "Name", value: 'name' },
    { alias : "User", value : "user",},
    { alias : "Hours", value : "hours", }
  ];
  return Table(header, data).render()
}
