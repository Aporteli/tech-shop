import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './infoPage.module.css';

const PAGE_KEYS = {
  'terms-and-conditions': 'termsAndConditions',
  'how-to-buy-online': 'howToBuyOnline',
  'online-payment-methods': 'onlinePaymentMethods',
  'warranty-terms': 'warrantyTerms',
  'device-safety': 'deviceSafety',
  'delivery-terms': 'deliveryTerms',
  'personal-data-policy': 'personalDataPolicy'
};

export default function InfoPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const pageKey = PAGE_KEYS[slug];

  if (!pageKey) {
    return <Navigate to="/" replace />;
  }

  const paragraphs = t(`infoPages.${pageKey}.body`, { returnObjects: true });
  const body = Array.isArray(paragraphs) ? paragraphs : [paragraphs];

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        {t('infoPages.back')}
      </Link>
      <h1 className={styles.title}>{t(`infoPages.${pageKey}.title`)}</h1>
      {body.map(paragraph => (
        <p key={paragraph} className={styles.text}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
