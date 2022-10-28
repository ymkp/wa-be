import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const DIVISI_KEY = 'divisi';
export const Divisi = (divisi: number): CustomDecorator<string> =>
  SetMetadata(DIVISI_KEY, divisi);
