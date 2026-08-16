import { Outlet, Link } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import styles from './layout.module.css';
import { FaPhoneAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function Layout() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.container}>
        <Header />

        <main className={styles.main}>
          <div className={styles.home}>
            <div className={styles.homeContent}>
              <div className={styles.movingDivider}></div>
              <div className={styles.subheader}>
                <p className={styles.subheaderNumber}>
                  <FaPhoneAlt /> *3838 / (032) 222-22-22
                </p>
                <div className={styles.subheaderLinks}>
                  <Link to="/blog" className={styles.subheaderLink}>
                    {t('layout.blog')}
                  </Link>
                  <Link to="/shops" className={styles.subheaderLink}>
                    {t('layout.shops')}
                  </Link>
                  <Link to="/promotions" className={styles.subheaderLink}>
                    {t('layout.allPromotions')}
                  </Link>
                </div>
              </div>
              <div className={styles.movingDivider}></div>
            </div>
          </div>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout;
