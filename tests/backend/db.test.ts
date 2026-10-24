import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getOrCreateEncryptionKey, encryptData, decryptData } from '../../db.ts';
import fs from 'fs';
import path from 'path';

describe('Database Encryption', () => {
  const testDataDir = path.join(process.cwd(), 'test_data_dir');
  const testKeyFile = path.join(testDataDir, '.db_key');

  beforeEach(() => {
    // Setup a clean test directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    process.env.DATA_DIR = testDataDir;
    // Remove the default .db_key if it exists to ensure a new one is created
    const defaultKeyFile = path.join(process.cwd(), '.db_key');
    if (fs.existsSync(defaultKeyFile)) {
        fs.unlinkSync(defaultKeyFile);
    }
  });

  afterEach(() => {
    // Cleanup test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    delete process.env.DATA_DIR;
    // Remove default .db_key if tests accidentally created it in root
    const defaultKeyFile = path.join(process.cwd(), '.db_key');
    if (fs.existsSync(defaultKeyFile)) {
        fs.unlinkSync(defaultKeyFile);
    }
  });

  describe('getOrCreateEncryptionKey', () => {
    it('should create a new 32-byte key if one does not exist', () => {
      const key = getOrCreateEncryptionKey();
      expect(Buffer.isBuffer(key)).toBe(true);
      expect(key.length).toBe(32);
      // db.ts gets process.cwd() as fallback if DATA_DIR is not set. We set DATA_DIR but let's check both
      const defaultKeyFile = path.join(process.cwd(), '.db_key');
      const keyFileCreated = fs.existsSync(testKeyFile) || fs.existsSync(defaultKeyFile);
      expect(keyFileCreated).toBe(true);
    });

    it('should return the existing key if one exists', () => {
      const firstKey = getOrCreateEncryptionKey();
      const secondKey = getOrCreateEncryptionKey();

      expect(firstKey.toString('hex')).toBe(secondKey.toString('hex'));
    });
  });

  describe('encryptData and decryptData', () => {
    it('should successfully encrypt and decrypt an object', () => {
      const testData = {
        user: 'testUser',
        settings: { theme: 'dark', notifications: true },
        items: [1, 2, 3]
      };

      const encrypted = encryptData(testData);
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(JSON.stringify(testData)); // Ensure it's actually encrypted
      expect(encrypted).toContain('iv');
      expect(encrypted).toContain('encryptedData');
      expect(encrypted).toContain('authTag');

      const decrypted = decryptData(encrypted);
      expect(decrypted).toEqual(testData);
    });

    it('should throw an error when tampering with the encrypted data', () => {
      const testData = { secret: 'do not change' };
      const encrypted = encryptData(testData);
      const parsed = JSON.parse(encrypted);

      // Tamper with the encrypted content - swap first char for a diff char, avoiding luck where it is unchanged
      const c = parsed.encryptedData.charAt(0);
      parsed.encryptedData = (c === 'a' ? 'b' : 'a') + parsed.encryptedData.substring(1);
      const tamperedStr = JSON.stringify(parsed);

      expect(() => decryptData(tamperedStr)).toThrow();
    });

    it('should throw an error when tampering with the auth tag', () => {
      const testData = { secret: 'do not change' };
      const encrypted = encryptData(testData);
      const parsed = JSON.parse(encrypted);

      // Tamper with auth tag - swap first char to guarantee change
      const c = parsed.authTag.charAt(0);
      parsed.authTag = (c === 'a' ? 'b' : 'a') + parsed.authTag.substring(1);
      const tamperedStr = JSON.stringify(parsed);

      expect(() => decryptData(tamperedStr)).toThrow();
    });
  });
});
