import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { LuMail, LuPhone, LuMapPin } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

const SOCIAL_LINKS = [
  { icon: FaFacebookF, label: 'Facebook', href: 'https://www.facebook.com/' },
  { icon: FaInstagram, label: 'Instagram', href: 'https://www.instagram.com/' },
  { icon: FaTiktok, label: 'TikTok', href: 'https://www.tiktok.com/' },
  { icon: FaYoutube, label: 'YouTube', href: 'https://www.youtube.com/' }
];

const EMAIL = 'info@cybermart.ge';
const PHONE = '+995 32 2 222 222';

function FooterLink({ to, children, ...props }) {
  return (
    <li>
      <Link to={to} className={styles.footerContentTopItemLink} {...props}>
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContentTop}>
        <div className={styles.footerContentTopItem}>
          <h3 className={styles.footerContentTopItemTitle}>{t('footer.aboutUs.title')}</h3>
          <ul className={styles.footerContentTopItemLinks}>
            <FooterLink to="/aboutus">
              <p>{t('footer.aboutUs.whoWeAre')}</p>
            </FooterLink>
            <FooterLink to="/info/terms-and-conditions">
              <p>{t('footer.aboutUs.termsAndConditions')}</p>
            </FooterLink>
            <FooterLink to="/info/how-to-buy-online">
              <p>{t('footer.aboutUs.howToBuyOnline')}</p>
            </FooterLink>
            <FooterLink to="/info/online-payment-methods">
              <p>{t('footer.aboutUs.onlinePaymentMethods')}</p>
            </FooterLink>
            <FooterLink to="/shops">
              <p>{t('footer.aboutUs.addressesOfServiceCenters')}</p>
            </FooterLink>
          </ul>
        </div>

        <div className={styles.footerContentTopItem}>
          <h3 className={styles.footerContentTopItemTitle}>
            {t('footer.termsAndConditions.title')}
          </h3>
          <ul className={styles.footerContentTopItemLinks}>
            <FooterLink to="/info/warranty-terms">
              <p>{t('footer.termsAndConditions.warrantyTerms')}</p>
            </FooterLink>
            <FooterLink to="/info/device-safety">
              <p>{t('footer.termsAndConditions.deviceOperationAndSafetyGuidelines')}</p>
            </FooterLink>
            <FooterLink to="/info/delivery-terms">
              <p>{t('footer.termsAndConditions.deliveryTermsAndConditions')}</p>
            </FooterLink>
            <FooterLink to="/info/personal-data-policy">
              <p>{t('footer.termsAndConditions.personalDataPolicy')}</p>
            </FooterLink>
          </ul>
        </div>

        <div className={styles.footerContentTopItem}>
          <h3 className={styles.footerContentTopItemTitle}>{t('footer.followUs.title')}</h3>
          <ul className={styles.footerContentTopItemLinks}>
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className={styles.footerContentTopItemLink}>
                  <Icon className={styles.footerContentTopItemLinkIcon} />
                  <p>{label}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerContentTopItem}>
          <h3 className={styles.footerContentTopItemTitle}>{t('footer.contact.title')}</h3>
          <ul className={styles.footerContentTopItemLinks}>
            <li>
              <a href={`mailto:${EMAIL}`} className={styles.footerContentTopItemLink}>
                <LuMail className={styles.footerContentTopItemLinkIcon} />
                <p>{EMAIL}</p>
              </a>
            </li>
            <li>
              <a href={`tel:${PHONE.replace(/\s/g, '')}`} className={styles.footerContentTopItemLink}>
                <LuPhone className={styles.footerContentTopItemLinkIcon} />
                <p>{PHONE}</p>
              </a>
            </li>
            <FooterLink to="/shops">
              <LuMapPin className={styles.footerContentTopItemLinkIcon} />
              <p>{t('footer.contact.address')}</p>
            </FooterLink>
          </ul>
        </div>
      </div>

      <div className={styles.footerContentBottom}>
        <p className={styles.copyright}>
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
        <p>{t('footer.rights.title')}</p>
      </div>
    </footer>
  );
}
