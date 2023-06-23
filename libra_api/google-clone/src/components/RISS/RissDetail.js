// RissDetail.js
import React from "react";
import "./RissDetail.css";

export default function RissDetail({ id, details }) {
  const parsedDetails = details?.split('" by ');
  const title = parsedDetails[0].replaceAll('"', "").trim();
  const author = parsedDetails[1]
    .split(", published by ")[0]
    .replaceAll('"', "")
    .trim();
  const publisher = parsedDetails[1]
    .split(", published by ")[1]
    .replaceAll('"', "")
    .trim();

  return (
    <div className="rissDetail">
      <h2 className="rissDetail__title">{title}</h2>
      <h3 className="rissDetail__author">
        {id.replaceAll('"', "").trim()} | {author}, {publisher}
      </h3>
    </div>
  );
}
