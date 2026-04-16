export type PortfolioCategory = "sites" | "pano" | "promo";

export interface PortfolioItem {
  id: string;
  titleRu: string;
  titleEn: string;
  category: PortfolioCategory;
  descriptionRu: string;
  descriptionEn: string;
  priceRu: string;
  priceEn: string;
  url?: string;
  tags: string[];
  /** Gradient for placeholder card */
  gradient: string;
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: "hotel-nova",
    titleRu: "Отель Nova",
    titleEn: "Hotel Nova",
    category: "sites",
    descriptionRu: "Продающий сайт для бутик-отеля с онлайн бронированием и виртуальным туром",
    descriptionEn: "Sales website for boutique hotel with online booking and virtual tour",
    priceRu: "от 120 000 ₽",
    priceEn: "from 120 000 ₽",
    tags: ["Next.js", "Three.js", "Booking"],
    gradient: "linear-gradient(135deg, rgba(79,142,255,0.15) 0%, rgba(79,142,255,0.05) 100%)",
  },
  {
    id: "clinic-med",
    titleRu: "Клиника MedPro",
    titleEn: "MedPro Clinic",
    category: "sites",
    descriptionRu: "Корпоративный сайт медицинской клиники с онлайн-записью к врачам",
    descriptionEn: "Corporate website for medical clinic with online appointment booking",
    priceRu: "от 90 000 ₽",
    priceEn: "from 90 000 ₽",
    tags: ["Next.js", "CMS", "SEO"],
    gradient: "linear-gradient(135deg, rgba(79,142,255,0.12) 0%, rgba(62,207,160,0.08) 100%)",
  },
  {
    id: "build-pro",
    titleRu: "СтройПро",
    titleEn: "BuildPro",
    category: "sites",
    descriptionRu: "Сайт строительной компании с портфолио объектов и калькулятором",
    descriptionEn: "Construction company website with project portfolio and cost calculator",
    priceRu: "от 80 000 ₽",
    priceEn: "from 80 000 ₽",
    tags: ["Next.js", "Calculator", "Gallery"],
    gradient: "linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(79,142,255,0.08) 100%)",
  },
  {
    id: "restaurant-pano",
    titleRu: "Ресторан Le Grand",
    titleEn: "Le Grand Restaurant",
    category: "pano",
    descriptionRu: "Виртуальный тур по ресторану — 8 локаций, встроен в Google Maps",
    descriptionEn: "Virtual restaurant tour — 8 locations, embedded in Google Maps",
    priceRu: "от 45 000 ₽",
    priceEn: "from 45 000 ₽",
    tags: ["360°", "WebGL", "Google Maps"],
    gradient: "linear-gradient(135deg, rgba(201,169,110,0.15) 0%, rgba(201,169,110,0.05) 100%)",
  },
  {
    id: "apartment-pano",
    titleRu: "ЖК Горизонт",
    titleEn: "Gorizont Residences",
    category: "pano",
    descriptionRu: "Интерактивный тур по квартирам ЖК — 24 панорамы, VR-режим",
    descriptionEn: "Interactive apartment tour — 24 panoramas, VR mode",
    priceRu: "от 80 000 ₽",
    priceEn: "from 80 000 ₽",
    tags: ["360°", "VR", "Real estate"],
    gradient: "linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(62,207,160,0.08) 100%)",
  },
  {
    id: "seo-auto",
    titleRu: "Автосалон AutoMax",
    titleEn: "AutoMax Dealership",
    category: "promo",
    descriptionRu: "SEO + Яндекс.Директ. За 3 месяца +220% органического трафика",
    descriptionEn: "SEO + Yandex.Direct. +220% organic traffic in 3 months",
    priceRu: "от 15 000 ₽/мес",
    priceEn: "from 15 000 ₽/mo",
    tags: ["SEO", "Яндекс.Директ", "+220% трафик"],
    gradient: "linear-gradient(135deg, rgba(62,207,160,0.15) 0%, rgba(62,207,160,0.05) 100%)",
  },
];
