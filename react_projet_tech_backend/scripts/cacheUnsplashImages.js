import 'dotenv/config';
import { PHOTO_POOLS } from '../utils/unsplashCatalog.js';
import { ensureCachedPhoto, cachedPhotoPath } from '../utils/imageStore.js';

const EXTRA_IDS = ['1519389950479-45b2aa3d0d0d', '1518770660439-4636190af475'];

function uniquePhotoIds() {
  const ids = Object.values(PHOTO_POOLS)
    .flat()
    .concat(EXTRA_IDS)
    .filter(Boolean);
  return [...new Set(ids)];
}

async function runPool(items, limit, worker) {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  });
  await Promise.all(workers);
}

async function run() {
  const ids = uniquePhotoIds();
  let cached = 0;
  let downloaded = 0;
  let failed = 0;

  console.log(`Caching ${ids.length} catalog photos...`);

  await runPool(ids, 6, async photoId => {
    const alreadyHad = Boolean(cachedPhotoPath(photoId));
    const filePath = await ensureCachedPhoto(photoId);
    const ok = Boolean(filePath && filePath.endsWith('.jpg'));
    if (alreadyHad && ok) {
      cached += 1;
    } else if (ok) {
      downloaded += 1;
      process.stdout.write(`saved ${photoId}\n`);
    } else {
      failed += 1;
      process.stdout.write(`fallback ${photoId}\n`);
    }
  });

  console.log(`Done. cached=${cached} downloaded=${downloaded} fallback=${failed}`);
}

run().catch(error => {
  console.error('Failed to cache Unsplash images:', error);
  process.exit(1);
});
