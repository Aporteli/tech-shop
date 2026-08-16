export function buildSearchConditions(q) {
  const words = q.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  const primaryWord = words[0];
  const primaryPattern = `%${primaryWord}%`;
  const whereConditions = words
    .map(
      () => `(
          p.name LIKE ?
          OR p.short_description LIKE ?
          OR p.slug LIKE ?
          OR b.name LIKE ?
          OR b.slug LIKE ?
        )`
    )
    .join(' AND ');

  const wordParams = [];
  words.forEach(word => {
    const pattern = `%${word}%`;
    wordParams.push(pattern, pattern, pattern, pattern, pattern);
  });

  return { words, whereConditions, wordParams, primaryPattern };
}
