import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './blog.module.css';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { blogPostsMeta } from './blogData';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';

export default function Blog() {
  const { t } = useTranslation();

  const blogPosts = blogPostsMeta.map(post => ({
    ...post,
    title: t(post.titleKey),
    excerpt: t(post.excerptKey),
    author: t(post.authorKey),
    category: t(post.categoryKey)
  }));

  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('blog.title')}</h1>
        <p className={styles.subtitle}>{t('blog.subtitle')}</p>
      </div>

      <div className={styles.content}>
        <article className={styles.featuredPost}>
          <Link to={featured.route} className={styles.featuredImage}>
            <OptimizedImage
              src={featured.image}
              alt={featured.title}
              variant="hero"
              eager
            />
            <div className={styles.featuredCategory}>{featured.category}</div>
          </Link>
          <div className={styles.featuredContent}>
            <Link to={featured.route} className={styles.featuredTitleLink}>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
            </Link>
            <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
            <div className={styles.postMeta}>
              <span className={styles.metaItem}>
                <User size={16} />
                {featured.author}
              </span>
              <span className={styles.metaItem}>
                <Calendar size={16} />
                {featured.date}
              </span>
              <span className={styles.metaItem}>
                <Clock size={16} />
                {featured.readTime}
              </span>
            </div>
            <Link to={featured.route} className={styles.readMoreButton}>
              {t('blog.readMore')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </article>

        <div className={styles.postsGrid}>
          {rest.map(post => (
            <Link key={post.id} to={post.route} className={styles.postCard}>
              <article>
                <div className={styles.postImage}>
                  <OptimizedImage
                    src={post.image}
                    alt={post.title}
                    variant="thumb"
                  />
                  <div className={styles.postCategory}>{post.category}</div>
                </div>
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                  <div className={styles.postMeta}>
                    <span className={styles.metaItem}>
                      <User size={14} />
                      {post.author}
                    </span>
                    <span className={styles.metaItem}>
                      <Calendar size={14} />
                      {post.date}
                    </span>
                    <span className={styles.metaItem}>
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
