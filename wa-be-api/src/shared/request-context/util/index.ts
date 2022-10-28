import { plainToInstance } from 'class-transformer';
import { Request } from 'express';

import { UserAccessTokenClaims } from '../../../auth/dtos/auth-token-output.dto';
import {
  FORWARDED_FOR_TOKEN_HEADER,
  REQUEST_ID_TOKEN_HEADER,
  USER_AGENT_HEADER,
} from '../../constants';
import { RequestContext } from '../request-context.dto';

// Creates a RequestContext object from Request
export function createRequestContext(request: Request): RequestContext {
  const ctx = new RequestContext();
  ctx.requestID = request.header(REQUEST_ID_TOKEN_HEADER);
  ctx.url = request.url;
  ctx.ip = request.header(FORWARDED_FOR_TOKEN_HEADER)
    ? request.header(FORWARDED_FOR_TOKEN_HEADER)
    : request.ip;
  // TODO : get user agent
  ctx.userAgent = request.header(USER_AGENT_HEADER)
    ? request.header(USER_AGENT_HEADER)
    : null;
  // console.log(request.headers);

  // If request.user does not exist, we explicitly set it to null.
  ctx.user = request.user
    ? plainToInstance(UserAccessTokenClaims, request.user, {
        excludeExtraneousValues: true,
      })
    : null;

  return ctx;
}
