import { IoIosArrowDown } from "react-icons/io";
import styles from "./sortDropdown.module.css";

export default function SortDropdown({
  sortType,
  sortTypes,
  selectedOption,
  isOpen,
  onToggle,
  onSelect,
  t,
  isMobile = false,
}) {
  const containerClass = isMobile
    ? styles.mobileSortContainer
    : styles.arrangeContainer;
  const contentClass = isMobile
    ? styles.mobileSortContent
    : styles.arrangeContent;
  const optionsClass = isMobile
    ? styles.mobileSortOptions
    : styles.sortOptionsContainer;
  const optionClass = isMobile ? styles.mobileSortOption : styles.sortOption;
  const textClass = isMobile ? "" : styles.arrangeText;

  return (
    <div className={containerClass}>
      <div className={contentClass} onClick={() => onToggle()}>
        {isMobile ? (
          <span className={styles.mobileSortLabel}>{selectedOption.label}</span>
        ) : (
          <p className={textClass}>{selectedOption.label}</p>
        )}
        <IoIosArrowDown />
      </div>

      {isOpen && (
        <div className={optionsClass}>
          <div className={isMobile ? "" : styles.sortOptions}>
            {sortTypes.map((option) => (
              <div
                key={option.id}
                className={optionClass}
                onClick={() => onSelect(option.id)}
              >
                {isMobile ? option.label : option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
