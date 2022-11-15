import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { PhoneSocketRegisterInput } from '../dtos/phone-socket.dto';

export interface PipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (error: string) => any;
}

export declare class PhoneRegisterInputPipe implements PipeTransform<string> {
  protected exceptionFactory: (error: string) => any;
  constructor(options?: PipeOptions);
  /**
   * Method that accesses and performs optional transformation on argument for
   * in-flight requests.
   *
   * @param value currently processed route argument
   * @param metadata contains metadata about the currently processed route argument
   */
  transform(
    value: any,
    metadata: ArgumentMetadata,
  ): Promise<PhoneSocketRegisterInput>;
  /**
   * @param value currently processed route argument
   * @returns `true` if `value` is a valid integer number
   */
  // protected isNumeric(value: string): boolean;
}
