import { useState, useEffect } from "react";
import { useStateValue } from "../../StateContext";

const useLibraSearch = term => {
  const [{ numResults }] = useStateValue();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      fetch("/api/recommend/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          k: numResults,
          api: process.env.REACT_APP_API_KEY,
          interest: `${term}`,
        }),
      })
        .then(response => response.json())
        .then(result => {
          setData(result);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error:", error);
          setLoading(false);
        });
    };

    fetchData();
  }, [term, numResults]);

  return { data, loading };
};

export default useLibraSearch;
