import { WHATSAPP_CLIENT_STATUS } from '../constants/whatsapp-client-status.constants';

export interface WhatsappCacheInfo {
  clientId: number;
  msisdn: string;
  token: string;
  fullUrl: string;
  status?: WHATSAPP_CLIENT_STATUS;
}
