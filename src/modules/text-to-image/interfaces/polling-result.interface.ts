import { StatusResponse } from '@/modules/text-to-image/utils/flux-image';

export interface PollingResult {
  id: string;
  imgUrl: string | null;
  imgBuffer?: Buffer | null;
  status: StatusResponse;
}
