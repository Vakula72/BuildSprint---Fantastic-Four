import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from '@/lib/db/schema';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

function getDbClient() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  // Force synchronous WAL mode for edge/node compatibility in next-auth if needed
  const sqlite = new Database(path.join(dataDir, 'copilot.db'), { fileMustExist: false });
  return drizzle(sqlite, { schema: { users } });
}

export async function verifyPassword(email?: string, password?: string) {
  if (!email || !password) return null;

  const dbClient = getDbClient();
  const userRows = dbClient
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .all();

  let user = userRows[0];

  // Auto-provision demo users if they don't exist yet for the hackathon
  if (!user) {
    console.log(`[Auth-Utils] Auto-provisioning user ${email} for hackathon`);

    // We hash the exact password they tried to use to make it their permanent password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newId = randomUUID();
    dbClient.insert(users).values({
      id: newId,
      email: email,
      name: email.split('@')[0],
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    }).run();

    user = {
      id: newId,
      email: email,
      name: email.split('@')[0],
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString()
    };
  }

  if (!user.passwordHash) {
    console.log(`[Auth-Utils] No password set for ${email}`);
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    console.log(`[Auth-Utils] Invalid password for ${email}`);
    return null;
  }

  console.log(`[Auth-Utils] Login successful for ${email}`);
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email,
  };
}
