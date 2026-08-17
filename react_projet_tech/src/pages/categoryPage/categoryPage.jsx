import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./categoryPage.module.css";
import { IoIosArrowUp } from "react-icons/io";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OptimizedImage from "../../components/OptimizedImage/OptimizedImage";
import { getCategoryImageSrc, parseCategoryImages } from "../../utils/imageUrl";
import { API_URL } from "../../api/apiBase";

function CategoryPage() {
  const { slug } = useParams(); // URL-იდან ვიღებთ სლაგს (მაგ: mobile-phones-and-accessories)
  const [openCategoryBox, setOpenCategoryBox] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t, i18n } = useTranslation();
  const subcategories = categoryInfo?.subcategories || [];
  const categoryImageLinks = parseCategoryImages(categoryInfo?.image);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
    `${API_URL}/api/categories/single/${slug}?lang=${i18n.language.split("-")[0]}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(t("categoryPage.notFound"));
        return res.json();
      })
      .then((data) => {
        setCategoryInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, i18n.language]);

  const renderSubcategoryPanel = (extraClasses = "") => (
    <div className={`${styles.categorySubcategories} ${extraClasses}`}>
      <button
        type="button"
        className={styles.categorySubcategoryHeader}
        aria-expanded={openCategoryBox}
        onClick={() => setOpenCategoryBox(!openCategoryBox)}
      >
        <h4 className={styles.categorySubcategoryTitle}>{categoryInfo?.name}</h4>
        <span
          className={`${styles.categorySubcategoryIcon} ${
            openCategoryBox ? styles.categorySubcategoryIconActive : ""
          }`}
          aria-hidden="true"
        >
          <IoIosArrowUp />
        </span>
      </button>
      <div
        className={`${styles.categorySubcategoryList} ${
          openCategoryBox ? styles.categorySubcategoryListActive : ""
        }`}
      >
        {subcategories.map((sub) => (
          <Link
            key={sub.slug || sub.name}
            to={`/s/${sub.slug}`}
            className={styles.subCategoryLink}
            tabIndex={openCategoryBox ? 0 : -1}
          >
            {sub.name}
          </Link>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.categoryContainer}>
        <div className={styles.mainCategoryTitleContainer}>
          <div className={styles.skeletonTitle} />
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.categoryContainer}>
        <div className={styles.errorBox}>
          {error}
          <span className={styles.errorHint}>{t("categoryPage.errorHint")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoryContainer}>
      <div className={styles.mainCategoryTitleContainer}>
        <h1
          className={`${styles.mainCategoryTitle} ${windowWidth < 900 ? styles.mainCategoryTitleActive : ""}`}
        >
          {categoryInfo?.name}
        </h1>
        {renderSubcategoryPanel(
          `${windowWidth > 900 ? styles.categorySubcategoriesHidden : styles.active} ${openCategoryBox ? styles.subCategoriesbackGround : ""}`
        )}
      </div>

      <div className={styles.categoryContent}>
        <div className={styles.categoryTitle}>{t("categoryPage.title")}</div>
        <div className={styles.categoryName}>{categoryInfo?.name}</div>
        {renderSubcategoryPanel()}

        <div className={styles.categoryImages}>
          {subcategories.map((subCat, index) => (
            <Link
              key={subCat.slug || index}
              to={`/s/${subCat.slug}`}
              className={styles.categoryImageContainer}
            >
              <div className={styles.categoryImageWrapper}>
                <OptimizedImage
                  className={styles.categoryImage}
                  src={getCategoryImageSrc(categoryImageLinks[index], subCat, "hero")}
                  alt={subCat.name}
                  variant="hero"
                />
              </div>
              <div className={styles.categorySubcategoriesImagesTitle}>
                <p className={styles.categoryImageTitle}>{subCat.name}</p>
                <span className={styles.categoryImageArrow} aria-hidden="true">
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
