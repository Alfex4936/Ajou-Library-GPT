import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import History from "../../components/History/History";
import Search from "../../components/Search/Search";
import { actionTypes } from "../../reducer";
import { useStateValue } from "../../StateContext";

import IconButton from "@material-ui/core/IconButton";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import HistoryIcon from "@material-ui/icons/History";
import SettingsIcon from "@material-ui/icons/Settings";

import { Slider } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";


import "./Home.css";

const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? storedValue : defaultValue; // No JSON.parse
  });

  useEffect(() => {
    localStorage.setItem(key, state); // No JSON.stringify
  }, [key, state]);

  return [state, setState];
};

function Home() {
  const [{ numResults, history }, dispatch] = useStateValue();
  const [openAIKey, setOpenAIKey] = useLocalStorageState("openAIKey", 'sk-');
  const [gptModel, setGptModel] = useLocalStorageState("gptModel", 'gpt-4o-mini');
  const [open, setOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  // const [setMenuPayload] = useState("");
  // const [setMenuOpen] = useState(false);

  const handleClickOpenHistory = () => {
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
  };

  const handleKeyChange = useCallback(event => {
    setOpenAIKey(event.target.value);
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpenAIKey(openAIKey); // reset the key state to the current value in the context
    setOpen(false);
  };

  const handleSaveSettings = useCallback(() => {
    dispatch({
      type: actionTypes.SET_OPENAI_KEY,
      openAIKey,
    });
    dispatch({
      type: actionTypes.SET_GPT_MODEL,
      model: gptModel,
    });
    setOpen(false);
  }, [dispatch, openAIKey, gptModel]);

  const handleClearHistory = useCallback(() => {
    // Clear the search history from the state
    dispatch({ type: actionTypes.CLEAR_HISTORY });

    // Remove the search history from local storage
    localStorage.removeItem("searchHistory");

    // Close the history dialog
    handleCloseHistory();
  }, []);

  const onNumResultsChange = (event, value) => {
    dispatch({
      type: actionTypes.SET_NUM_RESULTS,
      numResults: value,
    });
  };

  // Tauri
  // useEffect(() => {
  //   const unlisten = listen("menu-event", e => {
  //     setMenuPayload(e.payload);
  //     setMenuOpen(true);
  //     if (e.payload === "clear-event") {
  //       handleClearHistory();
  //     }
  //   });

  //   return () => unlisten();
  // }, [handleClearHistory]);

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
      setOpenAIKey(savedKey);
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
        onClose={() => setOpen(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your OpenAI key (gpt-4o-mini preferable):
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
          <Select
            native
            value={gptModel}
            onChange={event => setGptModel(event.target.value)}
          >
            <option value={"gpt-4o-mini"}>gpt-4o-mini</option>
            <option value={"gpt-4o"}>gpt-4o</option>
          </Select>

          <DialogContentText>How many book recommendations: </DialogContentText>
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
          <Button onClick={handleSaveSettings} color="primary">
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
        <DialogTitle id="form-dialog-title">
          Search History
          <IconButton
            style={{ float: "right" }}
            onClick={() => setOpenHistory(false)}
          >
            <ClearAllIcon />
          </IconButton>
        </DialogTitle>
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
