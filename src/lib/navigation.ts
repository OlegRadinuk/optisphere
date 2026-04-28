export interface NavItem {
  label: string;
  labelEn: string;
  href: string;
  pageHref: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Услуги',
    labelEn: 'Services',
    href: '#services-preview',
    pageHref: '/services',
    children: [
      {
        label: 'Сайты под ключ',
        labelEn: 'Websites',
        href: '/services/websites',
        pageHref: '/services/websites',
      },
      {
        label: 'AI-ассистенты',
        labelEn: 'AI Assistants',
        href: '/services/ai-assistants',
        pageHref: '/services/ai-assistants',
      },
      {
        label: 'SEO-продвижение',
        labelEn: 'SEO',
        href: '/services/seo',
        pageHref: '/services/seo',
      },
      {
        label: 'Яндекс.Директ',
        labelEn: 'Yandex Direct',
        href: '/services/yandex-direct',
        pageHref: '/services/yandex-direct',
      },
    ],
  },
  {
    label: 'Кейсы',
    labelEn: 'Cases',
    href: '#cases',
    pageHref: '/cases',
  },
  {
    label: 'Цены',
    labelEn: 'Pricing',
    href: '#pricing',
    pageHref: '/pricing',
  },
  {
    label: 'Контакт',
    labelEn: 'Contact',
    href: '/contact',
    pageHref: '/contact',
  },
];
