import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Search from "../../components/Search/Search";

import SettingsIcon from "@material-ui/icons/Settings";
import { Slider } from "@material-ui/core";
import { actionTypes } from "../../reducer";
import { useStateValue } from "../../StateContext";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import "./Home.css";

function Home() {
  const [{ numResults, openAIKey }, dispatch] = useStateValue();
  const [key, setKey] = useState(openAIKey || ""); // will be initialized with the current value of the key in the context
  const [open, setOpen] = useState(false);

  const handleKeyChange = event => {
    setKey(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setKey(openAIKey); // reset the key state to the current value in the context
    setOpen(false);
  };

  const handleSave = () => {
    dispatch({
      type: actionTypes.SET_OPENAI_KEY,
      openAIKey: key,
    });
    // Save the OpenAI key to local storage
    localStorage.setItem("openAIKey", key);
    setOpen(false);
  };

  const onNumResultsChange = (event, value) => {
    dispatch({
      type: actionTypes.SET_NUM_RESULTS,
      numResults: value,
    });
  };

  useEffect(() => {
    // Load the OpenAI key from local storage when the component mounts
    const savedKey = localStorage.getItem("openAIKey");
    if (savedKey) {
      setKey(savedKey);
      dispatch({
        type: actionTypes.SET_OPENAI_KEY,
        openAIKey: savedKey,
      });
    }

    // Clear error when Home component mounts
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, [dispatch]);

  return (
    <div className="home">
      <div className="home__header">
        <div className="home__headerRight">
          <Link to="#" onClick={handleClickOpen}>
            <SettingsIcon />
          </Link>
        </div>
        {/* <div className="home__headerRight">
                    <Link to="/gmail">Gmail</Link>
                    <Link to="/images">Images</Link>
                    <AppsIcon />
                    <Avatar />
                </div> */}
      </div>

      <div className="home__body">
        <img src="logo2.png" alt="Logo" />
        <div className="home__inputContainer">
          <Search hideButtons />
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter your OpenAI key:</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            defaultValue={openAIKey}
            id="key"
            label="OpenAI Key"
            type="text"
            onChange={handleKeyChange}
            fullWidth
          />

          <DialogContentText>Please select K</DialogContentText>
          <Slider
            style={{ width: "50vh", margin: "0 auto" }}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Home;
