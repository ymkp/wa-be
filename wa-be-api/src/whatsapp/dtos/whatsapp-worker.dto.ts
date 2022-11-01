export interface WhatsappWorkerResponseDTO<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
}
