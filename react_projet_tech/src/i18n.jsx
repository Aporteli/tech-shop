// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// შემოგვაქვს ჩვენი თარგმანის ფაილები
import translationEN from "./locales/en/translation.json";
import translationRU from "./locales/ru/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  ru: {
    translation: translationRU,
  },
};

i18n
  .use(LanguageDetector) // ავტომატურად ადგენს მომხმარებლის ენას
  .use(initReactI18next) // აკავშირებს react-i18next-თან
  .init({
    resources,
    fallbackLng: "en", // თუ ბრაუზერის ენა ვერ დადგინდა, ჩაირთვება ინგლისური
    load: "languageOnly", // 👈 ეს დაიცავს აპლიკაციას! "en-GB" ან "en-US" ყოველთვის გადაკეთდება "en"-ად
    debug: false, // დეველოპმენტში შეგიძლია true ჩაწერო ლოგების სანახავად
    interpolation: {
      escapeValue: false, // React თავად იცავს XSS-სგან, ამიტომ აქ false გვინდა
    },
  });

export default i18n;
