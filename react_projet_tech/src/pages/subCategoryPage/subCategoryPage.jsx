import styles from './subCategoryPage.module.css';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchSubCategories, fetchSubCateogryScreenAttributes } from '../../api/categoryService';
import { useState, useEffect, useRef, useMemo } from 'react';
import PriceFilter from '../../components/priceFilter';
import ProductCard from './components/productCard/productCard';
import FilterDropdown from './components/filterDropdown/filterDropdown';
import MobileFilter from './components/mobileFilter/mobileFilter';
import SortDropdown from './components/sortDropdown/sortDropdown';
import Breadcrumb from './components/breadcrumb/breadcrumb';
import MobileFilters from './components/mobileFilters/mobileFilters';
import 'rc-slider/assets/index.css';

const BASE_URL = 'http://localhost:5001';

export default function SubCategoryPage() {
  const sortRef = useRef(null);
  const mobileSortRef = useRef(null);
  const mobileFilterRef = useRef(null);
  const [sortDropdown, setSortDropdown] = useState(false); // Dropdown-ის გახსნა/დახურვისთვის
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [visibleCount, setVisibleCount] = useState(16);
  const [openDropDowns, setOpenDropDowns] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [screenAttributes, setScreenAttributes] = useState(null);
  const [sortOptions, setSortOptions] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 7169]);

  // 1. ახალი სთეითი გაფილტრული პროდუქტებისთვის
  const [filteredProducts, setFilteredProducts] = useState(null);

  const { t, i18n } = useTranslation();
  const { slug } = useParams(); // URL-ის კატეგორიის სლაგი (მაგ: mobile-phones)
  const ITEMS_PER_GROUP = 16;

  // 2. სწორი activeFilters სთეითი slug-ის მიხედვით
  const [activeFilters, setActiveFilters] = useState({
    category: slug || 'mobile-phones',
    filters: {}
  });

  // 3. როცა slug იცვლება URL-ში, განვაახლოთ activeFilters
  useEffect(() => {
    setActiveFilters({
      category: slug,
      filters: {}
    });
    setFilteredProducts(null); // ძველი გაფილტრული პროდუქტების გასუფთავება
  }, [slug]);

  const handleFilterChange = (attrName, optionValue, isChecked) => {
    setActiveFilters(prev => {
      const updatedFilters = { ...prev.filters };

      if (!updatedFilters[attrName]) {
        updatedFilters[attrName] = [];
      }

      if (isChecked) {
        updatedFilters[attrName].push(optionValue);
      } else {
        updatedFilters[attrName] = updatedFilters[attrName].filter(val => val !== optionValue);

        if (updatedFilters[attrName].length === 0) {
          delete updatedFilters[attrName];
        }
      }

      return {
        ...prev,
        category: slug, // ყოველთვის მიმდინარე slug
        filters: updatedFilters
      };
    });
  };

  // 4. სწორი API მოთხოვნის ფუნქცია
  const fetchFilteredProducts = async () => {
    try {
      const requestBody = {
        ...activeFilters,
        category: slug, // უზრუნველყოფს, რომ სწორი კატეგორია გაიგზავნოს
        lang: i18n.language.split('-')[0]
      };

      const response = await fetch('http://localhost:5001/api/products/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('პროდუქტების წამოღება ვერ მოხერხდა');
      }

      const resultProducts = await response.json();
      setFilteredProducts(resultProducts);
    } catch (error) {
      console.error('შეცდომა ფილტრაციისას:', error);
    }
  };

  // ავტომატური გაშვება, როდესაც activeFilters ან ენა შეიცვლება
  useEffect(() => {
    if (slug) {
      fetchFilteredProducts();
    }
  }, [activeFilters, i18n.language]);

  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const handleSeeMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_GROUP);
  };

  const toggleDropDown = index => {
    setOpenDropDowns(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectSort = type => {
    setSearchParams({ sort: type });
    setSortOptions(false);
  };

  const handlePriceChange = newRange => {
    setPriceRange(newRange);
  };

  const sortTypes = [
    { id: 'all', label: t('sort.title') },
    { id: 'priceAsc', label: t('sort.priceIncrease') },
    { id: 'priceDesc', label: t('sort.priceDecrese') },
    { id: 'nameAsc', label: t('sort.name') },
    { id: 'nameDesc', label: t('sort.nameReverse') }
  ];
  const sortType = searchParams.get('sort') || 'all';
  const selectedOption = sortTypes.find(option => option.id === sortType) || sortTypes[0];

  // slug-ის შეცვლისას ძველი მონაცემების გასუფთავება
  useEffect(() => {
    setSubCategories([]);
    setScreenAttributes(null);
    setOpenDropDowns([]);
    setVisibleCount(16);
  }, [slug]);

  // Fetch subcategories data (საწყისი პროდუქტები)
  useEffect(() => {
    let ignore = false;
    if (slug) {
      fetchSubCategories(slug, i18n.language)
        .then(data => {
          if (!ignore) setSubCategories(data);
        })
        .catch(err => console.error(err));
    }
    return () => {
      ignore = true;
    };
  }, [slug, i18n.language]);

  // console.log(subCategories, 'subCategories');

  // Fetch screenAttributes data (ფილტრების ჩექბოქსები)
  useEffect(() => {
    let ignore = false;
    if (slug) {
      fetchSubCateogryScreenAttributes(slug, i18n.language)
        .then(data => {
          if (!ignore) setScreenAttributes(data);
        })
        .catch(err => console.error(err));
    }
    return () => {
      ignore = true;
    };
  }, [slug, i18n.language]);

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = event => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOptions(false);
      }
      if (mobileSortRef.current && !mobileSortRef.current.contains(event.target)) {
        setSortOptions(false);
      }
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(event.target)) {
        setMobileFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Disable body scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileFilterOpen]);

  const formattedFilters = useMemo(() => {
    if (!screenAttributes?.filters) return [];

    const skipName = /model|артикул|p\/n|sku|ean|barcode/i;

    return Object.entries(screenAttributes.filters)
      .filter(([attrName, options]) => {
        if (skipName.test(attrName)) return false;
        const count = Array.isArray(options) ? options.length : 0;
        return count >= 2 && count <= 18;
      })
      .slice(0, 8)
      .map(([attrName, options]) => ({
        attribute_name: attrName,
        options: options || []
      }));
  }, [screenAttributes]);

  const getEffectivePrice = product => {
    const p = Number(product.price) || 0;
    const dp = Number(product.discount_price || product.discountPrice) || 0;
    return dp > 0 && dp < p ? dp : p;
  };

  const sortedProducts = useMemo(() => {
    const targetProducts = filteredProducts !== null ? filteredProducts : subCategories;

    if (!targetProducts) return [];

    let filtered = [...targetProducts].filter(product => {
      const price = getEffectivePrice(product);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return filtered.sort((a, b) => {
      const priceA = getEffectivePrice(a);
      const priceB = getEffectivePrice(b);

      if (sortType === 'priceAsc') {
        return priceA - priceB;
      }
      if (sortType === 'priceDesc') {
        return priceB - priceA;
      }
      if (sortType === 'nameAsc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortType === 'nameDesc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });
  }, [filteredProducts, subCategories, sortType, priceRange]);

  const handleToggleMobileFilter = () => {
    setMobileFilterOpen(!mobileFilterOpen);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Breadcrumb
          parentCategor={subCategories[0]?.parentCategor}
          parentSlug={subCategories[0]?.parentSlug || subCategories[0]?.parent_slug}
          parentParentId={subCategories[0]?.parentParentId ?? subCategories[0]?.parent_parent_id}
          subCategory={subCategories[0]?.subCategory}
        />
        <div className={styles.subCategoryHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.subCategoryTitle}>{subCategories[0]?.subCategory}</h1>
            {sortedProducts.length > 0 && (
              <span className={styles.resultCount}>
                {t('subCategory.productsCount', { count: sortedProducts.length })}
              </span>
            )}
          </div>

          {windowWidth >= 712 && (
            <SortDropdown
              sortType={sortType}
              sortTypes={sortTypes}
              selectedOption={selectedOption}
              isOpen={sortOptions}
              onToggle={() => setSortOptions(!sortOptions)}
              onSelect={handleSelectSort}
              t={t}
            />
          )}
        </div>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.filterGrid}>
          <div className={styles.filterGridHeader}></div>
          <div className={styles.priceFilterContainer}>
            <div className={styles.filterGridPrice}>
              <PriceFilter onPriceChange={handlePriceChange} />
            </div>
          </div>
          <div className={styles.attributesFilterContainer}>
            <div className={styles.filterGridDropDown}>
              {formattedFilters.map((attribute, index) => {
                  const isOpen = openDropDowns.includes(index);
                  return (
                    <FilterDropdown
                      key={attribute.attribute_name || index}
                      attributeName={attribute.attribute_name}
                      options={attribute.options}
                      activeFilters={activeFilters}
                      index={index}
                      isOpen={isOpen}
                      onToggle={toggleDropDown}
                      onFilterChange={handleFilterChange}
                    />
                  );
                })}
            </div>
          </div>
        </div>

        {windowWidth < 712 && (
          <MobileFilters
            sortType={sortType}
            sortTypes={sortTypes}
            selectedOption={selectedOption}
            sortOptions={sortOptions}
            onToggleSort={() => setSortOptions(!sortOptions)}
            onSelectSort={handleSelectSort}
            onToggleFilter={handleToggleMobileFilter}
            t={t}
            mobileSortRef={mobileSortRef}
          />
        )}

        <MobileFilter
          isOpen={mobileFilterOpen && windowWidth < 712}
          onClose={() => setMobileFilterOpen(false)}
          onPriceChange={handlePriceChange}
          formattedFilters={formattedFilters}
          openDropDowns={openDropDowns}
          onToggle={toggleDropDown}
          onFilterChange={handleFilterChange}
          t={t}
        />

        <div className={styles.productsGrid}>
          <div className={styles.mainDiv}>
            <div className={styles.outerDiv}>
              {sortedProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  {t('subCategory.noProducts')}
                  <span className={styles.emptyStateHint}>{t('subCategory.noProductsHint')}</span>
                </div>
              ) : (
                <div className={styles.sliderDiv}>
                  {sortedProducts.slice(0, visibleCount).map((product, index) => (
                    <ProductCard key={product.id || index} product={product} t={t} />
                  ))}
                </div>
              )}

              {visibleCount < sortedProducts.length && (
                <div className={styles.seeMoreContainer}>
                  <button type="button" className={styles.seeMoreBtn} onClick={handleSeeMore}>
                    {t('singleProduct.seeMore')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
