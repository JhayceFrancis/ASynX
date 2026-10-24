import { describe, it, expect, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';

// Set DATA_DIR to a temporary directory before importing modules
const testDataDir = path.join(__dirname, 'test-data-oauth');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}
process.env.DATA_DIR = testDataDir;

import { encryptString, decryptString, getOAuthCredentials, saveOAuthCredentials } from '../../oauth_storage';

describe('OAuth Storage Module', () => {

  afterAll(() => {
    // Clean up test data dir
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  it('encrypts and decrypts strings correctly', () => {
    const original = "my-secret-client-id";
    const encrypted = encryptString(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain('iv');
    expect(encrypted).toContain('encryptedData');

    const decrypted = decryptString(encrypted);
    expect(decrypted).toBe(original);
  });

  it('returns original string on failed decryption', () => {
    expect(decryptString('not-json')).toBe('not-json');
    expect(decryptString(JSON.stringify({ some: 'data' }))).toBe(JSON.stringify({ some: 'data' }));
  });

  it('returns null for non-existent provider', () => {
    const creds = getOAuthCredentials('non-existent-provider');
    expect(creds).toBeNull();
  });

  it('saves and retrieves OAuth credentials', () => {
    saveOAuthCredentials('github-test', 'gh-client-id', 'gh-client-secret');

    const creds = getOAuthCredentials('github-test');
    expect(creds).not.toBeNull();
    expect(creds?.clientId).toBe('gh-client-id');
    expect(creds?.clientSecret).toBe('gh-client-secret');
  });

  it('updates existing OAuth credentials on conflict', () => {
    saveOAuthCredentials('discord-test', 'discord-client-id', 'discord-client-secret');
    saveOAuthCredentials('discord-test', 'new-client-id', 'new-client-secret');

    const creds = getOAuthCredentials('discord-test');
    expect(creds).not.toBeNull();
    expect(creds?.clientId).toBe('new-client-id');
    expect(creds?.clientSecret).toBe('new-client-secret');
  });
});
