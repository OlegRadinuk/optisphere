import type { Metadata } from 'next';
import ContactPageClient from '@/components/sections/ContactPageClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return {
    title: isRu ? 'Контакт — Optisphere' : 'Contact — Optisphere',
    description: isRu
      ? 'Обсудим ваш проект. Отвечаю в течение часа в Telegram или по телефону.'
      : 'Let\'s discuss your project. I reply within an hour via Telegram or phone.',
  };
}

export default function ContactPage() {
  return <ContactPageClient />;
}
