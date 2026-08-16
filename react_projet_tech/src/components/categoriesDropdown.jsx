import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./categoriesDropdown.module.css";

// აიქონების იმპორტი
import {
  HiMiniDevicePhoneMobile,
  HiOutlineTv,
  HiOutlineVideoCamera,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import {
  MdOutlineLaptopMac,
  MdOutlineElectricScooter,
  MdOutlineDiscount,
  MdOutlineElectricMoped,
} from "react-icons/md";
import { SiYoutubegaming } from "react-icons/si";
import { GiHeadphones } from "react-icons/gi";
import { LuWashingMachine } from "react-icons/lu";
import { TbGardenCart } from "react-icons/tb";
import { PiOven, PiHairDryer } from "react-icons/pi";
import { IoRocketOutline } from "react-icons/io5";
import { FaServicestack } from "react-icons/fa6";

import SubCategories from "./subCategories";
import { useTranslation } from "react-i18next";

// 1. ვქმნით მუდმივ მასივს კონფიგურაციისთვის
const CATEGORIES_CONFIG = [
  {
    id: "0",
    icon: HiMiniDevicePhoneMobile,
    key: "mobilePhonesAndAccessories",
  },
  {
    id: "1",
    icon: MdOutlineLaptopMac,
    key: "computersAndAccessories",
  },
  { id: "2", icon: HiOutlineTv, key: "tvAndAudio", hasLink: true, link: "#" },
  { id: "3", icon: SiYoutubegaming, key: "gaming", hasLink: true, link: "#" },
  {
    id: "4",
    icon: HiOutlineVideoCamera,
    key: "photoAndVideo",
  },
  { id: "5", icon: GiHeadphones, key: "headphones" },
  {
    id: "6",
    icon: LuWashingMachine,
    key: "homeAppliances",
  },
  {
    id: "7",
    icon: PiOven,
    key: "smallDomesticAppliances",
  },
  {
    id: "8",
    icon: TbGardenCart,
    key: "houseAndGarden",
  },
  { id: "9", icon: PiHairDryer, key: "personalCare" },
  {
    id: "10",
    icon: HiOutlineLightBulb,
    key: "smartHome",
  },
  {
    id: "11",
    icon: IoRocketOutline,
    key: "parentAndChild",
  },
  {
    id: "12",
    icon: MdOutlineElectricMoped,
    key: "electricVehiclesAndCarTools",
  },
  {
    id: "13",
    icon: MdOutlineElectricScooter,
    key: "electricTransport",
  },
  {
    id: "14",
    icon: MdOutlineDiscount,
    key: "outlet",
  },
  { id: "15", icon: FaServicestack, key: "services" },
];

function CategoriesDropdown() {
  const [products, setProducts] = useState([]); // აქ ინახება ბაზიდან წამოღებული [ {id, name, slug}, ... ]
  const [loading, setLoading] = useState(true);
  const [sideContainerOpen, setSideContainerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState(null);

  const { t } = useTranslation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    // შენი ბექენდის მისამართი
    fetch("http://localhost:5001/api/categories/main-categories")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
        console.log(data, "ჩამოსაშლელი კატეგორიები");
      })
      .catch((err) => {
        console.error("შეცდომა ბაზიდან წამოღებისას:", err);
        setLoading(false);
      });
  }, []);

  const handleMouseEnter = (id, slug) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSideContainerOpen(true);
    setActiveCategory(id);
    setActiveCategorySlug(slug || null);
  };

  const handleSideContainerMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSideContainerOpen(false);
      setActiveCategory(null);
      setActiveCategorySlug(null);
    }, 200);
  };

  if (loading) {
    return (
      <div className={styles.loading}>იტვირთება პროდუქტები ბაზიდან...</div>
    );
  }

  return (
    <>
      <div className={styles.categoriesDropdownOverlay}></div>
      <div
        className={styles.categoriesContainer}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.categoriesDropdown}>
          {CATEGORIES_CONFIG.map((cat, index) => {
            const IconComponent = cat.icon;
            const dbCategory = products[index];
            const dynamicSlug = dbCategory
              ? `/category/${dbCategory.slug}`
              : `/category/${cat.key}`;

            const categoryContent = (
              <div
                className={`${styles.category} ${activeCategory === cat.id ? styles.activeCategory : ""}`}
                onMouseEnter={() => handleMouseEnter(cat.id, dbCategory?.slug)}
                onClick={e => {
                  const isTouchUi = window.matchMedia('(hover: none)').matches;
                  if (!isTouchUi || window.innerWidth <= 1180) return;
                  if (activeCategory === cat.id) return;
                  e.preventDefault();
                  handleMouseEnter(cat.id, dbCategory?.slug);
                }}
              >
                <IconComponent className={styles.categoryIcon} />
                <p className={styles.categoryTitle}>
                  {t(`listCategories.${cat.key}`)}
                </p>
              </div>
            );

            return (
              <Link
                key={cat.id}
                className={styles.categoryLink}
                to={dynamicSlug}
              >
                {categoryContent}
              </Link>
            );
          })}
        </div>

        {sideContainerOpen && (
          <div
            className={styles.sideContainer}
            onMouseEnter={handleSideContainerMouseEnter}
          >
            <SubCategories parentSlug={activeCategorySlug} />
          </div>
        )}
      </div>
    </>
  );
}
export default CategoriesDropdown;
