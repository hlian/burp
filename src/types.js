// @flow

export interface Timesheet {
  start: string;
  name: string;
  user: string;
  hours: string;
}

export interface Time {
  partner: string;
  task: string;
  sentiment: string;
  hours: (?number)[];
  total: number;
}
