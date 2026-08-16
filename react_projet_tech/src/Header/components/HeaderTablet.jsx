import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import styles from '../Header.module.css';
import SiteLogo from '../../icons/siteLogo.jsx';
import { useHeaderScroll } from '../../hooks/useHeaderScroll';
import { useSearch } from '../../hooks/useSearch';
import { useLanguage } from '../../hooks/useLanguage';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../context/AuthContext';
import SearchModal from './SearchModal';
import LanguageSwitcher from './LanguageSwitcher';
import BottomNav from './BottomNav';
import TabletCategoryPanel from './TabletCategoryPanel';
import AuthModal from './AuthModal';

export default function HeaderTablet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { headerState, atTop } = useHeaderScroll(60);
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
      <div className={styles.tabletHeaderSpacer}></div>
      <div className={styles.tabletHeaderContainer}>
        <header
          className={`${styles.tabletHeader} ${activeClass} ${atTop ? styles.atTop : ''} ${openModal ? styles.tabletHeaderSearchOpen : ''}`}>
          <div className={styles.tabletHeaderContent}>
            <button
              type="button"
              className={styles.tabletCategoriesButton}
              aria-label={t('header.categories')}
              aria-expanded={categoryOpen}
              onClick={() => setCategoryOpen(!categoryOpen)}>
              <FiMenu className={styles.tabletMenuIcon} />
            </button>
            <Link to="/" className={styles.tabletLogoButton} aria-label={t('header.home')}>
              <SiteLogo />
            </Link>

            <div className={styles.tabletHeaderActions}>
              <button
                type="button"
                className={styles.tabletSearchButton}
                aria-label={t('header.openSearch')}
                onClick={openModalHandler}>
                <IoIosSearch />
              </button>
              <LanguageSwitcher
                currentLanguage={currentLanguage}
                lengDropdownOpen={lengDropdownOpen}
                toggleLanguageDropdown={toggleLanguageDropdown}
                changeLanguage={changeLanguage}
                variant="tablet"
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
      <BottomNav onSignInClick={() => setIsAuthModalOpen(true)} isAuthenticated={isAuthenticated} />
      <TabletCategoryPanel categoryOpen={categoryOpen} setCategoryOpen={setCategoryOpen} />
      <AuthModal openModal={isAuthModalOpen} closeModal={() => setIsAuthModalOpen(false)} />
    </>
  );
}
