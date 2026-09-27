import {
	randomBytes,
	scrypt as nodeScrypt,
	timingSafeEqual
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(nodeScrypt);

const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');

	const derivedKey = (await scrypt(
		password,
		salt,
		KEY_LENGTH
	)) as Buffer;

	return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(
	password: string,
	storedHash: string
): Promise<boolean> {
	const parts = storedHash.split(':');

	let salt: string;
	let hash: string;

	if (parts.length === 3 && parts[0] === 'scrypt') {
		[, salt, hash] = parts;
	} else if (parts.length === 2) {
		// Backwards-compatible format: salt:hash
		[salt, hash] = parts;
	} else {
		return false;
	}

	if (!salt || !hash) {
		return false;
	}

	const derivedKey = (await scrypt(
		password,
		salt,
		KEY_LENGTH
	)) as Buffer;

	const storedKey = Buffer.from(hash, 'hex');

	if (storedKey.length !== derivedKey.length) {
		return false;
	}

	return timingSafeEqual(storedKey, derivedKey);
}