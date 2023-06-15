import { actionTypes } from "./reducer";

export const setSearchTerm = term => ({
  type: actionTypes.SET_SEARCH_TERM,
  term,
});

export const setNumResults = numResults => ({
  type: actionTypes.SET_NUM_RESULTS,
  numResults,
});
export const setOpenAIKey = openAIKey => ({
  type: actionTypes.SET_OPENAI_KEY,
  openAIKey,
});

export const setGptModel = model => ({
  type: actionTypes.SET_GPT_MODEL,
  model,
});

export const clearHistory = () => ({
  type: actionTypes.CLEAR_HISTORY,
});

export const setError = error => ({
  type: actionTypes.SET_ERROR,
  error,
});
