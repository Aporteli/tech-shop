import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { fetchCategoryBreadcrumb } from '../../../../api/categoryService';
import styles from './breadcrumb.module.css';

function parentPath(parentSlug, parentParentId) {
  const slug = parentSlug || null;
  if (!slug) return null;
  return parentParentId == null ? `/category/${slug}` : `/s/${slug}`;
}

export default function Breadcrumb({ parentCategor, subCategory }) {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [crumb, setCrumb] = useState(null);

  useEffect(() => {
    let ignore = false;
    setCrumb(null);

    if (!slug) return undefined;

    fetchCategoryBreadcrumb(slug, i18n.language).then(data => {
      if (!ignore) setCrumb(data);
    });

    return () => {
      ignore = true;
    };
  }, [slug, i18n.language]);

  const parentName = crumb?.parentCategor || parentCategor;
  const currentName = crumb?.subCategory || subCategory;
  const parentTo = parentPath(crumb?.parentSlug, crumb?.parentParentId);

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link to="/" className={styles.link}>
        {t('header.bottomNav.home')}
      </Link>
      {parentName && (
        <>
          <IoIosArrowForward aria-hidden="true" />
          {parentTo ? (
            <Link to={parentTo} className={styles.link}>
              {parentName}
            </Link>
          ) : (
            <span>{parentName}</span>
          )}
        </>
      )}
      {currentName && (
        <>
          <IoIosArrowForward aria-hidden="true" />
          <span className={styles.current} aria-current="page">
            {currentName}
          </span>
        </>
      )}
    </nav>
  );
}
