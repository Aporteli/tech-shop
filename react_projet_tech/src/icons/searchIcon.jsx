import styles from "../Header/Header.module.css";

export default function SearchIcon() {
  return (
    <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 100"
  width="100%"
  height="100%"
  className={styles.searchIcon}
>
  {/* იისფერი ფონი */}
  <circle cx="50" cy="50" r="45" fill="#7f56d9" />

  {/* საძიებო ლუპის წრე */}
  <circle
    cx="43"
    cy="43"
    r="14"
    fill="none"
    stroke="#ffffff"
    strokeWidth="5"
  />

  {/* საძიებო ლუპის ტარი */}
  <line
    x1="53"
    y1="53"
    x2="67"
    y2="67"
    stroke="#ffffff"
    strokeWidth="6"
    strokeLinecap="round"
  />
</svg>
  );
}   