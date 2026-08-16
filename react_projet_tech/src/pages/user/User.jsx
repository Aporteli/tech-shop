import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './User.module.css';
import {
  Package,
  Ticket,
  MapPin,
  CreditCard,
  User as UserIcon,
  LogOut,
  ShoppingBag
} from 'lucide-react';

export default function User() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');
  const [activeSidebarItem, setActiveSidebarItem] = useState('orders');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const sidebarItems = [
    { id: 'orders', label: t('user.orders'), icon: Package },
    { id: 'promo', label: t('user.promoCodes'), icon: Ticket },
    { id: 'addresses', label: t('user.addresses'), icon: MapPin },
    { id: 'cards', label: t('user.cards'), icon: CreditCard },
    { id: 'profile', label: t('user.profileDetails'), icon: UserIcon }
  ];

  return (
    <div className={styles.userContainer}>
      <div className={styles.userContent}>
        <h1 className={styles.userTitle}>
          {t('user.greeting')}, {user?.email?.split('@')[0] || 'User'}
        </h1>

        {user ? (
          <div className={styles.dashboardLayout}>
            {/* Left Sidebar */}
            <div className={styles.sidebar}>
              <nav className={styles.sidebarNav}>
                {sidebarItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`${styles.sidebarItem} ${activeSidebarItem === item.id ? styles.sidebarItemActive : ''}`}
                      onClick={() => setActiveSidebarItem(item.id)}>
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <button className={styles.signOutButton} onClick={handleLogout}>
                <LogOut size={20} />
                <span>{t('user.signOut')}</span>
              </button>
            </div>

            {/* Right Content Area */}
            <div className={styles.mainContent}>
              {activeSidebarItem === 'orders' && (
                <>
                  {/* Tabs */}
                  <div className={styles.tabsContainer}>
                    <button
                      className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab('pending')}>
                      <ShoppingBag size={18} />
                      {t('user.pendingOrders')}
                    </button>
                    <button
                      className={`${styles.tab} ${activeTab === 'finished' ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab('finished')}>
                      <ShoppingBag size={18} />
                      {t('user.finishedOrders')}
                    </button>
                  </div>

                  {/* Content Space */}
                  <div className={styles.contentSpace}>
                    {activeTab === 'pending' ? (
                      <div className={styles.emptyState}>
                        <p>{t('user.noPendingOrders')}</p>
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <p>{t('user.noFinishedOrders')}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSidebarItem === 'promo' && (
                <div className={styles.contentSpace}>
                  <div className={styles.emptyState}>
                    <p>{t('user.noPromoCodes')}</p>
                  </div>
                </div>
              )}

              {activeSidebarItem === 'addresses' && (
                <div className={styles.contentSpace}>
                  <div className={styles.emptyState}>
                    <p>{t('user.noAddresses')}</p>
                  </div>
                </div>
              )}

              {activeSidebarItem === 'cards' && (
                <div className={styles.contentSpace}>
                  <div className={styles.emptyState}>
                    <p>{t('user.noCards')}</p>
                  </div>
                </div>
              )}

              {activeSidebarItem === 'profile' && (
                <div className={styles.contentSpace}>
                  <div className={styles.profileDetails}>
                    <h2 className={styles.sectionTitle}>{t('user.sectionTitle')}</h2>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>{t('user.email')}:</span>
                      <span className={styles.detailValue}>{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>{t('user.phone')}:</span>
                        <span className={styles.detailValue}>{user.phone_number}</span>
                      </div>
                    )}
                    {user.id && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>{t('user.userId')}:</span>
                        <span className={styles.detailValue}>{user.id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className={styles.notLoggedIn}>{t('user.notLoggedIn')}</p>
        )}
      </div>
    </div>
  );
}
