import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Цены на разработку сайтов и AI-ассистентов — Optisphere',
  description:
    'Прозрачные цены на создание сайтов, AI-ботов и SEO-продвижение. Лендинг от 50 000 ₽, AI-ассистент от 50 000 ₽. Подписка "Орбита" от 10 000 ₽/мес.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
