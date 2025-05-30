// Main store index - exports all state management utilities

// Core store
export * as actions from './actions.js';
export { appReducer, getInitialState, storageHelper } from './reducer.js';
export { ACTION_TYPES, DEFAULT_STATE, STORAGE_KEYS, createAction } from './types.js';

// Context and hooks
export {
    AppStateProvider,
    StateProvider, useAppDispatch, // Legacy compatibility
    useAppState, useHistoryActions, useHistoryState, useLibraState, useSearchActions, // Legacy compatibility
    useSearchState, useSettingsActions, useSettingsState, useStateValue, useUIActions, useUIState
} from './context.js';

// Re-export everything for convenience
export * from './actions.js';
export * from './context.js';
export * from './reducer.js';
export * from './types.js';

