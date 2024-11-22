import { z } from 'zod';
export const cuidSchema = z.string().trim().cuid2();
// export const idSchema = z.object({ id: cuidSchema });
