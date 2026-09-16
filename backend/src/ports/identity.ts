import type { FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';

export interface IdentityProvider {
  ownerId(request: FastifyRequest): string;
}

/**
 * Resolves identity asserted by a trusted API gateway. The gateway must strip
 * incoming x-user-id values before adding its verified subject identifier.
 */
export class GatewayIdentityProvider implements IdentityProvider {
  constructor(private readonly allowDemoIdentity: boolean) {}

  ownerId(request: FastifyRequest): string {
    const value = request.headers['x-user-id'];
    if (typeof value === 'string' && /^[a-zA-Z0-9:_-]{3,128}$/.test(value)) return value;
    if (this.allowDemoIdentity) return 'demo-user';
    throw new AppError('AUTH_REQUIRED', 'Authentication is required.', 401);
  }
}
