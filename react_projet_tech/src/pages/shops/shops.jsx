import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './shops.module.css';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

export default function Shops() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState('all');

  const shopLocations = [
    {
      id: 1,
      name: 'City Mall Saburtalo',
      address: '12 Rustaveli Ave',
      city: 'Tbilisi',
      phone: '*3838',
      workingHours: '10:00 - 22:00'
    },
    {
      id: 2,
      name: 'Saburtalo Branch',
      address: '45 Pekini Ave',
      city: 'Tbilisi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 21:00'
    },
    {
      id: 3,
      name: 'Tbilisi Central',
      address: '18 Kote Marjanishvili St',
      city: 'Tbilisi',
      phone: '*3838',
      workingHours: '09:00 - 22:00'
    },
    {
      id: 4,
      name: 'Tbilisi Mall',
      address: '8 Vajha-Pshavela Ave',
      city: 'Tbilisi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 22:00'
    },
    {
      id: 5,
      name: 'East Point',
      address: '27 Agmashenebeli Ave',
      city: 'Tbilisi',
      phone: '*3838',
      workingHours: '10:00 - 23:00'
    },
    {
      id: 6,
      name: 'City Mall Gldani',
      address: '15 Memed Abashidze St, Batumi',
      city: 'Batumi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 21:00'
    },
    {
      id: 7,
      name: 'Samgori Mall',
      address: '88 Gorgiladze St, Batumi',
      city: 'Batumi',
      phone: '*3838',
      workingHours: '10:00 - 22:00'
    },
    {
      id: 8,
      name: 'Hualing Plaza',
      address: '3 Rustaveli Ave, Batumi',
      city: 'Batumi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 21:00'
    },
    {
      id: 9,
      name: 'Rustavi Branch',
      address: '22 Tamar Mepe St, Kutaisi',
      city: 'Rustavi',
      phone: '*3838',
      workingHours: '10:00 - 20:00'
    },
    {
      id: 10,
      name: 'Telavi Branch',
      address: '5 Paliashvili St, Kutaisi',
      city: 'Rustavi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 19:00'
    },
    {
      id: 11,
      name: 'Gori Branch',
      address: '14 Lermontov St, Kutaisi',
      city: 'Rustavi',
      phone: '*3838',
      workingHours: '10:00 - 20:00'
    },
    {
      id: 12,
      name: 'Kutaisi Branch 4',
      address: '4 Tsereteli Str',
      city: 'Rustavi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 21:00'
    },
    {
      id: 13,
      name: 'Kutaisi Branch 2',
      address: '2 Zhiuli Shartava Str',
      city: 'Rustavi',
      phone: '*3838',
      workingHours: '10:00 - 20:00'
    },
    {
      id: 14,
      name: 'Zugdidi Branch',
      address: '7 Zviad Gamsakhurdia Ave, Zugdidi',
      city: 'Zugdidi',
      phone: '(032) 222-22-22',
      workingHours: '10:00 - 19:00'
    },
    {
      id: 15,
      name: 'Batumi Branch',
      address: 'Chavchavadze Str.',
      city: 'Poti',
      phone: '*3838',
      workingHours: '10:00 - 22:00'
    }
  ];

  const cities = [...new Set(shopLocations.map(shop => shop.city))];
  const filteredShops =
    selectedCity === 'all'
      ? shopLocations
      : shopLocations.filter(shop => shop.city === selectedCity);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('shops.title') || 'Our Shops'}</h1>
        <p className={styles.subtitle}>
          {t('shops.subtitle') || 'Find your nearest store location'}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.cityFilter}>
          <button
            type="button"
            className={`${styles.cityButton} ${selectedCity === 'all' ? styles.cityButtonActive : ''}`}
            onClick={() => setSelectedCity('all')}>
            {t('shops.allCities') || 'All Cities'}
          </button>
          {cities.map(city => (
            <button
              key={city}
              type="button"
              className={`${styles.cityButton} ${selectedCity === city ? styles.cityButtonActive : ''}`}
              onClick={() => setSelectedCity(city)}>
              {city}
            </button>
          ))}
        </div>

        <div className={styles.shopsGrid}>
          {filteredShops.map(shop => (
            <div key={shop.id} className={styles.shopCard}>
              <div className={styles.shopHeader}>
                <div className={styles.shopIcon}>
                  <MapPin size={24} />
                </div>
                <div className={styles.shopInfo}>
                  <h3 className={styles.shopName}>{shop.name}</h3>
                  <p className={styles.shopCity}>{shop.city}</p>
                </div>
              </div>

              <div className={styles.shopDetails}>
                <div className={styles.detailRow}>
                  <MapPin size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>{shop.address}</span>
                </div>
                <div className={styles.detailRow}>
                  <Phone size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>{shop.phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <Clock size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>{shop.workingHours}</span>
                </div>
              </div>

              <button className={styles.directionsButton}>
                <Navigation size={18} />
                {t('shops.getDirections') || 'Get Directions'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
