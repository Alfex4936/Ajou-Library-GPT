// Modern Reducer with Immer-like updates and optimizations

import { createHistoryItem, migrateHistoryData } from '../utils/timeUtils.js';
import { ACTION_TYPES, DEFAULT_STATE, STORAGE_KEYS } from './types.js';

// Helper function for localStorage operations
const storageHelper = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

// Initialize state with localStorage data
const getInitialState = () => {
  const savedHistory = storageHelper.get(STORAGE_KEYS.SEARCH_HISTORY, []);
  const migratedHistory = migrateHistoryData(savedHistory);
  const savedOpenAIKey = storageHelper.get(STORAGE_KEYS.OPENAI_KEY, DEFAULT_STATE.openAIKey);
  const savedGptModel = storageHelper.get(STORAGE_KEYS.GPT_MODEL, DEFAULT_STATE.gptModel);
  const savedNumResults = storageHelper.get(STORAGE_KEYS.NUM_RESULTS, DEFAULT_STATE.numResults);
  
  return {
    ...DEFAULT_STATE,
    history: migratedHistory,
    openAIKey: savedOpenAIKey,
    gptModel: savedGptModel,
    numResults: savedNumResults,
    lastUpdated: Date.now(),
  };
};

// Modern reducer with immutable updates
const appReducer = (state, action) => {
  const { type, payload = {}, timestamp } = action;
  
  // Create new state object (immutable update)
  const newState = { ...state };
  
  switch (type) {    case ACTION_TYPES.SET_SEARCH_TERM: {
      newState.term = payload.term;
      newState.error = null; // Clear error when new search starts
      
      // Add to history if valid term
      if (payload.term && payload.term.trim()) {
        const trimmedTerm = payload.term.trim();
        const newHistoryItem = createHistoryItem(trimmedTerm);
        
        // Remove existing item with same term, add new one at the beginning
        const updatedHistory = [
          newHistoryItem,
          ...newState.history.filter(item => 
            (typeof item === 'string' ? item : item.term) !== trimmedTerm
          )
        ].slice(0, 20); // Keep only last 20 searches
        
        newState.history = updatedHistory;
        storageHelper.set(STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
      }
      break;
    }
    
    case ACTION_TYPES.CLEAR_SEARCH_TERM: {
      newState.term = null;
      newState.error = null;
      break;
    }
    
    case ACTION_TYPES.SET_NUM_RESULTS: {
      newState.numResults = Math.max(1, Math.min(50, payload.numResults || DEFAULT_STATE.numResults));
      storageHelper.set(STORAGE_KEYS.NUM_RESULTS, newState.numResults);
      break;
    }
    
    case ACTION_TYPES.SET_OPENAI_KEY: {
      newState.openAIKey = payload.openAIKey || DEFAULT_STATE.openAIKey;
      storageHelper.set(STORAGE_KEYS.OPENAI_KEY, newState.openAIKey);
      break;
    }
    
    case ACTION_TYPES.SET_GPT_MODEL: {
      newState.gptModel = payload.model || DEFAULT_STATE.gptModel;
      storageHelper.set(STORAGE_KEYS.GPT_MODEL, newState.gptModel);
      break;
    }
    
    case ACTION_TYPES.SET_ERROR: {
      newState.error = payload.error;
      break;
    }
    
    case ACTION_TYPES.CLEAR_ERROR: {
      newState.error = null;
      break;
    }
      case ACTION_TYPES.ADD_HISTORY: {
      if (payload.term && payload.term.trim()) {
        const trimmedTerm = payload.term.trim();
        const newHistoryItem = createHistoryItem(trimmedTerm);
        
        // Remove existing item with same term, add new one at the beginning
        const updatedHistory = [
          newHistoryItem,
          ...newState.history.filter(item => 
            (typeof item === 'string' ? item : item.term) !== trimmedTerm
          )
        ].slice(0, 20);
        
        newState.history = updatedHistory;
        storageHelper.set(STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
      }
      break;
    }
    
    case ACTION_TYPES.CLEAR_HISTORY: {
      newState.history = [];
      storageHelper.remove(STORAGE_KEYS.SEARCH_HISTORY);
      break;
    }
    
    case ACTION_TYPES.SET_HISTORY: {
      newState.history = Array.isArray(payload.history) ? payload.history : [];
      storageHelper.set(STORAGE_KEYS.SEARCH_HISTORY, newState.history);
      break;
    }
    
    case ACTION_TYPES.SET_LOADING: {
      newState.loading = Boolean(payload.loading);
      break;
    }
    
    case ACTION_TYPES.SET_SELECTED_TAB: {
      newState.selectedTab = payload.tab || DEFAULT_STATE.selectedTab;
      break;
    }
    
    case ACTION_TYPES.RESET_STATE: {
      Object.assign(newState, getInitialState());
      break;
    }
    
    case ACTION_TYPES.HYDRATE_STATE: {
      if (payload.state && typeof payload.state === 'object') {
        Object.assign(newState, payload.state);
      }
      break;
    }
    
    default: {
      console.warn(`Unknown action type: ${type}`);
      return state;
    }
  }
  
  // Update timestamp for all actions
  newState.lastUpdated = timestamp || Date.now();
  
  return newState;
};

export { appReducer, getInitialState, storageHelper };

