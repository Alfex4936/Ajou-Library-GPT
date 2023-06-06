import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Search from "../../components/Search/Search";
import History from "../../components/History/History";

import SettingsIcon from "@material-ui/icons/Settings";
import HistoryIcon from "@material-ui/icons/History";
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

import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import "./Home.css";

function Home() {
  const [{ numResults, openAIKey, history, model }, dispatch] = useStateValue();
  const [key, setKey] = useState(openAIKey || ""); // will be initialized with the current value of the key in the context
  const [gptModel, setGptModel] = useState(model || "gpt-4");
  const [open, setOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const handleClickOpenHistory = () => {
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
  };

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
    dispatch({
      type: actionTypes.SET_GPT_MODEL,
      model: gptModel,
    });
    // Save the OpenAI key to local storage
    localStorage.setItem("openAIKey", key);
    localStorage.setItem("gptModel", gptModel);
    setOpen(false);
  };

  const onNumResultsChange = (event, value) => {
    dispatch({
      type: actionTypes.SET_NUM_RESULTS,
      numResults: value,
    });
  };

  const handleModelChange = event => {
    setGptModel(event.target.value);
  };

  useEffect(() => {
    // Get the history from localStorage and parse it back into an array
    const savedHistory =
      JSON.parse(localStorage.getItem("searchHistory")) || [];
    // Update the state with the loaded history
    dispatch({ type: actionTypes.SET_HISTORY, history: savedHistory });
  }, [dispatch]);

  useEffect(() => {
    // Get the model from localStorage
    const GPT = localStorage.getItem("gptModel");
    // Update the state with the loaded history
    if (GPT) {
      setGptModel(GPT);
      dispatch({
        type: actionTypes.SET_GPT_MODEL,
        model: GPT,
      });
    }
  }, [dispatch]);

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
        <div className="home__headerLeft">
          <Link to="#" onClick={handleClickOpen}>
            <SettingsIcon />
          </Link>
        </div>
        <div className="home__headerRight">
          <Link to="#" onClick={handleClickOpenHistory}>
            <HistoryIcon />
          </Link>
        </div>
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
          <DialogContentText>
            Please enter your OpenAI key (GPT-4 preferable):
          </DialogContentText>
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

          <DialogContentText>Please choose GPT model: </DialogContentText>
          <Select native value={gptModel} onChange={handleModelChange}>
            <option value={"gpt-4"}>gpt-4</option>
            <option value={"gpt-3.5-turbo"}>gpt-3.5-turbo</option>
          </Select>

          <DialogContentText>Please select K: </DialogContentText>
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

      <Dialog
        fullWidth
        maxWidth="md"
        open={openHistory}
        onClose={handleCloseHistory}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Search History</DialogTitle>
        <DialogContent style={{ maxHeight: "60vh", maxWidth: "80vw" }}>
          <History searchHistory={history} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Home;
