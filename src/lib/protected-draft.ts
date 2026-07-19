export type ProtectedDraft<T> = {
  editing: boolean;
  persisted: T;
  draft: T;
};

export function createProtectedDraft<T>(value: T): ProtectedDraft<T> {
  return { editing: false, persisted: value, draft: value };
}

export function beginProtectedEdit<T>(state: ProtectedDraft<T>): ProtectedDraft<T> {
  return { ...state, editing: true, draft: state.persisted };
}

export function updateProtectedDraft<T>(state: ProtectedDraft<T>, draft: T): ProtectedDraft<T> {
  return { ...state, draft };
}

export function discardProtectedDraft<T>(state: ProtectedDraft<T>): ProtectedDraft<T> {
  return { ...state, editing: false, draft: state.persisted };
}

export function saveProtectedDraft<T>(state: ProtectedDraft<T>): ProtectedDraft<T> {
  return { editing: false, persisted: state.draft, draft: state.draft };
}
