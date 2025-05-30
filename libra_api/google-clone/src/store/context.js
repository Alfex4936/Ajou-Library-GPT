// Modern Context Provider with React 18 patterns and performance optimizations

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import * as actions from './actions.js';
import { appReducer, getInitialState } from './reducer.js';

// Create separate contexts for state and dispatch to prevent unnecessary re-renders
const StateContext = createContext();
const DispatchContext = createContext();

// Custom hook to access state
export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Custom hook to access dispatch
export const useAppDispatch = () => {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  return context;
};

// Custom hook to access both state and dispatch (for compatibility)
export const useStateValue = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  return [state, dispatch];
};

// Performance-optimized provider component
export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);
  const stateRef = useRef(state);
  
  // Update ref when state changes for debugging/dev tools
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Memoize state to prevent unnecessary re-renders
  const memoizedState = useMemo(() => state, [state]);

  // Memoize dispatch (it's stable, but for consistency)
  const memoizedDispatch = useMemo(() => dispatch, [dispatch]);

  // Development-only: log state changes in dev mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🏪 App State Updated:', state);
    }
  }, [state]);

  return (
    <StateContext.Provider value={memoizedState}>
      <DispatchContext.Provider value={memoizedDispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

// Custom hooks for specific state slices (performance optimization)
export const useSearchState = () => {
  const state = useAppState();
  return useMemo(() => ({
    term: state.term,
    loading: state.loading,
    error: state.error,
    numResults: state.numResults,
  }), [state.term, state.loading, state.error, state.numResults]);
};

export const useHistoryState = () => {
  const state = useAppState();
  return useMemo(() => ({
    history: state.history,
  }), [state.history]);
};

export const useSettingsState = () => {
  const state = useAppState();
  return useMemo(() => ({
    openAIKey: state.openAIKey,
    gptModel: state.gptModel,
    numResults: state.numResults,
  }), [state.openAIKey, state.gptModel, state.numResults]);
};

export const useUIState = () => {
  const state = useAppState();
  return useMemo(() => ({
    selectedTab: state.selectedTab,
    loading: state.loading,
    error: state.error,
  }), [state.selectedTab, state.loading, state.error]);
};

// Action hooks for cleaner component code
export const useSearchActions = () => {
  const dispatch = useAppDispatch();
  
  const setSearchTerm = useCallback((term) => dispatch(actions.setSearchTerm(term)), [dispatch]);
  const clearSearchTerm = useCallback(() => dispatch(actions.clearSearchTerm()), [dispatch]);
  const performSearch = useCallback((term) => {
    dispatch(actions.setLoading(true));
    dispatch(actions.clearError());
    dispatch(actions.setSearchTerm(term));
  }, [dispatch]);
  const handleSearchError = useCallback((error) => {
    dispatch(actions.setError(error));
    dispatch(actions.setLoading(false));
  }, [dispatch]);
  const handleSearchSuccess = useCallback(() => {
    dispatch(actions.clearError());
    dispatch(actions.setLoading(false));
  }, [dispatch]);
  
  return useMemo(() => ({
    setSearchTerm,
    clearSearchTerm,
    performSearch,
    handleSearchError,
    handleSearchSuccess,
  }), [setSearchTerm, clearSearchTerm, performSearch, handleSearchError, handleSearchSuccess]);
};

export const useHistoryActions = () => {
  const dispatch = useAppDispatch();
  
  const addToHistory = useCallback((term) => dispatch(actions.addToHistory(term)), [dispatch]);
  const clearHistory = useCallback(() => dispatch(actions.clearHistory()), [dispatch]);
  const setHistory = useCallback((history) => dispatch(actions.setHistory(history)), [dispatch]);
  
  return useMemo(() => ({
    addToHistory,
    clearHistory,
    setHistory,
  }), [addToHistory, clearHistory, setHistory]);
};

export const useSettingsActions = () => {
  const dispatch = useAppDispatch();
  
  const setOpenAIKey = useCallback((key) => dispatch(actions.setOpenAIKey(key)), [dispatch]);
  const setGptModel = useCallback((model) => dispatch(actions.setGptModel(model)), [dispatch]);
  const setNumResults = useCallback((num) => dispatch(actions.setNumResults(num)), [dispatch]);
  
  return useMemo(() => ({
    setOpenAIKey,
    setGptModel,
    setNumResults,
  }), [setOpenAIKey, setGptModel, setNumResults]);
};

export const useUIActions = () => {
  const dispatch = useAppDispatch();
  
  const setSelectedTab = useCallback((tab) => dispatch(actions.setSelectedTab(tab)), [dispatch]);
  const setLoading = useCallback((loading) => dispatch(actions.setLoading(loading)), [dispatch]);
  const setError = useCallback((error) => dispatch(actions.setError(error)), [dispatch]);
  const clearError = useCallback(() => dispatch(actions.clearError()), [dispatch]);
  
  return useMemo(() => ({
    setSelectedTab,
    setLoading,
    setError,
    clearError,
  }), [setSelectedTab, setLoading, setError, clearError]);
};

// Combined hook for common operations
export const useLibraState = () => {
  const searchState = useSearchState();
  const searchActions = useSearchActions();
  const uiState = useUIState();
  const uiActions = useUIActions();
  
  return useMemo(() => ({
    // State
    ...searchState,
    ...uiState,
    
    // Actions
    ...searchActions,
    ...uiActions,
  }), [searchState, searchActions, uiState, uiActions]);
};

// Legacy compatibility (for gradual migration)
export const StateProvider = AppStateProvider;
