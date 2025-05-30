import {
    ExpandMore as ExpandMoreIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import {
    Box,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    Tooltip,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ variant = 'compact', showLabel = false }) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };
  const languages = [
    { code: 'ko', name: t('language.korean'), flag: '🇰🇷' },
    { code: 'en', name: t('language.english'), flag: '🇺🇸' }
  ];

  if (variant === 'icon') {
    return (
      <Tooltip title={t('language.change')}>
        <IconButton
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <LanguageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ minWidth: 120 }}>
        <FormControl size="small" fullWidth>
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                fontSize: '0.875rem'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: '1px solid rgba(0, 0, 0, 0.23)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px'
              }
            }}
            IconComponent={ExpandMoreIcon}
          >
            {languages.map((language) => (
              <MenuItem
                key={language.code}
                value={language.code}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1
                }}
              >
                <span style={{ fontSize: '1.2em' }}>{language.flag}</span>
                <Typography variant="body2">
                  {language.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      {showLabel && (
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          {t('language.change')}
        </Typography>
      )}
      <FormControl fullWidth>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5
            }
          }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              value={language.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.5
              }}
            >
              <span style={{ fontSize: '1.5em' }}>{language.flag}</span>
              <Box>
                <Typography variant="body1">
                  {language.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
