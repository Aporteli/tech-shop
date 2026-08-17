import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from './api/apiBase';

export default function CategoriesMenu() {
  const [groupedCategories, setGroupedCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/categories/all-subcategories`)
      .then((res) => res.json())
      .then((data) => {
        // ბრტყელი სიის დაჯგუფება მშობელი კატეგორიების მიხედვით
        const grouped = data.reduce((acc, item) => {
          const key = item.parent_slug;
          
          if (!acc[key]) {
            acc[key] = {
              name: item.parent_name,
              slug: item.parent_slug,
              subs: []
            };
          }
          
          acc[key].subs.push({
            id: item.sub_id,
            name: item.sub_name,
            slug: item.sub_slug
          });
          
          return acc;
        }, {});

        setGroupedCategories(grouped);
        setLoading(false);
      })
      .catch((err) => console.error('შეცდომა ფრონტზე:', err));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>იტვირთება...</div>;

  // ობიექტის გადაყვანა მასივში, რომ .map() გამოვიყენოთ
  const categoriesList = Object.values(groupedCategories);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>კატეგორიები</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
      }}>
        {categoriesList.map((category) => (
          <div key={category.slug} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px', backgroundColor: '#fff' }}>
            {/* მთავარი კატეგორიის ლინკი (სლაგი ჩაჯდება დინამიკურად) */}
            <Link to={`/category/${category.slug}`} style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
              {category.name} →
            </Link>

            {/* ქვეკატეგორიების სია ბარათის შიგნით */}
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {category.subs.map((sub) => (
                <li key={sub.id} style={{ margin: '6px 0' }}>
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>{sub.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}