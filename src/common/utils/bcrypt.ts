import { compare, hash } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error('Password is required');
  const saltRounds = 10;
  return hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}

export async function hashString(str: string, saltRounds: number = 10): Promise<string> {
  if (!str) throw new Error('String is required');
  return hash(str, saltRounds);
}

export async function compareString(str: string, hash: string): Promise<boolean> {
  return await compare(str, hash);
}

export async function hashObject(
  obj: Record<string, any>,
  saltRounds: number = 10,
): Promise<string> {
  if (!obj) throw new Error('Object is required');
  return hash(JSON.stringify(obj), saltRounds);
}

export async function compareObject(obj: Record<string, any>, hash: string): Promise<boolean> {
  return await compare(JSON.stringify(obj), hash);
}
