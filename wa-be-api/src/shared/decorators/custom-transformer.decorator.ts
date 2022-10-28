import { Transform } from 'class-transformer';

export function ToBoolean(): (target: any, key: string) => void {
  return Transform(({ value }) => value === 'true', { toClassOnly: true });
}

export function ToGMT7(): (target: any, key: string) => void {
  return Transform(
    ({ value }) => {
      const d = new Date(value);
      d.setHours(d.getHours() + 7);
      return d;
    },
    { toClassOnly: true },
  );
}

export function ToGMT(): (target: any, key: string) => void {
  return Transform(
    ({ value }) => {
      const d = new Date(value);
      return d;
    },
    { toClassOnly: true },
  );
}
