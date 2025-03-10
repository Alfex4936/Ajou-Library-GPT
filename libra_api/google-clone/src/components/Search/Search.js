// Search.js
import React, { useEffect, useState } from "react"; // import useEffect
import { useNavigate } from "react-router-dom";
import { useStateValue } from "../../StateContext";
import { actionTypes } from "../../reducer";

import { Button } from "@material-ui/core";
import GraphicEqIcon from "@material-ui/icons/GraphicEq";
import MicIcon from "@material-ui/icons/Mic";
import SearchIcon from "@material-ui/icons/Search";

import { useVoice } from "../../hooks/useVoice";

import "./Search.css";

function Search({ hideButtons = false, loading = false }) {
  const [{ term, error }, dispatch] = useStateValue();
  const { text, listen, voiceSupported, isListening } = useVoice();

  const [input, setInput] = useState(term || "");
  const [maxLength, setMaxLength] = useState(50); 

  const navigate = useNavigate();

  // update the input state when term changes
  useEffect(() => {
    setInput(term);
  }, [term]);

  // update the input state when voice input comes
  useEffect(() => {
    if (text !== "") {

      setInput(text);
    }
  }, [text]);

  const search = e => {
    e.preventDefault();

    if (loading) {
      return; // Don't perform search while loading
    }

    // console.log("You hit the search button >>", input);

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

  const handleInputChange = (e) => {
    if (e.target.value.length <= maxLength) {
      setInput(e.target.value);
    } else {
      // console.log(`Input length exceeded the limit of ${maxLength} characters.`);
      alert(`Maximum input length is ${maxLength} characters.`);
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
        <input
          value={input}
          onChange={handleInputChange} // Use handleInputChange to control input length
          maxLength={maxLength} // Set the maxLength attribute
          placeholder={`Enter search term (max ${maxLength} characters)`} // Optional placeholder to indicate limit
        />
        <MicIcon
          onClick={voiceSupported ? listen : undefined}
          style={{
            display: isListening ? "none" : "inline",
            cursor: "pointer",
          }}
        />
        <GraphicEqIcon
          onClick={voiceSupported ? listen : undefined}
          style={{ display: isListening ? "inline" : "none" }}
        />
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
