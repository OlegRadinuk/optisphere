export type PortfolioCategory = 'sites';

export interface PortfolioItem {
  id: string;
  titleRu: string;
  titleEn: string;
  category: PortfolioCategory;
  niche: string;
  descriptionRu: string;
  descriptionEn: string;
  url: string;
  image: string;
  tags: string[];
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 'lifestyle-crimea',
    titleRu: 'Стиль Жизни',
    titleEn: 'Life Style',
    category: 'sites',
    niche: 'Ремонт и дизайн',
    descriptionRu: 'Ремонтно-строительная компания в Крыму — портфолио, калькулятор, онлайн-консультация',
    descriptionEn: 'Construction & interior design company in Crimea',
    url: 'https://lifestyle-crimea.ru',
    image: '/portfolio/portfolio-lifestyle-crimea.jpg',
    tags: ['Строительство', 'Дизайн'],
  },
  {
    id: 'lovelifestyle',
    titleRu: 'Love Lifestyle',
    titleEn: 'Love Lifestyle',
    category: 'sites',
    niche: 'Апартаменты',
    descriptionRu: 'Апартаменты в Алуште — онлайн-бронирование, галерея, виртуальный тур',
    descriptionEn: 'Apartments in Alushta with online booking and virtual tour',
    url: 'https://lovelifestyle.ru',
    image: '/portfolio/portfolio-lovelifestyle.jpg',
    tags: ['Недвижимость', 'Бронирование'],
  },
  {
    id: 'vladen-crimea',
    titleRu: 'Владен',
    titleEn: 'Vladen',
    category: 'sites',
    niche: 'Строительство',
    descriptionRu: 'Ремонт квартир и домов под ключ — 369+ объектов, калькулятор стоимости',
    descriptionEn: 'Turnkey apartment renovation in Simferopol',
    url: 'https://vladen-crimea.ru',
    image: '/portfolio/portfolio-vladen.jpg',
    tags: ['Ремонт', 'Строительство'],
  },
  {
    id: 'deniz-more',
    titleRu: 'Deniz',
    titleEn: 'Deniz',
    category: 'sites',
    niche: 'Гостиница',
    descriptionRu: 'Гостиница в Новофёдоровке — 3D тур, люкс-номера, онлайн-бронирование',
    descriptionEn: 'Hotel in Novofedorovka with 3D tour and online booking',
    url: 'https://deniz-more.ru',
    image: '/portfolio/portfolio-deniz.jpg',
    tags: ['Гостиница', 'Крым'],
  },
  {
    id: 'versal-crimea',
    titleRu: 'Версаль',
    titleEn: 'Versal',
    category: 'sites',
    niche: 'Гостиница',
    descriptionRu: 'Гостиница «Версаль» у моря — бронирование номеров, виртуальный тур',
    descriptionEn: 'Versal hotel by the sea with booking and virtual tour',
    url: 'https://versal-crimea.ru',
    image: '/portfolio/portfolio-versal.jpg',
    tags: ['Гостиница', 'Туризм'],
  },
  {
    id: 'medcentr-hakimovih',
    titleRu: 'Клиника Хакимовых',
    titleEn: 'Hakimovs Clinic',
    category: 'sites',
    niche: 'Медицина',
    descriptionRu: 'Многопрофильная клиника в Симферополе — онлайн-запись, прайс, акции',
    descriptionEn: 'Multidisciplinary clinic in Simferopol with online appointments',
    url: 'https://medcentr-hakimovih.ru',
    image: '/portfolio/portfolio-medcentr.jpg',
    tags: ['Медицина', 'Онлайн-запись'],
  },
];
