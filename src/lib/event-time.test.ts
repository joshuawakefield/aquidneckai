import {afterEach,expect,it,vi} from 'vitest';
import {isZonedTimestamp,localEventTimeToISO,rhodeIslandEventPreview,toLocalEventInput} from './event-time';
afterEach(()=>vi.unstubAllEnvs());

it('hydrates UTC timestamps into local controls and preserves the instant on submission',()=>{
  vi.stubEnv('TZ','UTC');
  expect(toLocalEventInput('2030-06-10T22:30:00Z')).toBe('2030-06-10T22:30:00');
  expect(localEventTimeToISO('2030-06-10T22:30')).toEqual({iso:'2030-06-10T22:30:00.000Z'});
  expect(rhodeIslandEventPreview('2030-06-10T22:30:00Z')).toContain('6:30 PM');
});

it('rejects missing and impossible dates without normalizing them into a different event',()=>{
  vi.stubEnv('TZ','UTC');
  expect(localEventTimeToISO('')).toHaveProperty('error');
  expect(localEventTimeToISO('2030-02-30T12:00')).toHaveProperty('error');
  expect(localEventTimeToISO('2030-01-01T25:00')).toHaveProperty('error');
  expect(toLocalEventInput('invalid')).toBe('');
  expect(isZonedTimestamp('2030-06-10T22:30')).toBe(false);
  expect(isZonedTimestamp('2030-02-30T22:30:00Z')).toBe(false);
});

it('requires an explicit offset for repeated DST times and rejects skipped DST times',()=>{
  vi.stubEnv('TZ','America/New_York');
  expect(localEventTimeToISO('2030-03-10T02:30')).toHaveProperty('error',expect.stringContaining('does not exist'));
  expect(localEventTimeToISO('2030-11-03T01:30')).toHaveProperty('error',expect.stringContaining('occurs twice'));
  expect(localEventTimeToISO('2030-11-03T03:30')).toEqual({iso:'2030-11-03T08:30:00.000Z'});
  expect(isZonedTimestamp('2030-11-03T01:30:00-04:00')).toBe(true);
  expect(isZonedTimestamp('2030-11-03T01:30:00-05:00')).toBe(true);
});
