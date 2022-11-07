const url = '/api/v1/whatsapp';

/**
 * auth the worker
 *
 * @GET
 * @header "Basic encode64(username:password)"
 */
export const WA_WORKER_AUTH = url + '/auth'; // ? get ?? header : Basic username:password
export const WA_WORKER_LOGIN = url + '/login'; // ? post
export const WA_WORKER_SEND_TEXT = url + '/send/text'; // ? post
export const WA_WORKER_STATUS = url + '/registered'; // ? get ?msisdn=string
