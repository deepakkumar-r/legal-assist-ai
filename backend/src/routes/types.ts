import type { DocumentRepository } from '../ports/documentRepository.js';
import type { IdentityProvider } from '../ports/identity.js';
import type { MalwareScanner } from '../ports/malwareScanner.js';
import type { LegalService } from '../services/legal.js';

export interface RouteDependencies {
  documents: DocumentRepository;
  identity: IdentityProvider;
  legal: LegalService;
  scanner: MalwareScanner;
}
