// SearchOption.jsx
import "./SearchOption.css";

export default function SearchOption({
  title,
  icon,
  setSelectedTab,
  activeTab,
  loading,
}) {
  const isActive = !loading && title === activeTab;
  
  const handleClick = () => {
    if (!loading) {
      setSelectedTab(title);
    }
  };

  return (
    <div
      className={`searchOption ${isActive ? "searchOption--active" : ""} ${loading ? "searchOption--loading" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-pressed={isActive}
      aria-disabled={loading}
    >
      <div className="searchOption__icon">
        {icon && icon}
      </div>
      <span className="searchOption__title">{title}</span>
      {isActive && <div className="searchOption__indicator" />}
    </div>
  );
}
