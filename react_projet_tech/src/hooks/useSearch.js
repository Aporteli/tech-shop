import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useSearch = navigate => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    // 1. თუ ტექსტი 2 ასოზე ნაკლებია, გაასუფთავე შედეგები
    if (searchQuery.trim().length < 2) {
      setSearchResults({ products: [], categories: [] });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    // 2. ჩართე ტაიმერი (300ms ოპტიმალურია)
    const timer = setTimeout(async () => {
      // Loading ჩართე მხოლოდ მაშინ, როცა ტაიმერი გავა და რეალურად იწყება fetch

      try {
        const lang = i18n.language.split('-')[0];
        const response = await fetch(
          `http://localhost:5001/api/search?q=${encodeURIComponent(searchQuery)}&lang=${lang}`
        );
        const data = await response.json();
   
        console.log(data, "ჰიდერის ძიებიდან მოსული მონაცემები")        
        
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    // 3. Cleanup: ყოველ ახალ ასოზე უქმნის წინა ტაიმერს
    return () => clearTimeout(timer);
  }, [searchQuery, i18n.language]);

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ products: [], categories: [] });
  };

  return {
    searchQuery,
    searchResults,
    searchLoading,
    handleSearch,
    clearSearch,
    t
  };
};
