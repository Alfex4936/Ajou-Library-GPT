// BookDetail.jsx
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
    <div className="bookDetail fadeInUp">
      <div className="bookDetail__header">
        <h2 className="bookDetail__title">{title}</h2>
        <span className="bookDetail__id">{bookId}</span>
      </div>
      
      <div className="bookDetail__meta">
        <h3 className="bookDetail__author">
          <span className="bookDetail__label">Author:</span> {author}
        </h3>
        <p className="bookDetail__publisher">
          <span className="bookDetail__label">Publisher:</span> {publisher}, {yearPublished}
        </p>
      </div>
      
      <div className="bookDetail__availability">
        <p className={`bookDetail__rent ${rentable ? 'bookDetail__rent--available' : 'bookDetail__rent--unavailable'}`}>
          <span className="bookDetail__status">
            {rentable ? '✓ Available' : '✗ Not Available'}
          </span>
          {rentable && (
            <span className="bookDetail__location">
              at {rentPlace}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
