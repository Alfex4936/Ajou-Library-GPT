import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LanguageWrapper - A utility component that automatically applies
 * language-specific CSS classes and attributes to its children
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.as - HTML element to render as (default: 'div')
 * @param {Object} props.props - Additional props to pass to the element
 */
const LanguageWrapper = memo(({ 
  children, 
  className = '', 
  style = {}, 
  as: Component = 'div',
  ...props 
}) => {
  const { i18n } = useTranslation();
  
  const currentLanguage = i18n.language;
  const langClass = `lang-${currentLanguage}`;
  const combinedClassName = `${langClass} ${className}`.trim();
  
  return (
    <Component
      className={combinedClassName}
      lang={currentLanguage}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
});

LanguageWrapper.displayName = 'LanguageWrapper';

export default LanguageWrapper;
