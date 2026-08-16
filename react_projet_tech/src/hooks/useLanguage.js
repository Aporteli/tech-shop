import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [lengDropdownOpen, setLengDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");

  const toggleLanguageDropdown = () => {
    setLengDropdownOpen(!lengDropdownOpen);
  };

  const changeLanguage = (lng) => {
    setCurrentLanguage(lng);
    i18n.changeLanguage(lng);
  };

  return {
    lengDropdownOpen,
    currentLanguage,
    toggleLanguageDropdown,
    changeLanguage,
  };
};
