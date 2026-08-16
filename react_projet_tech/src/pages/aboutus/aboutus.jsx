import styles from './aboutus.module.css';

export default function Aboutus() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About us</h1>
      <p className={styles.text}>
        This is a demo tech shop with electronics, home appliances, and gadgets. Browse categories,
        compare products, and add items to your cart or wishlist.
      </p>
    </div>
  );
}
