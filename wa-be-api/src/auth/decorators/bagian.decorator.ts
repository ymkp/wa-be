import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const BAGIAN_KEY = 'bagian';
export const Bagian = (bagian: number): CustomDecorator<string> =>
  SetMetadata(BAGIAN_KEY, bagian);
