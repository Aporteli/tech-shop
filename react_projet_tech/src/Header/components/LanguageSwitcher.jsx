import { useTranslation } from 'react-i18next';
import styles from '../Header.module.css';

export default function LanguageSwitcher({
  currentLanguage,
  lengDropdownOpen,
  toggleLanguageDropdown,
  changeLanguage,
  variant = 'desktop'
}) {
  const { t } = useTranslation();
  const isDesktop = variant === 'desktop';
  const otherLanguage = currentLanguage === 'en' ? 'ru' : 'en';

  return (
    <div className={isDesktop ? styles.languageContainer : styles.tabletLanguageContainer}>
      <button
        type="button"
        className={isDesktop ? styles.languageButton : styles.tabletLanguageButton}
        aria-label={t('header.language')}
        aria-expanded={lengDropdownOpen}
        onClick={toggleLanguageDropdown}>
        {currentLanguage === 'en' ? 'ENG' : 'RUS'}
      </button>

      <button
        type="button"
        className={`${isDesktop ? styles.languageDropdownButton : styles.tabletLanguageDropdownButton} ${
          lengDropdownOpen
            ? isDesktop
              ? styles.languageDropdownButtonOpen
              : styles.tabletLanguageDropdownButtonOpen
            : ''
        }`}
        tabIndex={lengDropdownOpen ? 0 : -1}
        onClick={() => {
          changeLanguage(otherLanguage);
          toggleLanguageDropdown();
        }}>
        {currentLanguage === 'en' ? 'RUS' : 'ENG'}
      </button>
    </div>
  );
}
