import React from "react";
import { Link } from "react-router-dom";

import SearchIcon from "@material-ui/icons/Search";
import DescriptionIcon from "@material-ui/icons/Description";
import ImageIcon from "@material-ui/icons/Image";
import CircularProgress from "@material-ui/core/CircularProgress"; // import the loading circle

import BookIcon from "@material-ui/icons/Book";
import MenuBook from "@material-ui/icons/MenuBook";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import useLibraSearch from "../../hooks/useGoogleSearch/useGoogleSearch";
import { useStateValue } from "../../StateContext";

import Search from "../../components/Search/Search";
import SearchOption from "../../components/SearchOption/SearchOption";

import "./SearchResult.css";

function SearchResult() {
  const [{ term }, dispatch] = useStateValue();
  const { data, loading } = useLibraSearch(term); // LIVE API Call

  return (
    <div className="searchResult">
      <div className="searchResult__header">
        <Link to="/">
          <img className="searchResult__logo" src="logo.png" alt="Logo" />
        </Link>

        <div className="searchResult__headerBody">
          <Search hideButtons />

          <div className="searchResult__options">
            <div className="searchResult__optionsLeft">
              <SearchOption title="All" icon={<SearchIcon />} />
              <SearchOption title="Books" icon={<BookIcon />} />
              <SearchOption title="RISS" icon={<MenuBook />} />
            </div>
            {/* <div className="searchResult__optionsRight">
                            <SearchOption title="Settings" />
                            <SearchOption title="Tools" />
                        </div> */}
          </div>
        </div>
      </div>

      {term && (
        <div className="searchResult__items">
          {loading ? (
            <div>
              <p className="searchResult__itemsCount">Loading...</p>
              <CircularProgress /> {/* Loading circle */}
            </div>
          ) : (
            <>
              <p className="searchResult__itemsCount">
                About {data?.recommendation.length} results for {term}
              </p>

              {data?.recommendation.map(item => (
                <div className="searchResult__item" key={item.book_id}>
                  <a href="#" className="searchResult__itemLink">
                    {item.book_id}
                    <ArrowDropDownIcon />
                  </a>

                  <a className="searchResult__itemTitle">
                    <h2>{item.details}</h2>
                  </a>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResult;
