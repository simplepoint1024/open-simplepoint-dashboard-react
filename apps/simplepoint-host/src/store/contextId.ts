import { getStoredContextId, getStoredTenantId, setStoredContextId } from '@simplepoint/shared/api/contextId';

export type ContextId = string;

const EVENT_NAME = 'sp-set-context-id';

export function getContextId(): ContextId | undefined {
  return getStoredContextId(getStoredTenantId());
}

export function setContextId(contextId: ContextId | undefined) {
  setStoredContextId(contextId, getStoredTenantId());

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: contextId }));
  } catch {}
}

export function onContextIdChange(handler: (contextId?: ContextId) => void) {
  const listener = (e: Event) => {
    const contextId = (e as CustomEvent).detail as ContextId | undefined;
    handler(contextId);
  };
  window.addEventListener(EVENT_NAME, listener as EventListener);
  return () => window.removeEventListener(EVENT_NAME, listener as EventListener);
}
