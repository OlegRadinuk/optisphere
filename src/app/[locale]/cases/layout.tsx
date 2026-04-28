import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Кейсы — реализованные проекты Optisphere',
  description:
    'Реальные результаты: сайты с AI для гостиниц и клиник, настройка Яндекс.Директ, AI-ассистенты для бизнеса. Крым и вся Россия.',
};

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
