import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import SearchIcon from "@material-ui/icons/Search";
import CircularProgress from "@material-ui/core/CircularProgress"; // import the loading circle

import BookIcon from "@material-ui/icons/Book";
import MenuBook from "@material-ui/icons/MenuBook";
import CloseIcon from "@material-ui/icons/Close";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import useLibraSearch from "../../hooks/useLibraSearch/useLibraSearch";
import { useStateValue } from "../../StateContext";
import { actionTypes } from "../../reducer";

import Search from "../../components/Search/Search";
import SearchOption from "../../components/SearchOption/SearchOption";

import BookDetail from "../../components/Book/BookDetail";
import RissDetail from "../../components/RISS/RissDetail";

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";

import Divider from "@material-ui/core/Divider";
import Chip from "@material-ui/core/Chip";

import "./SearchResult.css";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SearchResult() {
  const [{ term, error }, dispatch] = useStateValue();
  const { data, loading } = useLibraSearch(term); // LIVE API Call

  // Add a new piece of state for the selected tab
  const [selectedTab, setSelectedTab] = useState("All");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [loadingStarted, setLoadingStarted] = useState(false);
  // Add a new piece of state for tracking tab clicks
  const [tabClickCount, setTabClickCount] = useState(0);

  // Use a function to set selectedTab state and increase tabClickCount
  const setSelectedTabAndUpdateClickCount = newTab => {
    setSelectedTab(newTab);
    setTabClickCount(prevCount => prevCount + 1);
  };

  // Add a new piece of state for the filtered results
  // const [filteredData, setFilteredData] = useState([]);

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    // dispatch({
    //   type: actionTypes.SET_ERROR,
    //   error: null,
    // });
  };

  useEffect(() => {
    if (loading) {
      setLoadingStarted(true);
    } else if (loadingStarted && !error) {
      setOpenSuccess(true);
    }
  }, [loading, error, loadingStarted]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" }); // Use 'auto' to override ongoing scrolls
  }, [tabClickCount]); // Use tabClickCount as dependency

  // useMemo to memoize the calculation of filtered data
  const filteredData = useMemo(() => {
    switch (selectedTab) {
      case "Books":
        console.log("book: ", data);
        return data?.books || [];
      case "RISS":
        console.log("riss: ", data);
        return data?.riss || [];
      default:
        console.log("All: ", data);
        return data || [];
    }
  }, [data, selectedTab]);

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
                setSelectedTab={setSelectedTabAndUpdateClickCount}
                activeTab={selectedTab}
                loading={loading}
              />
              <SearchOption
                title="Books"
                icon={<BookIcon />}
                setSelectedTab={setSelectedTabAndUpdateClickCount}
                activeTab={selectedTab}
                loading={loading}
              />
              <SearchOption
                title="RISS"
                icon={<MenuBook />}
                setSelectedTab={setSelectedTabAndUpdateClickCount}
                activeTab={selectedTab}
                loading={loading}
              />
            </div>
            {/* <div className="searchResult__optionsRight">
              <SearchOption title="Settings" />
            </div> */}
          </div>
        </div>
      </div>
      {!term && (
        <div className="searchResult__items">
          <p
            className="searchResult__itemsCount"
            style={{ whiteSpace: "pre-line" }}
          >
            {error}
          </p>
        </div>
      )}
      {term && (
        <div className="searchResult__items">
          {loading ? (
            <div>
              <p className="searchResult__itemsCount">Loading...</p>
              <CircularProgress /> {/* Loading circle */}
            </div>
          ) : (
            <>
              {filteredData &&
              ((Array.isArray(filteredData) && filteredData.length > 0) ||
                (filteredData?.books?.length || 0) +
                  (filteredData?.riss?.length || 0) >
                  0) ? (
                <>
                  <p
                    className="searchResult__itemsCount"
                    style={{ whiteSpace: "pre-line" }}
                  >
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
                      // <span key={index}>{query.query} </span>
                    ))}
                  </p>

                  {selectedTab === "All" &&
                    Array.isArray(filteredData?.books) &&
                    Array.isArray(filteredData?.riss) && (
                      <>
                        <Divider
                          style={{ marginTop: "16px", marginBottom: "16px" }}
                          variant="middle"
                        />

                        <a href="#" className="searchResult__itemLink">
                          Books -
                          <ArrowDropDownIcon />
                        </a>

                        {filteredData?.books.map(item => (
                          <BookDetail
                            key={item.book_id}
                            bookId={item.book_id}
                            details={item.details}
                            rentPlace={item.rent_place}
                            rentable={item.rentable}
                          />
                        ))}

                        <a href="#" className="searchResult__itemLink">
                          RISS -
                          <ArrowDropDownIcon />
                        </a>

                        {filteredData?.riss.map(item => (
                          <RissDetail id={item.id} details={item.details} />
                        ))}
                      </>
                    )}

                  {selectedTab === "Books" &&
                    Array.isArray(filteredData) &&
                    filteredData.map(item => (
                      <BookDetail
                        key={item.book_id}
                        bookId={item.book_id}
                        details={item.details}
                        rentPlace={item.rent_place}
                        rentable={item.rentable}
                      />
                    ))}

                  {selectedTab === "RISS" &&
                    Array.isArray(filteredData) &&
                    filteredData.map(item => (
                      <RissDetail id={item.id} details={item.details} />
                    ))}
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
      )}
      <Snackbar
        open={openSuccess}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        autoHideDuration={5000}
        onClose={() => {
          handleCloseError();
          setOpenSuccess(false);
        }}
      >
        <Alert
          onClose={() => {
            handleCloseError();
            setOpenSuccess(false);
          }}
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
        open={!!error} // <-- the snackbar is open when there is an error
        autoHideDuration={5000} // <-- the snackbar will automatically close after 3 seconds
        onClose={handleCloseError} // <-- you need a function to close the snackbar
        message={error} // <-- the error message will be displayed in the snackbar
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
