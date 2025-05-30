// RissDetail.jsx
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
    <div className="rissDetail fadeInUp">
      <div className="rissDetail__header">
        <h2 className="rissDetail__title">{title}</h2>
        <span className="rissDetail__badge">RISS</span>
      </div>
      
      <div className="rissDetail__meta">
        <div className="rissDetail__id">
          <span className="rissDetail__label">ID:</span>
          {id.replaceAll('"', "").trim()}
        </div>
        <div className="rissDetail__author">
          <span className="rissDetail__label">Author:</span>
          {author}
        </div>
        <div className="rissDetail__publisher">
          <span className="rissDetail__label">Publisher:</span>
          {publisher}
        </div>
      </div>
      
      <div className="rissDetail__actions">
        <button className="rissDetail__viewButton" onClick={() => window.open(`https://www.riss.kr/search/detail/DetailView.do?p_mat_type=be54d9b8bc7cdb09&control_no=${id.replaceAll('"', "").trim()}`, '_blank')}>
          View on RISS
        </button>
      </div>
    </div>
  );
}
