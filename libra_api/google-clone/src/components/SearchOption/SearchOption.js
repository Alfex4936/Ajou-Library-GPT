// SearchOption.js
import React from "react";

import "./SearchOption.css";

export default function SearchOption({
  title,
  icon,
  setSelectedTab,
  activeTab,
  loading,
}) {
  console.log(title, activeTab);
  return (
    <div
      className={`searchOption ${
        !loading && title === activeTab ? "active" : ""
      }`}
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
