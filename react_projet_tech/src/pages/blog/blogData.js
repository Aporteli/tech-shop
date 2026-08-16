export const blogPostsMeta = [
  {
    id: 1,
    slug: 'latest-tech-trends-2024',
    date: '2024-01-15',
    readTime: '5 min',
    image: '/uploads/unsplash/1518770660439-4636190af475.jpg',
    titleKey: 'blog.post1Title',
    excerptKey: 'blog.post1Excerpt',
    authorKey: 'blog.author1',
    categoryKey: 'blog.category1',
    contentKey: 'blog.post1Content',
    tagsKeys: ['blog.post1Tag1', 'blog.post1Tag2', 'blog.post1Tag3'],
    route: '/blog/latest-tech-trends-2024'
  },
  {
    id: 2,
    slug: 'best-gaming-laptops-under-1000',
    date: '2024-01-10',
    readTime: '8 min',
    image: '/uploads/unsplash/1593640408182-31c70c8268f5.jpg',
    titleKey: 'blog.post2Title',
    excerptKey: 'blog.post2Excerpt',
    authorKey: 'blog.author2',
    categoryKey: 'blog.category2',
    contentKey: 'blog.post2Content',
    tagsKeys: ['blog.post2Tag1', 'blog.post2Tag2', 'blog.post2Tag3'],
    route: '/blog/best-gaming-laptops-under-1000'
  },
  {
    id: 3,
    slug: 'smart-home-automation-guide',
    date: '2024-01-05',
    readTime: '6 min',
    image: '/uploads/unsplash/1573164713988-8665fc963095.jpg',
    titleKey: 'blog.post3Title',
    excerptKey: 'blog.post3Excerpt',
    authorKey: 'blog.author3',
    categoryKey: 'blog.category3',
    contentKey: 'blog.post3Content',
    tagsKeys: ['blog.post3Tag1', 'blog.post3Tag2', 'blog.post3Tag3'],
    route: '/blog/smart-home-automation-guide'
  },
  {
    id: 4,
    slug: 'iphone-15-pro-max-review',
    date: '2024-01-01',
    readTime: '10 min',
    image: '/uploads/unsplash/1591337676887-a217a6970a8a.jpg',
    titleKey: 'blog.post4Title',
    excerptKey: 'blog.post4Excerpt',
    authorKey: 'blog.author4',
    categoryKey: 'blog.category4',
    contentKey: 'blog.post4Content',
    tagsKeys: ['blog.post4Tag1', 'blog.post4Tag2', 'blog.post4Tag3'],
    route: '/blog/iphone-15-pro-max-review'
  },
  {
    id: 5,
    slug: 'wireless-headphones-buying-guide',
    date: '2023-12-28',
    readTime: '7 min',
    image: '/uploads/unsplash/1505740420928-5e560c06d30e.jpg',
    titleKey: 'blog.post5Title',
    excerptKey: 'blog.post5Excerpt',
    authorKey: 'blog.author5',
    categoryKey: 'blog.category5',
    contentKey: 'blog.post5Content',
    tagsKeys: ['blog.post5Tag1', 'blog.post5Tag2', 'blog.post5Tag3'],
    route: '/blog/wireless-headphones-buying-guide'
  },
  {
    id: 6,
    slug: 'home-theater-setup-tips',
    date: '2023-12-20',
    readTime: '9 min',
    image: '/uploads/unsplash/1593359677879-a4bb92f829d1.jpg',
    titleKey: 'blog.post6Title',
    excerptKey: 'blog.post6Excerpt',
    authorKey: 'blog.author6',
    categoryKey: 'blog.category6',
    contentKey: 'blog.post6Content',
    tagsKeys: ['blog.post6Tag1', 'blog.post6Tag2', 'blog.post6Tag3'],
    route: '/blog/home-theater-setup-tips'
  }
];

export function getPostBySlug(slug) {
  return blogPostsMeta.find(post => post.slug === slug) || null;
}

export function getRelatedPosts(slug, limit = 3) {
  return blogPostsMeta.filter(post => post.slug !== slug).slice(0, limit);
}

export function getAdjacentPosts(slug) {
  const index = blogPostsMeta.findIndex(post => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? blogPostsMeta[index - 1] : null,
    next: index < blogPostsMeta.length - 1 ? blogPostsMeta[index + 1] : null
  };
}
