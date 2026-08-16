import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import styles from '../Header.module.css';
import SiteLogo from '../../icons/siteLogo.jsx';
import CategoriesDropdown from '../../components/categoriesDropdown.jsx';
import { useHeaderScroll } from '../../hooks/useHeaderScroll';
import { useSearch } from '../../hooks/useSearch';
import { useLanguage } from '../../hooks/useLanguage';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../context/AuthContext';
import SearchModal from './SearchModal';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderIcons from './HeaderIcons';
import SearchBar from './SearchBar';
import AuthModal from './AuthModal';

export default function HeaderDesktop() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { headerState, atTop } = useHeaderScroll(80);
  const activeClass = styles[headerState];
  const { isAuthenticated } = useAuth();

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    searchQuery,
    searchResults,
    searchLoading,
    handleSearch,
    clearSearch,
    t: searchT
  } = useSearch(navigate);

  const { lengDropdownOpen, currentLanguage, toggleLanguageDropdown, changeLanguage } =
    useLanguage();

  useModal(openModal);

  const openModalHandler = () => {
    setOpenModal(true);
  };

  const closeModalHandler = () => {
    setOpenModal(false);
    clearSearch();
  };

  const handleSearchSubmit = e => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      closeModalHandler();
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className={styles.headerSpacer}></div>
      <div className={styles.headerContainer}>
        <header
          className={`${styles.customHeader} ${activeClass} ${atTop ? styles.atTop : ''} ${openModal ? styles.headerSearchOpen : ''}`}>
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logoButton} aria-label={t('header.home')}>
              <SiteLogo />
            </Link>
            <div
              className={styles.categoriesContainer}
              onMouseEnter={() => setCategoryOpen(true)}
              onMouseLeave={() => setCategoryOpen(false)}
              onKeyDown={e => e.key === 'Escape' && setCategoryOpen(false)}>
              <button
                type="button"
                className={styles.categoriesButton}
                aria-expanded={categoryOpen}
                onClick={() => setCategoryOpen(true)}
                onFocus={() => setCategoryOpen(true)}>
                <FiMenu className={styles.menuIcon} />
                <p className={styles.categoriesButtonText}>{t('header.categories')}</p>
              </button>

              {categoryOpen && <CategoriesDropdown />}
            </div>
            <div className={styles.headerActions}>
              <SearchBar
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                openModal={openModal}
                openModalHandler={openModalHandler}
                handleSearchSubmit={handleSearchSubmit}
                t={t}
              />
              <HeaderIcons />
              {isAuthenticated ? (
                <button
                  type="button"
                  className={styles.loginButtonAuth}
                  aria-label={t('header.account')}
                  onClick={() => navigate('/user')}>
                  <div className={styles.loginButtonContentAuth}>
                    <div className={styles.userAvatar}>
                      <FiUser size={20} />
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.loginButton}
                  onClick={() => setIsAuthModalOpen(true)}>
                  <div className={styles.loginButtonContent}>
                    <FiUser size={18} />
                    <p className={styles.loginButtonText}>{t('header.signIn')}</p>
                  </div>
                </button>
              )}
              <LanguageSwitcher
                currentLanguage={currentLanguage}
                lengDropdownOpen={lengDropdownOpen}
                toggleLanguageDropdown={toggleLanguageDropdown}
                changeLanguage={changeLanguage}
                variant="desktop"
              />
            </div>
          </div>
        </header>
      </div>
      {/* Kept outside <header> so the fixed overlay is not trapped by its transform */}
      <SearchModal
        openModal={openModal}
        closeModal={closeModalHandler}
        searchQuery={searchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        handleSearch={handleSearch}
        handleSearchSubmit={handleSearchSubmit}
        clearSearch={clearSearch}
        t={searchT}
      />
      <AuthModal openModal={isAuthModalOpen} closeModal={() => setIsAuthModalOpen(false)} />
    </>
  );
}
