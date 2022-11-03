import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class JwtSigningService {
  constructor(private readonly jwtService: JwtService) {}

  public signPayload(payload1: any, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload1, options);
  }

  public verifyToken(token: string, options?: JwtVerifyOptions) {
    return this.jwtService.verify(token, options);
  }
}
