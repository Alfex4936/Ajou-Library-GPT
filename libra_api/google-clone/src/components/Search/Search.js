import React, { useState, useEffect } from "react"; // import useEffect
import { useNavigate } from "react-router-dom";
import { useStateValue } from "../../StateContext";
import { actionTypes } from "../../reducer";

import SearchIcon from "@material-ui/icons/Search";
import MicIcon from "@material-ui/icons/Mic";
import { Button } from "@material-ui/core";

import "./Search.css";

function Search({ hideButtons = false, loading = false }) {
  const [{ term, error }, dispatch] = useStateValue();

  const [input, setInput] = useState(term || "");

  const navigate = useNavigate();

  // update the input state when term changes
  useEffect(() => {
    setInput(term);
  }, [term]);

  const search = e => {
    e.preventDefault();

    if (loading) {
      return; // Don't perform search while loading
    }

    console.log("You hit the search button >>", input);

    dispatch({
      type: actionTypes.SET_SEARCH_TERM,
      term: input,
    });

    if (input.trim() !== "") {
      // check if input isn't empty
      if (!error) {
        navigate("/search");
      }
    } else {
      // Optional: Show an alert or some error message to user
      alert("Search term cannot be empty.");
    }
  };

  return (
    <form className="search">
      <div className="search__input">
        <SearchIcon
          disabled={loading} // Disable the search button while loading
          style={{ cursor: "pointer" }}
          onClick={search}
          className="search__inputIcon"
        />
        <input value={input} onChange={e => setInput(e.target.value)} />
        <MicIcon />
      </div>

      {!hideButtons ? (
        <div className="search__buttons">
          <Button
            type="submit"
            onClick={search}
            variant="outlined"
            disabled={loading} // Disable the search button while loading
          >
            Libra 검색
          </Button>
          {/* <Button variant="outlined">I'm Feeling Lucky</Button> */}
        </div>
      ) : (
        <div className="search__buttons">
          <Button
            className="search__buttonHidden"
            type="submit"
            onClick={search}
            variant="outlined"
            disabled={loading} // Disable the search button while loading
          >
            Libra Search
          </Button>
          <Button
            className="search__buttonHidden"
            variant="outlined"
            disabled={loading} // Disable the search button while loading
          >
            I'm Feeling Lucky
          </Button>
        </div>
      )}
    </form>
  );
}

export default Search;
