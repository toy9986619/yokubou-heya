const TIMEZONE = 'Asia/Taipei';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const getDayKey = (date = new Date()) => formatter.format(date);

module.exports = { getDayKey };
