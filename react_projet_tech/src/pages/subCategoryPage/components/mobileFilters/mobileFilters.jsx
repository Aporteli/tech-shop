import { Filter } from "lucide-react";
import SortDropdown from "../sortDropdown/sortDropdown";
import styles from "./mobileFilters.module.css";

export default function MobileFilters({
  sortType,
  sortTypes,
  selectedOption,
  sortOptions,
  onToggleSort,
  onSelectSort,
  onToggleFilter,
  t,
  mobileSortRef,
}) {
  return (
    <div className={styles.mobileFilters}>
      <div className={styles.mobileFiltersItem} ref={mobileSortRef}>
        <SortDropdown
          sortType={sortType}
          sortTypes={sortTypes}
          selectedOption={selectedOption}
          isOpen={sortOptions}
          onToggle={onToggleSort}
          onSelect={onSelectSort}
          t={t}
          isMobile={true}
        />
      </div>
      <div
        className={styles.mobileFiltersItem}
        onClick={onToggleFilter}
      >
        <Filter size={18} />
        {t("sort.filter")}
      </div>
    </div>
  );
}
