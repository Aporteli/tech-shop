import { useEffect } from "react";
import { FaX } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import CategoriesDropdown from "../../components/categoriesDropdown.jsx";
import styles from "../Header.module.css";

export default function TabletCategoryPanel({ categoryOpen, setCategoryOpen }) {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (categoryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [categoryOpen]);

  useEffect(() => {
    setCategoryOpen(false);
  }, [location.pathname, location.search, setCategoryOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setCategoryOpen(false);
      }
    };

    if (categoryOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryOpen, setCategoryOpen]);

  if (!categoryOpen) return null;

  const closeOnLinkClick = (e) => {
    if (e.target.closest("a")) {
      setCategoryOpen(false);
    }
  };

  return (
    <div
      className={styles.tabletCategoryPanel}
      onClick={() => setCategoryOpen(false)}
    >
      <div
        className={styles.tabletCategoryPanelContent}
        role="dialog"
        aria-modal="true"
        aria-label={t("header.categories")}
        onClick={(e) => {
          e.stopPropagation();
          closeOnLinkClick(e);
        }}
      >
        <div className={styles.tabletCategoryPanelHeader}>
          <h2 className={styles.tabletCategoryPanelTitle}>{t("header.categories")}</h2>
          <button
            type="button"
            className={styles.tabletCategoryPanelClose}
            aria-label={t("header.close")}
            onClick={() => setCategoryOpen(false)}
          >
            <FaX />
          </button>
        </div>
        <CategoriesDropdown />
      </div>
    </div>
  );
}
