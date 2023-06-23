// BookDetail.js
import React from "react";
import "./BookDetail.css";

export default function BookDetail({ bookId, details, rentPlace, rentable }) {
  const parsedDetails = details.split('" by ');
  const titleAuthor = parsedDetails[0].replaceAll('"', "").trim();
  const title = titleAuthor.split(" : ")[0];
  const author = titleAuthor.split(" : ")[1]?.replaceAll('"', "").trim();
  const publisher = parsedDetails[1].split(", published by ")[0];
  const yearPublished = parsedDetails[1]
    .split(", published by ")[1]
    .replaceAll('"', "")
    .trim();

  return (
    <div className="bookDetail">
      <h2 className="bookDetail__title">{title}</h2>
      <h3 className="bookDetail__author">
        {bookId} | {author}
      </h3>
      <p className="bookDetail__publisher">
        {publisher}, {yearPublished}
      </p>
      <p className="bookDetail__rent">
        {rentable ? `Rentable at ${rentPlace}` : "Not Rentable"}
      </p>
    </div>
  );
}
