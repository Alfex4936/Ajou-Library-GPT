import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook that provides language-specific typography utilities and styles
 * @returns {Object} Typography utilities for the current language
 */
const useTypography = () => {
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    const currentLanguage = i18n.language;
    const isKorean = currentLanguage === 'ko';
    const isEnglish = currentLanguage === 'en';
    
    return {
      // Current language info
      currentLanguage,
      isKorean,
      isEnglish,
      
      // CSS class helpers
      getLanguageClass: () => `lang-${currentLanguage}`,
      getTypographyClass: (type = 'body') => `lang-${currentLanguage} ${type}-text`,
      
      // Font family utilities
      getFontFamily: (variant = 'body') => {
        if (isKorean) {
          switch (variant) {
            case 'heading':
              return 'var(--font-heading-korean)';
            case 'mono':
              return 'var(--font-mono-enhanced)';
            default:
              return 'var(--font-korean-enhanced)';
          }
        } else {
          switch (variant) {
            case 'heading':
              return 'var(--font-heading-english)';
            case 'mono':
              return 'var(--font-mono-enhanced)';
            default:
              return 'var(--font-english-enhanced)';
          }
        }
      },
      
      // Typography styles for inline usage
      getTypographyStyle: (variant = 'body') => {
        const baseStyle = {
          fontFamily: getFontFamily(variant),
        };
        
        if (isKorean) {
          return {
            ...baseStyle,
            letterSpacing: variant === 'heading' ? '-0.01em' : '-0.01em',
            wordSpacing: '0.05em',
            lineHeight: variant === 'heading' ? 1.4 : 1.7,
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          };
        } else {
          return {
            ...baseStyle,
            letterSpacing: variant === 'heading' ? '-0.025em' : 'normal',
            lineHeight: variant === 'heading' ? 1.2 : 1.6,
            wordBreak: 'normal',
            overflowWrap: 'break-word',
          };
        }
      },
      
      // Material-UI sx prop helpers
      getSxTypography: (variant = 'body') => ({
        fontFamily: getFontFamily(variant),
        ...(isKorean ? {
          letterSpacing: variant === 'heading' ? '-0.01em' : '-0.01em',
          wordSpacing: '0.05em',
          lineHeight: variant === 'heading' ? 1.4 : 1.7,
        } : {
          letterSpacing: variant === 'heading' ? '-0.025em' : 'normal',
          lineHeight: variant === 'heading' ? 1.2 : 1.6,
        }),
      }),
      
      // Responsive font sizes based on language
      getResponsiveFontSize: (baseSize = '1rem') => {
        if (isKorean) {
          // Korean text often needs slightly larger sizes for readability
          return {
            fontSize: baseSize,
            '@media (max-width: 600px)': {
              fontSize: `calc(${baseSize} * 1.05)`,
            },
          };
        }
        return { fontSize: baseSize };
      },
      
      // Language-specific text truncation
      getTruncationStyle: (lines = 1) => ({
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: isKorean ? 'keep-all' : 'normal',
      }),
    };
  }, [i18n.language]);
  
  function getFontFamily(variant) {
    const currentLanguage = i18n.language;
    const isKorean = currentLanguage === 'ko';
    
    if (isKorean) {
      switch (variant) {
        case 'heading':
          return 'var(--font-heading-korean)';
        case 'mono':
          return 'var(--font-mono-enhanced)';
        default:
          return 'var(--font-korean-enhanced)';
      }
    } else {
      switch (variant) {
        case 'heading':
          return 'var(--font-heading-english)';
        case 'mono':
          return 'var(--font-mono-enhanced)';
        default:
          return 'var(--font-english-enhanced)';
      }
    }
  }
};

export default useTypography;
