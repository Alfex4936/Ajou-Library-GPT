import { useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';

import History from "../../components/History/History";
import LanguageSelector from "../../components/LanguageSelector";
import Search from "../../components/Search/Search";
import { useHistoryActions, useHistoryState, useSettingsActions, useSettingsState } from "../../store";

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import HistoryIcon from "@mui/icons-material/History";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Select from "@mui/material/Select";
import Slider from '@mui/material/Slider';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import "./Home.css";

function Home() {
  const { t } = useTranslation();
  const { numResults, openAIKey, gptModel } = useSettingsState();
  const { history } = useHistoryState();
  const { setNumResults, setOpenAIKey, setGptModel } = useSettingsActions();
  const { clearHistory } = useHistoryActions();
  const [open, setOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickOpenHistory = () => {
    setOpenHistory(true);
  };

  const handleCloseHistory = useCallback(() => {
    setOpenHistory(false);
  }, [setOpenHistory]);
  const handleKeyChange = useCallback(event => {
    setOpenAIKey(event.target.value);
  }, [setOpenAIKey]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpenAIKey(openAIKey);
    setOpen(false);
  };
  const handleSaveSettings = useCallback(() => {
    // These are already managed by useLocalStorageState, just close dialog
    setOpen(false);
  }, []);
  const handleClearHistory = useCallback(() => {
    clearHistory();
    localStorage.removeItem("searchHistory");
    handleCloseHistory();
  }, [clearHistory, handleCloseHistory]);
  const onNumResultsChange = (event, value) => {
    setNumResults(value);
  };
  // Remove these useEffect hooks as they're now handled by the new store system
  // The new store automatically loads from localStorage on initialization

  return (
    <div className="home">      {/* Header with elegant navigation */}
      <header className="home__header">
        <div className="home__brand">
          <LocalLibraryIcon className="home__brandIcon" />
          <a href="https://library.ajou.ac.kr/#/" target="_blank" rel="noopener noreferrer">
            <Typography variant="h6" className="home__brandText">
              {t('brand.ajouLibrary')}
            </Typography>
          </a>
        </div>

        <div className="home__headerActions">
          <LanguageSelector variant="compact" />
        </div>

        <nav className="home__navigation">
          <IconButton
            className="home__navButton"
            onClick={handleClickOpen}
            title={t('navigation.settings')}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            className="home__navButton"
            onClick={handleClickOpenHistory}
            title={t('navigation.history')}
          >
            <HistoryIcon />
          </IconButton>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="home__main">
        <div className="home__hero">
          <div className="home__heroContent">
            <div className="home__logoContainer">
              <div className="home__logoWrapper">
                <img src="logo-transparent.png" alt="Ajou Library Logo" className="home__logo" />
              </div>
            </div>
            <div className="home__titleSection">
              <Typography variant="h2" className="home__title">
                {t('app.title')}
              </Typography>
              <Typography variant="h5" className="home__subtitle">
                {t('app.subtitle')}
              </Typography>
              <Typography variant="body1" className="home__description">
                {t('app.description')}
              </Typography>
            </div>

            <div className="home__searchContainer">
              <Search hideButtons />
            </div>

            {/* Feature Cards */}
            <div className="home__features">
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Card className="home__featureCard">
                    <CardContent>
                      <MenuBookIcon className="home__featureIcon" />
                      <Typography variant="h6" className="home__featureTitle">
                        {t('features.smartSearch.title')}
                      </Typography>
                      <Typography variant="body2" className="home__featureDesc">
                        {t('features.smartSearch.description')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card className="home__featureCard">
                    <CardContent>
                      <AutoStoriesIcon className="home__featureIcon" />
                      <Typography variant="h6" className="home__featureTitle">
                        {t('features.rissDatabase.title')}
                      </Typography>
                      <Typography variant="body2" className="home__featureDesc">
                        {t('features.rissDatabase.description')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card className="home__featureCard">
                    <CardContent>
                      <LocalLibraryIcon className="home__featureIcon" />
                      <Typography variant="h6" className="home__featureTitle">
                        {t('features.libraryIntegration.title')}
                      </Typography>
                      <Typography variant="body2" className="home__featureDesc">
                        {t('features.libraryIntegration.description')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="settings-dialog-title"
        className="home__dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="settings-dialog-title" className="home__dialogTitle">
          <SettingsIcon className="home__dialogIcon" />
          {t('settings.title')}
        </DialogTitle>
        <DialogContent className="home__dialogContent">          <TextField
          autoFocus
          margin="dense"
          value={openAIKey}
          id="openai-key"
          label={t('settings.openaiKey')}
          type={showPassword ? 'text' : 'password'}
          onChange={handleKeyChange}
          fullWidth
          variant="outlined"
          className="home__textField"
          helperText={t('settings.openaiKeyHelper')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  aria-label={showPassword ? t('settings.hidePassword') : t('settings.showPassword')}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

          <div className="home__fieldGroup">
            <Typography variant="subtitle1" className="home__fieldLabel">
              {t('settings.gptModel')}
            </Typography>            <Select
              native
              value={gptModel}
              onChange={event => setGptModel(event.target.value)}
              variant="outlined"
              fullWidth
              className="home__select"
            >
              <option value="gpt-4o-mini">{t('settings.gptModelRecommended')}</option>
              <option value="gpt-4o">GPT-4o</option>
            </Select>
          </div>          <div className="home__fieldGroup">
            <Typography variant="subtitle1" className="home__fieldLabel">
              {t('settings.numResultsLabel', { count: numResults })}
            </Typography>
            <Slider
              value={numResults}
              onChange={onNumResultsChange}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={10}
              className="home__slider"
            />
          </div>

          <div className="home__fieldGroup">
            <LanguageSelector variant="full" showLabel={true} />
          </div>
        </DialogContent>        <DialogActions className="home__dialogActions">
          <Button onClick={handleCancel} className="home__dialogButton">
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleSaveSettings} variant="contained" className="home__dialogButton home__dialogButton--primary">
            {t('settings.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={openHistory}
        onClose={handleCloseHistory}
        aria-labelledby="history-dialog-title"
        className="home__dialog"
      >        <DialogTitle id="history-dialog-title" className="home__dialogTitle">
          <HistoryIcon className="home__dialogIcon" />
          {t('history.title')}
          <IconButton
            className="home__clearButton"
            onClick={handleClearHistory}
            title={t('history.clear')}
          >
            <ClearAllIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="home__historyContent">
          <History searchHistory={history} />
        </DialogContent>        <DialogActions className="home__dialogActions">
          <Button onClick={handleCloseHistory} className="home__dialogButton">
            {t('dialog.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Home;
