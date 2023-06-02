import React, { useState } from "react";
import { Link } from "react-router-dom";

import Search from "../../components/Search/Search";

import AppsIcon from "@material-ui/icons/Apps";
import { Avatar } from "@material-ui/core";
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
  const [{ _, numResults, openAIKey, error }, dispatch] = useStateValue();
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
    setOpen(false);
  };

  const onNumResultsChange = (event, value) => {
    dispatch({
      type: actionTypes.SET_NUM_RESULTS,
      numResults: value,
    });
  };

  return (
    <div className="home">
      <div className="home__header">
        <div className="home__headerRight">
          <Link to="#" onClick={handleClickOpen}>
            Settings
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
