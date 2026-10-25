import fs from 'fs';
import crypto from 'crypto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { encryptData, decryptData, getOrCreateEncryptionKey } from '../../db.js';

// We need to mock fs to control the file system
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    default: {
      ...actual,
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
    },
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

describe('db.ts encryption', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // This resets the implementation and call counts
    // db.ts caches its key internally inside memory? Wait, looking at the code:
    // export function getOrCreateEncryptionKey(): Buffer { ... }
    // It does not cache it! It reads it every time! Let's verify this in db.ts.
  });

  afterEach(() => {
  });

  it('should generate a new key if it does not exist', () => {
    // Mock existsSync to return false for the key file, true for directory
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return false; // For .db_key
    });

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const err: any = new Error('ENOENT: no such file or directory');
      err.code = 'ENOENT';
      throw err;
    });

    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const key = getOrCreateEncryptionKey();

    expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalled();
    expect(key.length).toBe(32); // AES-256 key is 32 bytes
  });

  it('should reuse the existing key if it exists', () => {
    const predefinedKey = crypto.randomBytes(32);

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if (p.toString().endsWith('.db_key')) {
        return predefinedKey;
      }
      throw new Error('Not mocked');
    });

    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const key = getOrCreateEncryptionKey();

    expect(vi.mocked(fs.readFileSync)).toHaveBeenCalled();
    expect(vi.mocked(fs.writeFileSync)).not.toHaveBeenCalled();
    expect(key).toEqual(predefinedKey);
  });


  it('should throw if initial readFileSync fails with error other than ENOENT', () => {
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const err: any = new Error('EACCES: permission denied');
      err.code = 'EACCES';
      throw err;
    });

    expect(() => getOrCreateEncryptionKey()).toThrowError('EACCES: permission denied');
  });

  it('should handle race condition where writeFileSync fails with EEXIST', () => {
    const predefinedKey = crypto.randomBytes(32);

    vi.mocked(fs.readFileSync).mockImplementationOnce((p) => {
      const err: any = new Error('ENOENT: no such file or directory');
      err.code = 'ENOENT';
      throw err;
    }).mockImplementationOnce((p) => {
      if (p.toString().endsWith('.db_key')) {
        return predefinedKey;
      }
      throw new Error('Not mocked');
    });

    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      const err: any = new Error('EEXIST: file already exists');
      err.code = 'EEXIST';
      throw err;
    });

    const key = getOrCreateEncryptionKey();

    expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalled();
    expect(key).toEqual(predefinedKey);
  });

  it('should throw if writeFileSync fails with error other than EEXIST', () => {
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const err: any = new Error('ENOENT: no such file or directory');
      err.code = 'ENOENT';
      throw err;
    });

    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      const err: any = new Error('ENOSPC: no space left on device');
      err.code = 'ENOSPC';
      throw err;
    });

    expect(() => getOrCreateEncryptionKey()).toThrowError('ENOSPC: no space left on device');
  });

  it('should encrypt and decrypt data correctly', () => {
    // Setup predefined key for consistency
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if (p.toString().endsWith('.db_key')) {
        return predefinedKey;
      }
      const err: any = new Error('ENOENT');
      err.code = 'ENOENT';
      throw err;
    });

    const originalData = { hello: 'world', a: 1 };

    // Encrypt the data
    const encryptedStr = encryptData(originalData);

    // Check that the encrypted string is a valid JSON with required fields
    const parsedEncrypted = JSON.parse(encryptedStr);
    expect(parsedEncrypted).toHaveProperty('iv');
    expect(parsedEncrypted).toHaveProperty('encryptedData');
    expect(parsedEncrypted).toHaveProperty('authTag');

    // The data shouldn't be plain text
    expect(encryptedStr).not.toContain('world');

    // Decrypt the data
    const decryptedData = decryptData(encryptedStr);

    // Verify it matches the original
    expect(decryptedData).toEqual(originalData);
  });

  it('should fail to decrypt if auth tag is manipulated', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    const originalData = { hello: 'world' };
    const encryptedStr = encryptData(originalData);

    // Manipulate auth tag
    const parsedEncrypted = JSON.parse(encryptedStr);

    // Corrupt auth tag (flip last character)
    const corruptedAuthTag = parsedEncrypted.authTag.slice(0, -1) + (parsedEncrypted.authTag.endsWith('0') ? '1' : '0');
    parsedEncrypted.authTag = corruptedAuthTag;

    const corruptedEncryptedStr = JSON.stringify(parsedEncrypted);

    // Decryption should throw
    expect(() => decryptData(corruptedEncryptedStr)).toThrow();
  });

  it('should fail to decrypt if encrypted data is manipulated', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    const originalData = { hello: 'world' };
    const encryptedStr = encryptData(originalData);

    const parsedEncrypted = JSON.parse(encryptedStr);

    // Corrupt encrypted data
    const corruptedData = parsedEncrypted.encryptedData.slice(0, -1) + (parsedEncrypted.encryptedData.endsWith('0') ? '1' : '0');
    parsedEncrypted.encryptedData = corruptedData;

    const corruptedEncryptedStr = JSON.stringify(parsedEncrypted);

    // Decryption should throw due to auth tag mismatch
    expect(() => decryptData(corruptedEncryptedStr)).toThrow();
  });

  it('should fail to decrypt if iv is manipulated', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    const originalData = { hello: 'world' };
    const encryptedStr = encryptData(originalData);

    const parsedEncrypted = JSON.parse(encryptedStr);

    // Corrupt iv
    const corruptedIv = parsedEncrypted.iv.slice(0, -1) + (parsedEncrypted.iv.endsWith('0') ? '1' : '0');
    parsedEncrypted.iv = corruptedIv;

    const corruptedEncryptedStr = JSON.stringify(parsedEncrypted);

    // Decryption should throw
    expect(() => decryptData(corruptedEncryptedStr)).toThrow();
  });

  it('should fail to decrypt if payload is invalid JSON', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    expect(() => decryptData('invalid-json')).toThrow();
  });

  it('should fail to decrypt if payload is missing iv', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    const originalData = { hello: 'world' };
    const encryptedStr = encryptData(originalData);

    const parsedEncrypted = JSON.parse(encryptedStr);
    delete parsedEncrypted.iv;

    expect(() => decryptData(JSON.stringify(parsedEncrypted))).toThrow();
  });

  it('should fail to decrypt if payload is missing authTag', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    const originalData = { hello: 'world' };
    const encryptedStr = encryptData(originalData);

    const parsedEncrypted = JSON.parse(encryptedStr);
    delete parsedEncrypted.authTag;

    expect(() => decryptData(JSON.stringify(parsedEncrypted))).toThrow();
  });

  it('should fail to decrypt if payload is missing encryptedData', () => {
    const predefinedKey = crypto.randomBytes(32);
    vi.mocked(fs.readFileSync).mockImplementation(() => predefinedKey);

    const originalData = { hello: 'world' };
    const encryptedStr = encryptData(originalData);

    const parsedEncrypted = JSON.parse(encryptedStr);
    delete parsedEncrypted.encryptedData;

    expect(() => decryptData(JSON.stringify(parsedEncrypted))).toThrow();
  });

});
