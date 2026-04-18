const TIMEZONE = 'Asia/Taipei';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const getDayKey = (date = new Date()) => formatter.format(date);

export const isSameDayKey = (a, b) => a === b;
