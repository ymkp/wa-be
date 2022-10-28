import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { BaseApiException } from '../exceptions/base-api.exception';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailWithCTAInputDTO } from './dtos/email.dto';
@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
 
  constructor(
    private readonly configService: ConfigService,
    private mailerService: MailerService
  ) {
    this.nodemailerTransport = createTransport({
      service: configService.get('EMAIL_SERVICE'),
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      }
    });
  }
 
  sendMailCTA(input: EmailWithCTAInputDTO) {
    console.log('cta : ', input.link);
    try{
      return this.mailerService.sendMail({
        to: input.to,
        subject: input.subject,
        template: 'email-cta',
        context: {
          title: input.title,
          subtitle: input.subtitle,
          link: input.link,
          cta: input.cta,
        }
      });
    }catch(err){
      throw new BaseApiException(err,500)
    }
  }

  sendMailWithText(input: EmailWithCTAInputDTO) {
    try{
      return this.mailerService.sendMail({
        to: input.to,
        subject: input.subject,
        template: 'email-text',
        context: {
          title: input.title,
          subtitle: input.subtitle,
          text: input.cta,
        }
      });
    }catch(err){
      throw new BaseApiException(err,500)
    }
  }
}