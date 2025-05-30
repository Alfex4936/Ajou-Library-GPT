// History.jsx - Custom Premium Timeline Design
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { formatRelativeTime } from '../../utils/timeUtils';
import './History.css';

export default function History({ searchHistory }) {
  const { t } = useTranslation();

  if (searchHistory.length === 0) {
    return (
      <Box className="history__empty">
        <div className="history__emptyIcon">
          <HistoryIcon />
        </div>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <Typography
            className="history__emptyTitle"
            align="center"
            sx={{ textAlign: 'center !important' }}
          >
            {t('history.empty')}
          </Typography>
          <Typography
            className="history__emptyText"
            align="center"
            sx={{ textAlign: 'center !important' }}
          >
            {t('history.emptyDescription')}
          </Typography>
        </div>
      </Box>
    );
  }

  return (
    <div className="history">
      <div className="history__header">
        <HistoryIcon className="history__headerIcon" />
        <Typography className="history__headerTitle">
          {t('history.recent')}
        </Typography>
        <span className="history__headerCount">
          {t('history.item', { count: searchHistory.length })}
        </span>
      </div>

      <div className="history__timeline">
        {searchHistory.map((searchItem, index) => {
          // Handle both old string format and new object format
          const term = typeof searchItem === 'string' ? searchItem : searchItem.term;
          const timestamp = typeof searchItem === 'string' ? Date.now() : searchItem.timestamp;
          const relativeTime = formatRelativeTime(timestamp, t);
          const displayDate = new Date(timestamp).toLocaleDateString();

          return (
            <div
              key={`search-${index}-${term.slice(0, 10)}-${timestamp}`}
              className="history__item"
              style={{ '--item-delay': `${index * 0.1}s` }}
            >
              <div className="history__itemSide">
                <div className={`history__dot ${index % 3 === 0 ? 'history__dot--primary' : index % 3 === 1 ? 'history__dot--secondary' : 'history__dot--accent'}`}>
                  <SearchIcon className="history__dotIcon" />
                </div>
                {index < searchHistory.length - 1 && (
                  <div className="history__line"></div>
                )}
              </div>

              <div className="history__content">
                <div className="history__card">
                  <div className="history__cardHeader">
                    <span className="history__number">
                      #{searchHistory.length - index}
                    </span>
                    <div className="history__time">
                      <AccessTimeIcon className="history__timeIcon" />
                      <span>{relativeTime}</span>
                    </div>
                  </div>

                  <div className="history__query">
                    <span className="history__queryText">
                      {term}
                    </span>
                  </div>

                  <div className="history__meta">
                    <span className="history__type">{t('history.librarySearch')}</span>
                    <span className="history__separator">•</span>
                    <span className="history__date">{displayDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
