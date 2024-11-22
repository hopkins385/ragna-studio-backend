import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error('Password is required');
  const saltRounds = 10;
  return hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await compare(password, hash);
}
