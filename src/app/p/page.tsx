import type { Metadata } from 'next';
import { Suspense } from 'react';
import WarmupClient from './WarmupClient';

// Приватная страница-прогрев под конкретного ЛПР — НЕ индексируем.
export const metadata: Metadata = {
  title: 'Персональное предложение — Optisphere',
  robots: { index: false, follow: false },
};

export default function WarmupPage() {
  return (
    <Suspense fallback={null}>
      <WarmupClient />
    </Suspense>
  );
}
