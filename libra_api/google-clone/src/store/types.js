// Modern State Management Types and Constants

export const ACTION_TYPES = {
  // Search Actions
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  CLEAR_SEARCH_TERM: 'CLEAR_SEARCH_TERM',
  
  // Results Actions
  SET_NUM_RESULTS: 'SET_NUM_RESULTS',
  
  // Settings Actions
  SET_OPENAI_KEY: 'SET_OPENAI_KEY',
  SET_GPT_MODEL: 'SET_GPT_MODEL',
  
  // Error Actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // History Actions
  ADD_HISTORY: 'ADD_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  SET_HISTORY: 'SET_HISTORY',
  
  // UI Actions
  SET_LOADING: 'SET_LOADING',
  SET_SELECTED_TAB: 'SET_SELECTED_TAB',
  
  // Batch Actions
  RESET_STATE: 'RESET_STATE',
  HYDRATE_STATE: 'HYDRATE_STATE',
};

// Default state configuration
export const DEFAULT_STATE = {
  // Search state
  term: null,
  numResults: 5,
  
  // Settings state
  openAIKey: 'sk-',
  gptModel: 'gpt-4o-mini',
  
  // Error state
  error: null,
  
  // History state
  history: [],
  
  // UI state
  loading: false,
  selectedTab: 'All',
  
  // Metadata
  lastUpdated: Date.now(),
};

// Local storage keys
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'libra_search_history',
  OPENAI_KEY: 'libra_openai_key',
  GPT_MODEL: 'libra_gpt_model',
  NUM_RESULTS: 'libra_num_results',
  APP_STATE: 'libra_app_state',
};

// Action payload types (for better development experience)
export const createAction = (type, payload = {}) => ({
  type,
  payload,
  timestamp: Date.now(),
});
