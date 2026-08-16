import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { IoIosArrowDown } from "react-icons/io";
import PriceFilter from "../../../../components/priceFilter";
import styles from "./mobileFilter.module.css";

export default function MobileFilter({
  isOpen,
  onClose,
  onPriceChange,
  formattedFilters,
  openDropDowns,
  onToggle,
  onFilterChange,
  t,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.mobileFilterOverlay}>
      <div className={styles.mobileFilterPanel}>
        <div className={styles.mobileFilterHeader}>
          <h3>{t("sort.filter")}</h3>
          <div className={styles.mobileFilterClose} onClick={onClose}>
            ✕
          </div>
        </div>
        <OverlayScrollbarsComponent
          element="div"
          options={{
            scrollbars: {
              autoHide: "leave",
              theme: "os-theme-dark",
            },
          }}
          className={styles.mobileFilterContent}
        >
          <div className={styles.mobileFilterPrice}>
            <PriceFilter onPriceChange={onPriceChange} />
          </div>
          <div className={styles.mobileFilterAttributes}>
            {formattedFilters.map((attribute, index) => {
              const isOpen = openDropDowns.includes(index);

              return (
                <div
                  key={attribute.attribute_name || index}
                  className={`${styles.mobileFilterAttributeItem} ${
                    styles[`mobileFilterAttributeItem${index}`]
                  }`}
                >
                  <div
                    className={styles.mobileFilterAttributeHeader}
                    onClick={() => onToggle(index)}
                  >
                    <p className={styles.mobileFilterAttributeName}>
                      {attribute.attribute_name}
                    </p>
                    <IoIosArrowDown
                      className={isOpen ? styles.mobileFilterArrowOpen : ""}
                    />
                  </div>

                  <OverlayScrollbarsComponent
                    element="div"
                    options={{
                      scrollbars: {
                        autoHide: "leave",
                        theme: "os-theme-dark",
                      },
                    }}
                    className={`${styles.mobileFilterAttributeList} ${
                      isOpen ? styles.mobileFilterAttributeListActive : ""
                    }`}
                  >
                    {attribute.options && attribute.options.length > 0 ? (
                      attribute.options.map((option, optIndex) => {
                        const optValue =
                          typeof option === "object"
                            ? option.id || option.name
                            : option;
                        const optLabel =
                          typeof option === "object" ? option.name : option;

                        return (
                          <label
                            key={optIndex}
                            className={styles.mobileFilterCheckboxItem}
                          >
                            <input
                              type="checkbox"
                              value={optValue}
                              onChange={(e) =>
                                onFilterChange(
                                  attribute.attribute_name,
                                  optValue,
                                  e.target.checked,
                                )
                              }
                            />
                            <span>{optLabel}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p>მონაცემები არ არის</p>
                    )}
                  </OverlayScrollbarsComponent>
                </div>
              );
            })}
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
}
