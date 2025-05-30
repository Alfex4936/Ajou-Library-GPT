// Modern Action Creators with React 18 patterns

import { ACTION_TYPES, createAction } from './types.js';

// Search Actions
export const setSearchTerm = (term) => createAction(ACTION_TYPES.SET_SEARCH_TERM, { term });

export const clearSearchTerm = () => createAction(ACTION_TYPES.CLEAR_SEARCH_TERM);

// Results Actions
export const setNumResults = (numResults) => createAction(ACTION_TYPES.SET_NUM_RESULTS, { numResults });

// Settings Actions
export const setOpenAIKey = (openAIKey) => createAction(ACTION_TYPES.SET_OPENAI_KEY, { openAIKey });

export const setGptModel = (model) => createAction(ACTION_TYPES.SET_GPT_MODEL, { model });

// Error Actions
export const setError = (error) => createAction(ACTION_TYPES.SET_ERROR, { error });

export const clearError = () => createAction(ACTION_TYPES.CLEAR_ERROR);

// History Actions
export const addToHistory = (term) => createAction(ACTION_TYPES.ADD_HISTORY, { term });

export const clearHistory = () => createAction(ACTION_TYPES.CLEAR_HISTORY);

export const setHistory = (history) => createAction(ACTION_TYPES.SET_HISTORY, { history });

// UI Actions
export const setLoading = (loading) => createAction(ACTION_TYPES.SET_LOADING, { loading });

export const setSelectedTab = (tab) => createAction(ACTION_TYPES.SET_SELECTED_TAB, { tab });

// Batch Actions
export const resetState = () => createAction(ACTION_TYPES.RESET_STATE);

export const hydrateState = (state) => createAction(ACTION_TYPES.HYDRATE_STATE, { state });

// Compound Actions (handle multiple related actions)
export const performSearch = (term) => (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  dispatch(setSearchTerm(term));
  // Note: setLoading(false) should be called after search completes
};

export const handleSearchError = (error) => (dispatch) => {
  dispatch(setError(error));
  dispatch(setLoading(false));
};

export const handleSearchSuccess = () => (dispatch) => {
  dispatch(clearError());
  dispatch(setLoading(false));
};

// Utility functions for common operations
export const searchActions = {
  setSearchTerm,
  clearSearchTerm,
  performSearch,
  handleSearchError,
  handleSearchSuccess,
};

export const settingsActions = {
  setOpenAIKey,
  setGptModel,
  setNumResults,
};

export const historyActions = {
  addToHistory,
  clearHistory,
  setHistory,
};

export const uiActions = {
  setLoading,
  setSelectedTab,
  setError,
  clearError,
};

export const batchActions = {
  resetState,
  hydrateState,
};
