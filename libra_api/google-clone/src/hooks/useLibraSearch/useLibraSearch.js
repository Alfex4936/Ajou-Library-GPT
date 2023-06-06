import { useState, useEffect } from "react";
import { useStateValue } from "../../StateContext";
import { actionTypes } from "../../reducer";

const useLibraSearch = term => {
  const [{ numResults, openAIKey, model }, dispatch] = useStateValue();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect for error
  useEffect(() => {
    if (error) {
      dispatch({ type: actionTypes.SET_ERROR, error: error });
    }
  }, [error, dispatch]);

  // useEffect for fetchData
  useEffect(() => {
    if (!term || !openAIKey) {
      setError("Invalid search query or OpenAI Key");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(process.env.REACT_APP_API_ADDRESS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            k: numResults,
            api: openAIKey,
            interest: `${term}`,
            model: model,
          }),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const result = await response.json();
        setData(result);
        dispatch({ type: actionTypes.ADD_HISTORY, history: term });
        setError(null); // clear any previous error
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [term, numResults, openAIKey]);

  return { data, loading, error };
};

export default useLibraSearch;
