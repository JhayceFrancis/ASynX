import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encryptData, decryptData } from '../../db.js';
import fs from 'fs';
import path from 'path';

describe('db.ts encryption (without mocks)', () => {
  const originalDataDir = process.env.DATA_DIR;
  const testDataDir = path.join(process.cwd(), '.test_db_encryption');

  beforeAll(() => {
    // Set a custom data directory so we don't interfere with real data
    process.env.DATA_DIR = testDataDir;
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    process.env.DATA_DIR = originalDataDir;
  });

  it('should encrypt and decrypt data properly without mocking dependencies', () => {
    const testData = {
      message: 'This is a secret message',
      numbers: [1, 2, 3, 4, 5],
      nested: {
        key: 'value'
      }
    };

    // Encrypt the data
    const encryptedString = encryptData(testData);

    // The output should be a string containing JSON
    expect(typeof encryptedString).toBe('string');

    const parsedEncrypted = JSON.parse(encryptedString);
    expect(parsedEncrypted).toHaveProperty('iv');
    expect(parsedEncrypted).toHaveProperty('encryptedData');
    expect(parsedEncrypted).toHaveProperty('authTag');

    // The data shouldn't be plain text
    expect(encryptedString).not.toContain('secret message');

    // Decrypt the data
    const decryptedData = decryptData(encryptedString);

    // Verify it matches the original exactly
    expect(decryptedData).toEqual(testData);
  });
});
