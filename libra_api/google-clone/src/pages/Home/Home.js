import React from "react";
import { Link } from "react-router-dom";

import Search from "../../components/Search/Search";

import AppsIcon from "@material-ui/icons/Apps";
import { Avatar } from "@material-ui/core";
import { Slider } from "@material-ui/core";
import { actionTypes } from "../../reducer";
import { useStateValue } from "../../StateContext";

import "./Home.css";

function Home() {
  const [{ _, numResults }, dispatch] = useStateValue();

  const onNumResultsChange = (event, value) => {
    dispatch({
      type: actionTypes.SET_NUM_RESULTS,
      numResults: value,
    });
  };

  return (
    <div className="home">
      <div className="home__header">
        {/* <div className="home__headerLeft">
                    <Link to="/about">About</Link>
                </div> */}
        {/* <div className="home__headerRight">
                    <Link to="/gmail">Gmail</Link>
                    <Link to="/images">Images</Link>
                    <AppsIcon />
                    <Avatar />
                </div> */}
      </div>

      <div className="home__body">
        <img src="logo.png" alt="Logo" />

        <div className="home__inputContainer">
          <Search hideButtons />
        </div>

        <Slider
          style={{ width: "65vh", margin: "0 auto" }}
          aria-label="K"
          defaultValue={numResults}
          onChangeCommitted={onNumResultsChange}
          // getAriaValueText={valuetext}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={10}
        />
      </div>
    </div>
  );
}

export default Home;
