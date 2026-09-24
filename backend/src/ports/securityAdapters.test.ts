import { describe, expect, it } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { GatewayIdentityProvider } from './identity.js';
import { SignatureScanner } from './malwareScanner.js';

const request = (userId?: string) =>
  ({ headers: userId ? { 'x-user-id': userId } : {} }) as FastifyRequest;

describe('security adapters', () => {
  it('accepts only validated gateway identities', () => {
    const gateway = new GatewayIdentityProvider(false);
    expect(gateway.ownerId(request('user:123'))).toBe('user:123');
    expect(() => gateway.ownerId(request('bad value'))).toThrow('Authentication is required');
    expect(() => gateway.ownerId(request())).toThrow('Authentication is required');
  });

  it('uses the explicit demo identity only when enabled', () => {
    expect(new GatewayIdentityProvider(true).ownerId(request())).toBe('demo-user');
  });

  it('rejects executable signatures', async () => {
    const scanner = new SignatureScanner();
    await expect(scanner.scan(Buffer.from('MZpayload'), 'fake.txt')).resolves.toMatchObject({
      safe: false,
    });
    await expect(scanner.scan(Buffer.from('plain text'), 'safe.txt')).resolves.toEqual({
      safe: true,
    });
  });
});
