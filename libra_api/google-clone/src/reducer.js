export const initialState = {
  term: null,
  numResults: 5, // set a default value
};

export const actionTypes = {
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_NUM_RESULTS: "SET_NUM_RESULTS",
};

const reducer = (state, action) => {
  console.log(action); // Good for debugging

  switch (action.type) {
    case actionTypes.SET_SEARCH_TERM:
      return {
        ...state,
        term: action.term,
      };
    case actionTypes.SET_NUM_RESULTS:
      return {
        ...state,
        numResults: action.numResults,
      };
    default:
      return state;
  }
};

export default reducer;
