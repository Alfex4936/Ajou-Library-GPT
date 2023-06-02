import React, { useState, useEffect } from "react"; // import useEffect
import { useHistory } from "react-router-dom";
import { useStateValue } from "../../StateContext";
import { actionTypes } from "../../reducer";

import SearchIcon from "@material-ui/icons/Search";
import MicIcon from "@material-ui/icons/Mic";
import { Button } from "@material-ui/core";

import "./Search.css";

function Search({ hideButtons = false }) {
  const [{ term, error }, dispatch] = useStateValue();

  const [input, setInput] = useState(term || "");

  const history = useHistory();

  // update the input state when term changes
  useEffect(() => {
    setInput(term);
  }, [term]);

  const search = e => {
    e.preventDefault();

    console.log("You hit the search button >>", input);

    dispatch({
      type: actionTypes.SET_SEARCH_TERM,
      term: input,
    });

    if (!error) {
      history.push("/search");
    }
  };

  return (
    <form className="search">
      <div className="search__input">
        <SearchIcon
          style={{ cursor: "pointer" }}
          onClick={search}
          className="search__inputIcon"
        />
        <input value={input} onChange={e => setInput(e.target.value)} />
        <MicIcon />
      </div>

      {!hideButtons ? (
        <div className="search__buttons">
          <Button type="submit" onClick={search} variant="outlined">
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
          >
            Libra Search
          </Button>
          <Button className="search__buttonHidden" variant="outlined">
            I'm Feeling Lucky
          </Button>
        </div>
      )}
    </form>
  );
}

export default Search;
