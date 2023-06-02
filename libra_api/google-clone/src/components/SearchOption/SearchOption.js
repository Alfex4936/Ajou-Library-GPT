// SearchOption.js
import React from "react";

import "./SearchOption.css";

function SearchOption({ title, icon, setSelectedTab, activeTab, loading }) {
  console.log(title, activeTab);
  return (
    <div
      className={`searchOption ${title === activeTab ? "active" : ""}`}
      onClick={() => {
        if (!loading) {
          setSelectedTab(title);
        }
      }}
    >
      {icon && icon}
      <p>{title}</p>
    </div>
  );
}
export default SearchOption;
