import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './searchResults.module.css';
import { useTranslation } from 'react-i18next';
import ProductCard from '../subCategoryPage/components/productCard/productCard';
import { IoIosArrowDown } from 'react-icons/io';
import { fetchAllCategoryAttributes } from '../../api/categoryService';
import { API_URL } from '../../api/apiBase';

function SearchResults() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const products = data.find(item => item.type === 'products')?.items || [];
  const categories = data.find(item => item.type === 'categories')?.items || [];

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySectionOpen, setCategorySectionOpen] = useState(true);
  const [attributesSectionOpen, setAttributesSectionOpen] = useState(true);
  const [allAttributes, setAllAttributes] = useState(null);
  const [openDropDowns, setOpenDropDowns] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ filters: {} });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query || query.trim().length < 2) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const lang = i18n.language.split('-')[0];
        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(query)}&lang=${lang}&limit=500`
        );
        const result = await response.json();

        setData([
          { type: 'products', items: result.products || [] },
          { type: 'categories', items: result.categories || [] }
        ]);
      } catch (fetchError) {
        console.error('Search error:', fetchError);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, i18n.language]);

  useEffect(() => {
    setActiveFilters({ filters: {} });
    setSelectedCategories([]);
    setFilteredProducts([]);
    setOpenDropDowns([]);
  }, [query]);

  useEffect(() => {
    const fetchAllAttributes = async () => {
      if (categories.length === 0) {
        setAllAttributes(null);
        return;
      }

      try {
        const lang = i18n.language.split('-')[0];
        const attributesResults = await Promise.all(
          categories.map(cat => fetchAllCategoryAttributes(cat.slug, lang))
        );

        const mergedAttributes = { filters: {} };
        attributesResults.forEach(attrData => {
          if (!attrData?.filters) return;

          Object.entries(attrData.filters).forEach(([attrName, options]) => {
            if (!mergedAttributes.filters[attrName]) {
              mergedAttributes.filters[attrName] = [];
            }

            options.forEach(opt => {
              const optValue = typeof opt === 'object' ? opt.id || opt.name : opt;
              const exists = mergedAttributes.filters[attrName].some(existing => {
                const existingValue =
                  typeof existing === 'object' ? existing.id || existing.name : existing;
                return existingValue === optValue;
              });

              if (!exists) {
                mergedAttributes.filters[attrName].push(opt);
              }
            });
          });
        });

        setAllAttributes(mergedAttributes);
      } catch (fetchError) {
        console.error('Error fetching attributes:', fetchError);
      }
    };

    fetchAllAttributes();
  }, [categories, i18n.language]);

  const hasAttributeFilters = Object.keys(activeFilters.filters).length > 0;
  const activeFilterCount =
    selectedCategories.length +
    Object.values(activeFilters.filters).reduce((sum, values) => sum + values.length, 0);

  const fetchFilteredProducts = async () => {
    if (!hasAttributeFilters) {
      setFilteredProducts([]);
      return;
    }

    setFilterLoading(true);
    try {
      const categoriesToFilter =
        selectedCategories.length > 0 ? selectedCategories : categories.map(cat => cat.slug);

      const sanitizedFilters = Object.fromEntries(
        Object.entries(activeFilters.filters).map(([key, values]) => [key, [...new Set(values)]])
      );

      const response = await fetch(`${API_URL}/api/products/filter-multi-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: categoriesToFilter,
          filters: sanitizedFilters,
          lang: i18n.language.split('-')[0],
          q: query
        })
      });

      if (!response.ok) {
        throw new Error('Failed to filter products');
      }

      setFilteredProducts(await response.json());
    } catch (fetchError) {
      console.error('Error filtering products:', fetchError);
      setFilteredProducts([]);
    } finally {
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && hasAttributeFilters) {
      setFilteredProducts([]);
      fetchFilteredProducts();
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategories, activeFilters, categories, i18n.language, query]);

  const handleCategoryChange = (categorySlug, isChecked) => {
    setSelectedCategories(prev =>
      isChecked ? [...prev, categorySlug] : prev.filter(slug => slug !== categorySlug)
    );
  };

  const handleFilterChange = (attrName, optionValue, isChecked) => {
    setActiveFilters(prev => {
      const currentList = prev.filters[attrName] || [];
      const updatedList = isChecked
        ? currentList.includes(optionValue)
          ? currentList
          : [...currentList, optionValue]
        : currentList.filter(val => val !== optionValue);

      const updatedFilters = { ...prev.filters };
      if (updatedList.length > 0) {
        updatedFilters[attrName] = updatedList;
      } else {
        delete updatedFilters[attrName];
      }

      return { ...prev, filters: updatedFilters };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ filters: {} });
    setSelectedCategories([]);
  };

  const toggleDropDown = attributeName => {
    setOpenDropDowns(prev =>
      prev.includes(attributeName)
        ? prev.filter(name => name !== attributeName)
        : [...prev, attributeName]
    );
  };

  const baseProducts =
    hasAttributeFilters && !filterLoading ? filteredProducts : hasAttributeFilters ? [] : products;
  const finalFilteredProducts =
    selectedCategories.length > 0
      ? baseProducts.filter(product => selectedCategories.includes(product.category_slug))
      : baseProducts;

  const hasSearchResults = products.length > 0;
  const isResultsLoading = loading || filterLoading;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link to="/">{t('searchResults.backToHome')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{t('searchResults.title')}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{t('searchResults.title')}</h1>
          <p className={styles.queryBadge}>"{query}"</p>
        </div>
        <p className={styles.resultsCount}>
          {isResultsLoading ? (
            t('searchResults.loading')
          ) : (
            <>
              <span className={styles.resultsNumber}>{finalFilteredProducts.length}</span>
              {t('searchResults.resultsFound')}
            </>
          )}
        </p>
      </header>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>{t('searchResults.loading')}</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !hasSearchResults && (
        <div className={styles.noResults}>
          <p>{t('searchResults.noResults')}</p>
          <Link to="/" className={styles.backLink}>
            {t('searchResults.backToHome')}
          </Link>
        </div>
      )}

      {!loading && !error && hasSearchResults && (
        <div className={styles.gridContainer}>
          <aside className={styles.filtersContainer}>
            {activeFilterCount > 0 && (
              <div className={styles.filtersToolbar}>
                <span className={styles.activeFiltersBadge}>
                  {activeFilterCount} active
                </span>
                <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
                  Clear all
                </button>
              </div>
            )}

            <div className={styles.filterCard}>
              <button
                type="button"
                className={styles.filterSectionHeader}
                onClick={() => setCategorySectionOpen(prev => !prev)}
                aria-expanded={categorySectionOpen}>
                <span className={styles.filterSectionTitle}>Category</span>
                <IoIosArrowDown
                  className={`${styles.arrowIcon} ${categorySectionOpen ? styles.arrowIconOpen : ''}`}
                />
              </button>

              <div
                className={`${styles.collapse} ${categorySectionOpen ? styles.collapseOpen : ''}`}>
                <div className={styles.collapseInner}>
                  <div className={styles.filterList}>
                    {categories.map(cat => (
                      <label key={cat.id} className={styles.filterCheckboxItem}>
                        <input
                          type="checkbox"
                          value={cat.slug}
                          onChange={e => handleCategoryChange(cat.slug, e.target.checked)}
                          checked={selectedCategories.includes(cat.slug)}
                        />
                        <span className={styles.filterLabel}>{cat.name}</span>
                        <span className={styles.filterCount}>{cat.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {allAttributes?.filters && Object.keys(allAttributes.filters).length > 0 && (
              <div className={styles.filterCard}>
                <button
                  type="button"
                  className={styles.filterSectionHeader}
                  onClick={() => setAttributesSectionOpen(prev => !prev)}
                  aria-expanded={attributesSectionOpen}>
                  <span className={styles.filterSectionTitle}>Attributes</span>
                  <IoIosArrowDown
                    className={`${styles.arrowIcon} ${attributesSectionOpen ? styles.arrowIconOpen : ''}`}
                  />
                </button>

                <div
                  className={`${styles.collapse} ${attributesSectionOpen ? styles.collapseOpen : ''}`}>
                  <div className={styles.collapseInner}>
                    <div className={styles.attributeList}>
                      {Object.entries(allAttributes.filters).map(([attributeName, options]) => {
                        const isOpen = openDropDowns.includes(attributeName);
                        const selectedCount =
                          activeFilters.filters[attributeName]?.length || 0;

                        return (
                          <div key={attributeName} className={styles.attributeDropdown}>
                            <button
                              type="button"
                              className={`${styles.attributeDropdownHeader} ${isOpen ? styles.attributeDropdownHeaderOpen : ''}`}
                              onClick={() => toggleDropDown(attributeName)}
                              aria-expanded={isOpen}>
                              <span className={styles.attributeDropdownTitle}>
                                {attributeName}
                                {selectedCount > 0 && (
                                  <span className={styles.attributeSelectedCount}>
                                    {selectedCount}
                                  </span>
                                )}
                              </span>
                              <IoIosArrowDown
                                className={`${styles.arrowIcon} ${isOpen ? styles.arrowIconOpen : ''}`}
                              />
                            </button>

                            <div
                              className={`${styles.attributeCollapse} ${isOpen ? styles.attributeCollapseOpen : ''}`}>
                              <div className={styles.attributeCollapseInner}>
                                <div className={styles.attributeOptions}>
                                  {options?.length > 0 ? (
                                    options.map((option, optIndex) => {
                                      const optValue =
                                        typeof option === 'object'
                                          ? option.id || option.name
                                          : option;
                                      const optLabel =
                                        typeof option === 'object' ? option.name : option;

                                      return (
                                        <label
                                          key={`${attributeName}-${optValue}-${optIndex}`}
                                          className={styles.filterCheckboxItem}>
                                          <input
                                            type="checkbox"
                                            value={optValue}
                                            onChange={e =>
                                              handleFilterChange(
                                                attributeName,
                                                optValue,
                                                e.target.checked
                                              )
                                            }
                                            checked={
                                              activeFilters.filters[attributeName]?.includes(
                                                optValue
                                              ) || false
                                            }
                                          />
                                          <span className={styles.filterLabel}>{optLabel}</span>
                                        </label>
                                      );
                                    })
                                  ) : (
                                    <p className={styles.emptyOptions}>No options</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <section className={styles.productsPanel}>
            {filterLoading && (
              <div className={styles.productsOverlay}>
                <div className={styles.spinnerSmall} />
              </div>
            )}

            {finalFilteredProducts.length === 0 ? (
              <div className={styles.noResultsInline}>
                <p>{t('searchResults.noResults')}</p>
                {activeFilterCount > 0 && (
                  <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {finalFilteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} t={t} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
