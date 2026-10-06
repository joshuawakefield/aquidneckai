import {expect,it} from 'vitest';
import {eventTiming,formatReaderDate} from './date-format';

it('preserves calendar dates, converts real timestamps to Rhode Island time, and rejects invalid dates',()=>{
  expect(formatReaderDate('2023-07-19')).toBe('Jul 19, 2023');
  expect(formatReaderDate('2023-07-19T00:00:00Z')).toBe('Jul 18, 2023');
  expect(formatReaderDate('2026-02-30')).toBe('Date unknown');
  expect(formatReaderDate('not a date')).toBe('Date unknown');
  expect(formatReaderDate(null,'Not supplied')).toBe('Not supplied');
});

it('uses event end times and local calendar days without treating unknown dates as future',()=>{
  const now=new Date('2026-10-05T16:00:00Z');
  expect(eventTiming('2026-10-05T14:00:00Z','2026-10-05T18:00:00Z',now)).toBe('current');
  expect(eventTiming('2026-10-05T14:00:00Z',null,now)).toBe('past');
  expect(eventTiming('2026-10-05',null,now)).toBe('current');
  expect(eventTiming('2026-10-04',null,now)).toBe('past');
  expect(eventTiming(null,null,now)).toBe('unknown');
  expect(eventTiming('2026-02-30',null,now)).toBe('unknown');
});
