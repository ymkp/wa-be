import { Body, Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SMSClientService } from '../services/sms-client.service';

@ApiTags('sms-client')
@Controller('sms-client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SMSClientController {
  constructor(private readonly service: SMSClientService) {}
}
