import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { API_URL as BASE_URL } from '../api/apiBase';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const prevAuthRef = useRef(isAuthenticated);

  const [compareItems, setCompareItems] = useState(() => {
    const savedCompare = localStorage.getItem('compare');
    return savedCompare ? JSON.parse(savedCompare) : [];
  });

  const persistCompareAdd = async productId => {
    if (!isAuthenticated || !user?.id) return;
    try {
      await fetch(`${BASE_URL}/api/compare/user/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId })
      });
    } catch (error) {
      console.error('Error saving compare item:', error);
    }
  };

  const persistCompareRemove = async productId => {
    if (!isAuthenticated || !user?.id) return;
    try {
      await fetch(`${BASE_URL}/api/compare/user/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId })
      });
    } catch (error) {
      console.error('Error removing compare item:', error);
    }
  };

  const persistCompareClear = async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      await fetch(`${BASE_URL}/api/compare/user/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (error) {
      console.error('Error clearing compare list:', error);
    }
  };

  // 1. Logout-ისას State-ისა და LocalStorage-ის გასუფთავება
  useEffect(() => {
    if (prevAuthRef.current === true && isAuthenticated === false) {
      setCompareItems([]);
      localStorage.removeItem('compare');
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // 2. LocalStorage-ის მართვა (მხოლოდ მაშინ, როცა სტუმარია!)
  useEffect(() => {
    if (isAuthenticated) {
      if (compareItems.length > 0) {
        localStorage.setItem('compare', JSON.stringify(compareItems));
      } else {
        localStorage.removeItem('compare');
      }
    }
  }, [compareItems, isAuthenticated]);

  // 3. ენის შეცვლისას პროდუქტების ხელახლა წამოღება ახალი ენით
  useEffect(() => {
    const refetchProductsWithNewLanguage = async () => {
      if (compareItems.length === 0) return;

      const currentLang = i18n.language.split('-')[0];
      const productIds = compareItems.map(item => item.id || item.product_id).filter(Boolean);

      if (productIds.length === 0) return;

      try {
        const response = await fetch(
          `${BASE_URL}/api/compare/products?ids=${productIds.join(',')}&lang=${currentLang}`
        );

        if (response.ok) {
          const data = await response.json();
          setCompareItems(data);
        }
      } catch (error) {
        console.error('Error refetching products with new language:', error);
      }
    };

    refetchProductsWithNewLanguage();
  }, [i18n.language]);

  // ბექენდიდან კონკრეტული პროდუქტის წამოღების დამხმარე ფუნქცია
  const fetchProductDetails = async productId => {
    const currentLang = i18n.language.split('-')[0];
    try {
      const response = await fetch(
        `${BASE_URL}/api/compare/products?ids=${productId}&lang=${currentLang}`
      );
      if (response.ok) {
        const data = await response.json();
        return data[0];
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
    return null;
  };

  // შედარებაში დამატება
  const addToCompare = async product => {
    const productId = product.id || product.product_id;

    // 1. თუ უკვე არის სიაში, არ დაამატოს
    if (isInCompare(productId)) return;

    // 2. 4 პროდუქტის ლიმიტის შემოწმება
    if (compareItems.length >= 4) {
      toast.error('შედარებაში მაქსიმუმ 4 პროდუქტის დამატებაა შესაძლებელი!');
      return;
    }

    // 3. კატეგორიის შემოწმება (fetch-მდე)
    if (compareItems.length > 0) {
      const firstItemCategory = compareItems[0].category_id;
      const newProductCategory = product.category_id;

      if (
        firstItemCategory &&
        newProductCategory &&
        String(firstItemCategory) !== String(newProductCategory)
      ) {
        toast.error('შედარებაში შეგიძლიათ დაამატოთ მხოლოდ ერთი და იმავე კატეგორიის პროდუქტები!');
        return;
      }
    }

    // 4. წამოიღოს განახლებული პროდუქტი ბექენდიდან მიმდინარე ენით
    const fetchedProduct = await fetchProductDetails(productId);
    const newProduct = fetchedProduct || product;

    const normalizedProduct = {
      ...newProduct,
      id: newProduct.id || productId
    };

    setCompareItems(prevItems => [...prevItems, normalizedProduct]);
    await persistCompareAdd(productId);
  };

  const removeFromCompare = async productId => {
    setCompareItems(prevItems =>
      prevItems.filter(item => (item.id || item.product_id) !== productId)
    );
    await persistCompareRemove(productId);
  };

  const isInCompare = productId => {
    return compareItems.some(item => (item.id || item.product_id) === productId);
  };

  const toggleCompare = async product => {
    const productId = product.id || product.product_id;

    if (isInCompare(productId)) {
      removeFromCompare(productId);
    } else {
      await addToCompare(product);
    }
  };

  const clearCompare = async () => {
    setCompareItems([]);
    localStorage.removeItem('compare');
    await persistCompareClear();
  };

  const compareCount = compareItems.length;

  const getCompareCategory = () => {
    if (compareItems.length === 0) return null;
    return compareItems[0].category_id;
  };

  return (
    <CompareContext.Provider
      value={{
        setCompareItems,
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        toggleCompare,
        clearCompare,
        compareCount,
        getCompareCategory
      }}>
      {children}
    </CompareContext.Provider>
  );
};
