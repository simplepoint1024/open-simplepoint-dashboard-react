import { getInstance } from '@module-federation/runtime';
import type { Remote } from '@/fetches/routes';

export function registerRemotesIfAny(remotes: Remote[]) {
  if (!remotes || remotes.length === 0) return;
  const mf = getInstance();
  if (!mf) return;
  mf.registerRemotes(remotes);
}

