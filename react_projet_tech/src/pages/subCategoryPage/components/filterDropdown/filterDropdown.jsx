import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { IoIosArrowDown } from "react-icons/io";
import styles from "./filterDropdown.module.css";

export default function FilterDropdown({
  attributeName,
  options,
  index,
  isOpen,
  onToggle,
  onFilterChange,
  activeFilters,
}) {
  return (
    <div
      key={index}
      className={`${styles.filterGridDropDownItem} ${
        styles[`filterGridDropDownItem${index}`]
      }`}
      onClick={() => onToggle(index)}
    >
      <div className={styles.filterGridDropDownItemContent}>
        <p className={styles.filterGridDropDownItemName}>{attributeName}</p>
        <IoIosArrowDown />
      </div>

      <OverlayScrollbarsComponent
        element="div"
        options={{
          scrollbars: {
            autoHide: "leave",
            theme: "os-theme-dark",
          },
        }}
        className={`${styles.filterGridDropDownItemList} ${
          isOpen ? styles.filterGridDropDownItemListActive : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {options && options.length > 0 ? (
          options.map((option, optIndex) => {
            const optValue =
              typeof option === "object" ? option.id || option.name : option;
            const optLabel = typeof option === "object" ? option.name : option;

            return (
              <label key={optIndex} className={styles.filterCheckboxItem}>
                <input
                  type="checkbox"
                  value={optValue}
                  onChange={(e) =>
                    onFilterChange(attributeName, optValue, e.target.checked)
                  }
                  checked={
                    activeFilters.filters[attributeName]?.includes(optValue) ||
                    false // ✅ დაემატა .filters
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
}
