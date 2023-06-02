import React from "react";
import { Link } from "react-router-dom";

import "./SearchOption.css";

// SearchOption.js
function SearchOption({ title, icon, setSelectedTab }) {
  return (
    <div className="searchOption" onClick={() => setSelectedTab(title)}>
      {icon && icon}
      <p>{title}</p>
    </div>
  );
}

export default SearchOption;
