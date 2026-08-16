import { NavLink } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { MdOutlineCompareArrows } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import styles from '../Header.module.css';

export default function BottomNav({ onSignInClick, isAuthenticated }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const itemClass = ({ isActive }) =>
    `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`;

  return (
    <nav className={styles.bottomNav} aria-label={t('header.bottomNav.label')}>
      <NavLink to="/" end className={itemClass}>
        <FiHome className={styles.bottomNavIcon} />
        <span className={styles.bottomNavText}>{t('header.bottomNav.home')}</span>
      </NavLink>
      <NavLink to="/cart" className={itemClass}>
        <FiShoppingCart className={styles.bottomNavIcon} />
        <span className={styles.bottomNavText}>{t('header.bottomNav.cart')}</span>
      </NavLink>
      <NavLink to="/compare" className={itemClass}>
        <MdOutlineCompareArrows className={styles.bottomNavIcon} />
        <span className={styles.bottomNavText}>{t('header.bottomNav.compare')}</span>
      </NavLink>
      <NavLink to="/wishlist" className={itemClass}>
        <FiHeart className={styles.bottomNavIcon} />
        <span className={styles.bottomNavText}>{t('header.bottomNav.saved')}</span>
      </NavLink>
      {isAuthenticated ? (
        <NavLink to="/user" className={itemClass}>
          <div className={styles.bottomNavUserAvatar}>
            <FiUser className={styles.bottomNavIcon} />
          </div>
          <span className={styles.bottomNavText}>
            {user?.email ? user.email.split('@')[0] : t('header.bottomNav.account')}
          </span>
        </NavLink>
      ) : (
        <button type="button" className={styles.bottomNavItem} onClick={onSignInClick}>
          <FiUser className={styles.bottomNavIcon} />
          <span className={styles.bottomNavText}>{t('header.bottomNav.signIn')}</span>
        </button>
      )}
    </nav>
  );
}
