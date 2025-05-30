import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for automatic font fallbacks based on current language
 * Automatically applies language-specific font optimizations while maintaining
 * good English typography for headings and Korean readability for body text.
 */
const useFontFallback = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLanguage = i18n.language;
    const documentElement = document.documentElement;
    
    // Remove existing language classes
    documentElement.classList.remove('lang-ko', 'lang-en');
    
    // Apply language-specific class
    if (currentLanguage === 'ko') {
      documentElement.classList.add('lang-ko');
      
      // Set Korean-optimized CSS custom properties
      documentElement.style.setProperty('--font-body-current', 'var(--font-korean-optimized)');
      documentElement.style.setProperty('--font-heading-current', 'var(--font-heading-korean)');
      documentElement.style.setProperty('--letter-spacing-current', '-0.01em');
      documentElement.style.setProperty('--word-spacing-current', '0.05em');
      
    } else if (currentLanguage === 'en') {
      documentElement.classList.add('lang-en');
      
      // Set English-optimized CSS custom properties
      documentElement.style.setProperty('--font-body-current', 'var(--font-body)');
      documentElement.style.setProperty('--font-heading-current', 'var(--font-heading)');
      documentElement.style.setProperty('--letter-spacing-current', 'normal');
      documentElement.style.setProperty('--word-spacing-current', 'normal');
    }
    
    // Set document language attribute for better accessibility and CSS targeting
    documentElement.setAttribute('lang', currentLanguage);
    
  }, [i18n.language]);

  // Return current language info for component use
  return {
    currentLanguage: i18n.language,
    isKorean: i18n.language === 'ko',
    isEnglish: i18n.language === 'en'
  };
};

export default useFontFallback;
