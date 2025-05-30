import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useLibraState } from "../../store";

import ClearIcon from "@mui/icons-material/Clear";
import ErrorIcon from "@mui/icons-material/Error";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import { Alert, Button, Collapse, InputAdornment, OutlinedInput, Paper } from "@mui/material";

import { useVoice } from "../../hooks/useVoice";

import "./Search.css";

function Search({ hideButtons = false, loading = false }) {
  const { t } = useTranslation();
  const { term, error, setSearchTerm } = useLibraState();
  const { text, listen, voiceSupported, isListening } = useVoice();

  const [input, setInput] = useState(term || "");
  const maxLength = 50;
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setInput(term || "");
  }, [term]);

  useEffect(() => {
    if (text !== "") {
      setInput(text || "");
      // Clear any existing errors when voice input is received
      setLocalError("");
      setShowError(false);
    }
  }, [text]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setLocalError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const showErrorMessage = (message) => {
    setLocalError(message);
    setShowError(true);
  };

  const clearError = () => {
    setLocalError("");
    setShowError(false);
  };

  const search = e => {
    e.preventDefault();

    if (loading) {
      return;
    }

    // Clear any existing errors first
    clearError();

    // Check if input is empty
    if (!input || input.trim() === "") {
      showErrorMessage(t('search.errorEmpty'));
      return;
    }

    // Check if input exceeds max length (shouldn't happen with controlled input, but good fallback)
    if (input.length > maxLength) {
      showErrorMessage(t('search.errorTooLong', { maxLength }));
      return;
    }

    setSearchTerm(input);

    if (!error) {
      navigate("/search");
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Clear errors when user starts typing
    if (localError) {
      clearError();
    }
    
    if (newValue.length <= maxLength) {
      setInput(newValue);
    } else {
      // Show specific error for exceeding max length
      showErrorMessage(t('search.errorTooLong', { maxLength }));
    }
  };

  const clearInput = () => {
    setInput("");
    clearError();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search(e);
    }
  };

  return (
    <div className="search">
      <form className="search__form" onSubmit={search}>
        {/* Error Alert */}
        <Collapse in={showError}>
          <Alert 
            severity="error" 
            onClose={clearError}
            icon={<ErrorIcon />}
            sx={{ 
              marginBottom: 2,
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            {localError}
          </Alert>
        </Collapse>

        <Paper 
          className={`search__inputContainer ${isFocused ? 'search__inputContainer--focused' : ''} ${loading ? 'search__inputContainer--loading' : ''} ${showError ? 'search__inputContainer--error' : ''}`}
          elevation={isFocused ? 8 : 2}
        >
          <div className="search__inputWrapper">
            <SearchIcon 
              className="search__inputIcon search__inputIcon--search"
              onClick={search}
            />
            
            <OutlinedInput
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t('search.placeholder')}
              className="search__input"
              disabled={loading}
              maxLength={maxLength}
              endAdornment={
                <InputAdornment position="end" className="search__inputActions">
                  {input && !loading && (
                    <ClearIcon 
                      className="search__inputIcon search__inputIcon--clear"
                      onClick={clearInput}
                    />
                  )}
                  
                  {voiceSupported && (
                    <>
                      {!isListening ? (
                        <MicIcon
                          className="search__inputIcon search__inputIcon--mic"
                          onClick={listen}
                        />
                      ) : (
                        <GraphicEqIcon
                          className="search__inputIcon search__inputIcon--listening"
                          onClick={listen}
                        />
                      )}
                    </>
                  )}
                </InputAdornment>
              }
            />
          </div>
          
          {loading && <div className="search__loadingBar" />}
        </Paper>

        {!hideButtons && (
          <div className="search__buttons">
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !input.trim()}
              className="search__button search__button--primary"
              startIcon={<SearchIcon />}
            >
              {loading ? t('search.searching') : t('search.button')}
            </Button>
            
            <Button
              variant="outlined"
              disabled={loading}
              className="search__button search__button--secondary"
              onClick={() => {
                // Random search functionality could be added here
                console.log("I'm Feeling Lucky clicked");
              }}
            >
              I'm Feeling Lucky
            </Button>
          </div>
        )}

        <div className="search__info">
          <span className="search__counter">
            {input?.length || 0}/{maxLength}
          </span>
          
          {voiceSupported && (
            <span className="search__voiceHint">
              {isListening ? t('search.searching') : t('search.voice')}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default Search;
