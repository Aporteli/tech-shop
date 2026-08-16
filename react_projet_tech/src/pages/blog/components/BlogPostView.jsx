import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Clock, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, getAdjacentPosts } from '../blogData';
import OptimizedImage from '../../../components/OptimizedImage/OptimizedImage';

export default function BlogPostView({ slug, styles }) {
  const { t } = useTranslation();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>{t('blog.postNotFound') || 'Article not found'}</h1>
          <Link to="/blog" className={styles.backLink}>
            <ArrowLeft size={18} />
            {t('blog.backToBlog') || 'Back to Blog'}
          </Link>
        </div>
      </div>
    );
  }

  const content = t(post.contentKey, { returnObjects: true });
  const paragraphs = Array.isArray(content?.paragraphs) ? content.paragraphs : [];
  const highlights = Array.isArray(content?.highlights) ? content.highlights : [];
  const conclusion = content?.conclusion || '';
  const related = getRelatedPosts(slug);
  const { prev, next } = getAdjacentPosts(slug);

  return (
    <article className={styles.container}>
      <div className={styles.topBar}>
        <Link to="/blog" className={styles.backLink}>
          <ArrowLeft size={18} />
          {t('blog.backToBlog') || 'Back to Blog'}
        </Link>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">{t('blog.home') || 'Home'}</Link>
          <span>/</span>
          <Link to="/blog">{t('blog.title') || 'Blog'}</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{t(post.categoryKey)}</span>
        </nav>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroImage}>
          <OptimizedImage
            src={post.image}
            alt={t(post.titleKey)}
            variant="hero"
            eager
          />
          <div className={styles.category}>{t(post.categoryKey)}</div>
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t(post.titleKey)}</h1>
          <p className={styles.excerpt}>{t(post.excerptKey)}</p>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <User size={16} />
              {t(post.authorKey)}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={16} />
              {post.date}
            </span>
            <span className={styles.metaItem}>
              <Clock size={16} />
              {post.readTime}
            </span>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.article}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}

          {highlights.length > 0 && (
            <div className={styles.highlights}>
              <h2 className={styles.sectionTitle}>
                {t('blog.keyTakeaways') || 'Key Takeaways'}
              </h2>
              <ul className={styles.highlightList}>
                {highlights.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {conclusion && <p className={styles.conclusion}>{conclusion}</p>}

          <div className={styles.tags}>
            <Tag size={16} className={styles.tagsIcon} />
            {post.tagsKeys.map(tagKey => (
              <span key={tagKey} className={styles.tag}>
                {t(tagKey)}
              </span>
            ))}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.authorCard}>
            <div className={styles.authorAvatar}>
              <User size={28} />
            </div>
            <div>
              <p className={styles.authorLabel}>{t('blog.writtenBy') || 'Written by'}</p>
              <p className={styles.authorName}>{t(post.authorKey)}</p>
            </div>
          </div>

          <div className={styles.relatedBlock}>
            <h2 className={styles.relatedTitle}>
              {t('blog.relatedPosts') || 'Related Posts'}
            </h2>
            <div className={styles.relatedList}>
              {related.map(item => (
                <Link key={item.id} to={item.route} className={styles.relatedCard}>
                  <OptimizedImage
                    src={item.image}
                    alt={t(item.titleKey)}
                    variant="thumb"
                  />
                  <div>
                    <span className={styles.relatedCategory}>{t(item.categoryKey)}</span>
                    <h3>{t(item.titleKey)}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <nav className={styles.postNav}>
        {prev ? (
          <Link to={prev.route} className={styles.postNavLink}>
            <span className={styles.postNavLabel}>
              <ArrowLeft size={16} />
              {t('blog.previous') || 'Previous'}
            </span>
            <span className={styles.postNavTitle}>{t(prev.titleKey)}</span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link to={next.route} className={`${styles.postNavLink} ${styles.postNavNext}`}>
            <span className={styles.postNavLabel}>
              {t('blog.next') || 'Next'}
              <ArrowRight size={16} />
            </span>
            <span className={styles.postNavTitle}>{t(next.titleKey)}</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
