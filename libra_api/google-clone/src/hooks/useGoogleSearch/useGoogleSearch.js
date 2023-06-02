import { useState, useEffect } from "react";
import { useStateValue } from "../../StateContext";
import { actionTypes } from "../../reducer";

const useLibraSearch = term => {
  const [{ numResults, openAIKey }, dispatch] = useStateValue();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      fetch("/api/recommend/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          k: numResults,
          api: openAIKey,
          interest: `${term}`,
        }),
      })
        .then(response => response.json())
        .then(result => {
          setData(result);
          setLoading(false);
        })
        .catch(error => {
          dispatch({
            type: actionTypes.SET_ERROR,
            error: error.message,
          });
          console.error("Error:", error);
          setLoading(false);
        });
    };

    fetchData();
  }, [term, numResults, openAIKey]);

  return { data, loading };
};

export default useLibraSearch;
