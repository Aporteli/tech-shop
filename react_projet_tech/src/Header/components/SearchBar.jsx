import SearchIcon from "../../icons/searchIcon.jsx";
import styles from "../Header.module.css";

export default function SearchBar({
  searchQuery,
  handleSearch,
  openModal,
  openModalHandler,
  handleSearchSubmit,
  t,
}) {
  return (
    <div
      className={`${styles.searchBar} ${openModal ? styles.searchBarOpen : ""}`}
    >
      <input
        onClick={openModalHandler}
        className={styles.searchInput}
        type="search"
        aria-label={t("header.searchPlaceholder")}
        placeholder={t("header.searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleSearchSubmit}
      />
      <SearchIcon />
    </div>
  );
}
