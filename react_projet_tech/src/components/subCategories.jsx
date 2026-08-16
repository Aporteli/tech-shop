import styles from "./subCategories.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchMegaMenuSubcategories } from "../api/categoryService";
import { useEffect, useState } from "react";

export default function SubCategories({ parentSlug }) {
  const { t, i18n } = useTranslation();
  const [menuGroups, setMenuGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentSlug) {
      setMenuGroups([]);
      return;
    }

    let ignore = false;
    setLoading(true);

    fetchMegaMenuSubcategories(parentSlug, i18n.language)
      .then((data) => {
        if (!ignore) setMenuGroups(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) setMenuGroups([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [parentSlug, i18n.language]);

  if (!parentSlug) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.megaMenuContainer}>
        <p className={styles.megaMenuMessage}>{t("header.categories")}...</p>
      </div>
    );
  }

  if (!menuGroups.length) {
    return (
      <div className={styles.megaMenuContainer}>
        <p className={styles.megaMenuMessage}>{t("subcategories.soon")}</p>
      </div>
    );
  }

  return (
    <div className={styles.megaMenuContainer}>
      <div className={styles.megaMenuGrid}>
        {menuGroups.map((group) => (
          <section key={group.slug} className={styles.group}>
            <Link className={styles.groupTitle} to={`/s/${group.slug}`}>
              {group.name}
            </Link>
            {group.children?.length > 0 ? (
              <ul className={styles.childList}>
                {group.children.map((child) => (
                  <li key={child.slug}>
                    <Link className={styles.childLink} to={`/s/${child.slug}`}>
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
