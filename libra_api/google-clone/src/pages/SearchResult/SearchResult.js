import PropTypes from 'prop-types'; // Import PropTypes for better component documentation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import CircularProgress from "@material-ui/core/CircularProgress";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import BookIcon from "@material-ui/icons/Book";
import CloseIcon from "@material-ui/icons/Close";
import MenuBook from "@material-ui/icons/MenuBook";
import SearchIcon from "@material-ui/icons/Search";

import useLibraSearch from "../../hooks/useLibraSearch/useLibraSearch";
import { useStateValue } from "../../StateContext";

import Search from "../../components/Search/Search";
import SearchOption from "../../components/SearchOption/SearchOption";

import BookDetail from "../../components/Book/BookDetail";
import RissDetail from "../../components/RISS/RissDetail";

import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";

import "./SearchResult.css";

const Alert = React.forwardRef(function Alert(props, ref) { // Use forwardRef for Alert component
  return <MuiAlert elevation={6} variant="filled" {...props} ref={ref} />;
});
Alert.propTypes = { // Add PropTypes for Alert component
  elevation: PropTypes.number,
  variant: PropTypes.string,
};

function SearchResult() {
  const [{ term, error }] = useStateValue();
  const { data, loading } = useLibraSearch(term); // LIVE API Call


  const [selectedTab, setSelectedTab] = useState("All");
  const [openSuccess, setOpenSuccess] = useState(false);

  const setSelectedTabCallback = useCallback(newTab => {
    setSelectedTab(newTab);
  }, []);

  useEffect(() => {
    if (!loading && !error && term && data) { // ADDED: Check if data is truthy
      setOpenSuccess(true);
    } else {
      setOpenSuccess(false); // Optionally, ensure success toast is closed if conditions are not met
    }
  }, [loading, error, term, data]); // ADDED: data to the dependency array

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
    // Error handling logic...
  }, []);

  const renderSearchResults = useMemo(() => { // Memoize the rendering logic for better performance
    if (!term) {
      return (
        <div className="searchResult__items">
          <p className="searchResult__itemsCount" style={{ whiteSpace: "pre-line" }}>
            {error}
          </p>
        </div>
      );
    }
    return (
      <div className="searchResult__items">
        {loading ? (
          <div>
            <p className="searchResult__itemsCount">Loading...</p>
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
                  About{" "}
                  {Array.isArray(filteredData)
                    ? filteredData.length
                    : (filteredData?.books?.length || 0) +
                      (filteredData?.riss?.length || 0)}{" "}
                  results for {term}
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
                        <a href="#" className="searchResult__itemLink">
                          Books - <ArrowDropDownIcon />
                        </a>
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
                        <a href="#" className="searchResult__itemLink">
                          RISS - <ArrowDropDownIcon />
                        </a>
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
              <a className="searchResult__itemTitle">
                <h2>
                  No results found.
                  <br />
                  Check OpenAI API Key.
                  <br />
                  {!!error ? `${error}` : ""}
                </h2>
              </a>
            )}
          </>
        )}
      </div>
    );
  }, [loading, error, term, filteredData, selectedTab, data?.queries, data?.books, data?.riss]); // Add all dependencies for memoization


  return (
    <div className="searchResult">
      <div className="searchResult__header">
        <Link to="/">
          <img
            className="searchResult__logo pulse"
            src="logo_search.png"
            alt="Logo"
          />
        </Link>

        <div className="searchResult__headerBody">
          <Search hideButtons loading={loading} />

          <div className="searchResult__options">
            <div className="searchResult__optionsLeft">
              <SearchOption
                title="All"
                icon={<SearchIcon />}
                setSelectedTab={setSelectedTabCallback}
                activeTab={selectedTab}
                loading={loading}
              />
              <SearchOption
                title="Books"
                icon={<BookIcon />}
                setSelectedTab={setSelectedTabCallback}
                activeTab={selectedTab}
                loading={loading}
              />
              <SearchOption
                title="RISS"
                icon={<MenuBook />}
                setSelectedTab={setSelectedTabCallback}
                activeTab={selectedTab}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {renderSearchResults} {/* Render search results using memoized component */}

      <Snackbar
        open={openSuccess}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        autoHideDuration={5000}
        onClose={() => setOpenSuccess(false)} // Directly setOpenSuccess(false)
      >
        <Alert
          onClose={() => setOpenSuccess(false)} // Directly setOpenSuccess(false)
          severity="success"
          sx={{ width: "100%" }}
        >
          Successfully loaded!
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