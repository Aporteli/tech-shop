const fs = require('fs');
const path = require('path');

const dumpPath = path.join(__dirname, '..', 'dump-react_projet_tech_db-202608131111.sql');
const outPath = path.join(__dirname, '..', 'additions.sql');

const dump = fs.readFileSync(dumpPath, 'utf8');

function findAutoIncrement(tableName) {
  const re = new RegExp('CREATE TABLE `' + tableName + '`[\s\S]*?AUTO_INCREMENT=(\\d+)', 'i');
  const m = dump.match(re);
  if (m) return parseInt(m[1], 10);
  // fallback: find max id in INSERT INTO statements for table
  const re2 = new RegExp('INSERT INTO `' + tableName + '` VALUES ([\\s\\S]*?);', 'gi');
  let max = 0;
  let mm;
  while ((mm = re2.exec(dump))) {
    const rows = mm[1];
    const nums = rows.match(/\((\d+),/g);
    if (nums)
      nums.forEach(s => {
        const v = parseInt(s.replace(/\(|,/g, ''), 10);
        if (v > max) max = v;
      });
  }
  return max + 1;
}

const prodStart = findAutoIncrement('products');
const catStart = findAutoIncrement('categories');
let prodId = prodStart;
let catId = catStart;
let prodTransId = 1;

const catalog = [
  {
    parentSlug: 'mobile-phones-and-accessories',
    parentId: 1,
    subs: [
      'smart-watches',
      'mobile-phone-accessories',
      'protective-case',
      'screen-protector',
      'smart-glasses',
      'adapter',
      'portable-speaker',
      'power-bank',
      'wireless-charger',
      'wall-adapter',
      'usb-cable',
      'micro-sd-card',
      'car-holder',
      'car-charger',
      'mobile-gaming-controller',
      'video-stabilizer-gimbal',
      'selfie-stick'
    ]
  },
  {
    parentSlug: 'computers-and-accessories',
    parentId: 2,
    subs: [
      'laptop',
      'laptop-accessories',
      'laptop-bag',
      'laptop-charger',
      'laptop-cooler',
      'laptop-stand',
      'laptop-stylus',
      'tablet-computer',
      'tab-accessories',
      'tab-protective-case',
      'tab-screen-protector',
      'tab-stylus',
      'tab-keyboard',
      'all-in-one-computer',
      'desktop-computer',
      'monitor',
      'monitor-accessories',
      'pc-components',
      'motherboard',
      'cpu',
      'video-card',
      'ram',
      'pc-case',
      'power-supply',
      'cooler',
      'thermal-paste',
      'storage-hdd-ssd',
      'print-copy',
      'printer',
      'scanner',
      'cartridges-toners',
      'networking-products',
      'router',
      'network-switch',
      'network-cables',
      'computer-accessories',
      'mouse',
      'mousepad',
      'keyboard',
      'pc-speaker',
      'pc-webcam',
      'pc-streaming-accessories',
      'external-hdd-ssd',
      'usb-flash-drive',
      'cables-adapters',
      'usb-hubs',
      'batteries-battery-chargers',
      'screen-cleaners',
      'ups-systems'
    ]
  },
  {
    parentSlug: 'tv-and-audio',
    parentId: 3,
    subs: [
      'tv',
      'tv-accessories',
      'wall-mount',
      'smart-tv-box',
      'tv-cables-adapters',
      'projector',
      'projector-accessories',
      'audio-systems',
      'party-speaker',
      'turntable',
      'soundbar'
    ]
  },
  {
    parentSlug: 'gaming',
    parentId: 4,
    subs: [
      'gaming-laptop',
      'gaming-consoles',
      'playstation',
      'playstation-accessories',
      'playstation-games',
      'xbox',
      'xbox-accessories',
      'xbox-games',
      'nintendo-switch',
      'handheld-gaming-consoles',
      'meta-vr-headset',
      'pc-gaming',
      'gaming-desktop-pc',
      'pc-gaming-component',
      'pc-gaming-accessories',
      'gaming-chair',
      'gaming-desk',
      'gaming-wheel',
      'gaming-mouse',
      'gaming-mouse-pad',
      'gaming-keyboard',
      'gaming-microphone',
      'gaming-controller',
      'gaming-backpack',
      'gaming-monitor'
    ]
  }
];

const brands = [
  'Samsung',
  'Apple',
  'Infinix',
  'Xiaomi',
  'Huawei',
  'Sony',
  'LG',
  'Asus',
  'Acer',
  'HP',
  'Lenovo',
  'Dell',
  'MSI',
  'Razer',
  'Corsair'
];
function ru(s) {
  return s;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

let sql = '\n-- ADDITIONS: categories, products, translations, images\n';
sql +=
  'LOCK TABLES `categories` WRITE, `category_translations` WRITE, `products` WRITE, `product_translations` WRITE, `product_images` WRITE;\n';

for (const cat of catalog) {
  for (const sub of cat.subs) {
    const slug = slugify(sub);
    sql +=
      `INSERT INTO ` +
      '`categories`' +
      ` (id,slug,parent_id,image) VALUES (${catId},'${slug}',${cat.parentId},NULL);\n`;
    sql +=
      `INSERT INTO ` +
      '`category_translations`' +
      ` (id,category_id,lang,name) VALUES (${catId * 2 + 1},${catId},'en','${sub.replace(/-/g, ' ')}'),(${catId * 2 + 2},${catId},'ru','${ru(sub.replace(/-/g, ' '))}');\n`;
    catId++;
  }
}

for (const cat of catalog) {
  for (const sub of cat.subs) {
    const subSlug = slugify(sub);
    for (let i = 1; i <= 50; i++) {
      const name = `${brands[i % brands.length]} ${sub.replace(/-/g, ' ')} Model ${1000 + i}`;
      const slug = `${subSlug}-${i}`;
      const price = (Math.round((50 + Math.random() * 2000) * 100) / 100).toFixed(2);
      const discount = Math.random() > 0.7 ? (Math.round(price * 0.85 * 100) / 100).toFixed(2) : 'NULL';
      const img = `products/${subSlug}-${(i % 10) + 1}.webp`;
      sql +=
        `INSERT INTO ` +
        '`products`' +
        ` (id,name,category_id,slug,brand_id,specifications,description,short_description,price,discount_price,image,images_gallery,is_active,views,created_at,updated_at,stock) VALUES (${prodId},'${name.replace(/'/g, "\\'")}',(SELECT id FROM categories WHERE slug='${subSlug}'),'${slug}',NULL,NULL,'${name.replace(/'/g, "\\'")}','${sub.replace(/-/g, ' ')}',${price},${discount === 'NULL' ? 'NULL' : discount},'${img}',NULL,1,0,CURRENT_TIMESTAMP(),CURRENT_TIMESTAMP(),100);\n`;
      sql +=
        `INSERT INTO ` +
        '`product_translations`' +
        ` (id,product_id,locale,name,description,short_description) VALUES (${prodTransId},${prodId},'en','${name.replace(/'/g, "\\'")}','${name.replace(/'/g, "\\'")}', '${sub.replace(/-/g, ' ')}');\n`;
      sql +=
        `INSERT INTO ` +
        '`product_translations`' +
        ` (id,product_id,locale,name,description,short_description) VALUES (${prodTransId + 1},${prodId},'ru','${ru(name.replace(/'/g, "\\'"))}','${ru(name.replace(/'/g, "\\'"))}','${ru(sub.replace(/-/g, ' '))}');\n`;
      prodTransId += 2;
      sql +=
        `INSERT INTO ` +
        '`product_images`' +
        ` (product_id,image_url,is_main,sort_order) VALUES (${prodId},'${img}',1,0);\n`;
      prodId++;
    }
  }
}

sql += 'UNLOCK TABLES;\n';

fs.writeFileSync(outPath, sql);
console.log('Generated additions SQL at', outPath);
