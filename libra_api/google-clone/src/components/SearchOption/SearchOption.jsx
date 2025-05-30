// SearchOption.jsx
import "./SearchOption.css";

export default function SearchOption({
  title,
  tabId,
  icon,
  setSelectedTab,
  activeTab,
  loading,
}) {
  const effectiveTabId = tabId || title; // Use tabId if provided, otherwise fall back to title
  const isActive = !loading && effectiveTabId === activeTab;
  
  const handleClick = () => {
    if (!loading) {
      setSelectedTab(effectiveTabId);
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
