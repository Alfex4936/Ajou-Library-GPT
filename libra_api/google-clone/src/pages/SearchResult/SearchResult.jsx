import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BookIcon from "@mui/icons-material/Book";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from "@mui/icons-material/Search";

import useLibraSearch from "../../hooks/useLibraSearch/useLibraSearch";
import { useSearchState, useUIActions } from "../../store";

import LanguageSelector from "../../components/LanguageSelector";
import Search from "../../components/Search/Search";
import SearchOption from "../../components/SearchOption/SearchOption";

import BookDetail from "../../components/Book/BookDetail";
import RissDetail from "../../components/Riss/RissDetail";

import MuiAlert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CircularProgress from '@mui/material/CircularProgress';
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";

import "./SearchResult.css";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SearchResult() {
  const { t } = useTranslation();
  const { term, error } = useSearchState();
  const { clearError } = useUIActions();
  const { data, loading, error: searchError } = useLibraSearch(term); // LIVE API Call

  const [selectedTab, setSelectedTab] = useState("All");
  const [openSuccess, setOpenSuccess] = useState(false);

  const setSelectedTabCallback = useCallback(newTab => {
    setSelectedTab(newTab);
  }, []);

  // Combine errors from different sources
  const combinedError = error || searchError;

  useEffect(() => {
    if (!loading && !combinedError && term && data) { // Use combinedError
      setOpenSuccess(true);
    } else {
      setOpenSuccess(false); // Optionally, ensure success toast is closed if conditions are not met
    }
  }, [loading, combinedError, term, data]); // Use combinedError

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedTab]); // Directly use selectedTab as dependency

  const filteredData = useMemo(() => {
    switch (selectedTab) {
      case "Books":
        return data?.books || [];
      case "RISS":
        return data?.riss || [];
      default:
        return data || [];
    }
  }, [data, selectedTab]);

  const handleCloseError = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    clearError();
  }, [clearError]);

  const renderSearchResults = useMemo(() => { // Memoize the rendering logic for better performance
    if (!term) {
      return (
        <div className="searchResult__items">
          <p className="searchResult__itemsCount" style={{ whiteSpace: "pre-line" }}>
            {combinedError}
          </p>
        </div>
      );
    }
    return (
      <div className="searchResult__items">
        {loading ? (
          <div>
            <p className="searchResult__itemsCount">{t('common.loading')}</p>
            <CircularProgress />
          </div>
        ) : (
          <>
            {filteredData &&
              ((Array.isArray(filteredData) && filteredData.length > 0) ||
                (filteredData?.books?.length || 0) +
                (filteredData?.riss?.length || 0) >
                0) ? (
              <>
                <p className="searchResult__itemsCount" style={{ whiteSpace: "pre-line" }}>
                  {t('search.results')} {" "}
                  {Array.isArray(filteredData)
                    ? filteredData.length
                    : (filteredData?.books?.length || 0) +
                    (filteredData?.riss?.length || 0)}{" "}
                  {t('search.results')} for {term}
                  <br />
                  <br />
                  {data?.queries.map((query, index) => (
                    <Chip
                      style={{ marginRight: "10px", marginBottom: "10px" }}
                      key={index}
                      label={query.query}
                      variant="outlined"
                    />
                  ))}
                </p>

                {selectedTab === "All" && (data?.books || data?.riss) && ( // Conditionally render "All" tab content
                  <>
                    <Divider style={{ marginTop: "16px", marginBottom: "16px" }} variant="middle" />

                    {data?.books && data.books.length > 0 && ( // Conditionally render Books section
                      <>
                        <button className="searchResult__itemLink" type="button">
                          {t('book.title')} - <ArrowDropDownIcon />
                        </button>
                        {data.books.map(item => (
                          <BookDetail
                            key={item.book_id}
                            bookId={item.book_id}
                            details={item.details}
                            rentPlace={item.rent_place}
                            rentable={item.rentable}
                          />
                        ))}
                        <Divider style={{ marginTop: "16px", marginBottom: "16px" }} variant="middle" />
                      </>
                    )}

                    {data?.riss && data.riss.length > 0 && ( // Conditionally render RISS section
                      <>
                        <button className="searchResult__itemLink" type="button">
                          RISS - <ArrowDropDownIcon />
                        </button>
                        {data.riss.map(item => (
                          <RissDetail key={item.id} id={item.id} details={item.details} />
                        ))}
                      </>
                    )}
                  </>
                )}

                {selectedTab === "Books" && Array.isArray(filteredData) && (
                  filteredData.map(item => (
                    <BookDetail
                      key={item.book_id}
                      bookId={item.book_id}
                      details={item.details}
                      rentPlace={item.rent_place}
                      rentable={item.rentable}
                    />
                  ))
                )}

                {selectedTab === "RISS" && Array.isArray(filteredData) && (
                  filteredData.map(item => (
                    <RissDetail key={item.id} id={item.id} details={item.details} />
                  ))
                )}
              </>
            ) : (
              <div className="searchResult__noResults">
                <div className="searchResult__noResultsIcon">
                  <SearchIcon className="searchResult__noResultsIconMain" />
                  <div className="searchResult__noResultsRipple"></div>
                  <div className="searchResult__noResultsRipple searchResult__noResultsRipple--delay"></div>
                </div>
                <div className="searchResult__noResultsContent">
                  <h2 className="searchResult__noResultsTitle">
                    {t('search.noResults')}
                  </h2>
                  <p className="searchResult__noResultsSubtitle">
                    {t('search.error')}
                    <br />
                    "<span className="searchResult__noResultsTerm">{term}</span>"
                  </p>
                  <div className="searchResult__noResultsSuggestions">
                    <h3>{t('search.tryAgain')}:</h3>
                    <ul>
                      <li>{t('search.suggestions.checkSpelling')}</li>
                      <li>{t('search.suggestions.useGeneral')}</li>
                      <li>{t('search.suggestions.tryDifferent')}</li>
                      <li>{t('search.suggestions.browseCollection')}</li>
                    </ul>
                  </div>
                  {/* {!!combinedError && (
                    <div className="searchResult__noResultsError">
                      <strong>{t('search.technicalDetails')}:</strong> {combinedError}
                    </div>
                  )} */}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }, [loading, combinedError, term, filteredData, selectedTab, data?.queries, data?.books, data?.riss, t]); // Add all dependencies for memoization


  return (
    <div className="searchResult">
      <div className="searchResult__header">
        <Link to="/">
          <img
            className="searchResult__logo pulse"
            src="logo-transparent.png"
            alt="Ajou Library Logo"
          />
        </Link>

        <div className="searchResult__headerBody">
          <Search hideButtons loading={loading} />

          <div className="searchResult__headerActions">
            <LanguageSelector variant="compact" />
          </div>

          <div className="searchResult__options">
            <div className="searchResult__optionsLeft">
              <SearchOption
                title={t('common.all')}
                icon={<SearchIcon />}
                setSelectedTab={setSelectedTabCallback}
                activeTab={selectedTab}
                loading={loading}
              />
              <SearchOption
                title={t('common.books')}
                icon={<BookIcon />}
                setSelectedTab={setSelectedTabCallback}
                activeTab={selectedTab}
                loading={loading}
              />
              <SearchOption
                title="RISS"
                icon={<MenuBookIcon />}
                setSelectedTab={setSelectedTabCallback}
                activeTab={selectedTab}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="searchResult__body">
        {renderSearchResults}
      </div>

      <Snackbar
        open={openSuccess}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        autoHideDuration={5000}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert
          onClose={() => setOpenSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t('common.success')}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={!!error}
        autoHideDuration={5000}
        onClose={handleCloseError}
        message={error}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseError}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}

export default SearchResult;