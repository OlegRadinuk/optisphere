'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionIntro from '@/components/hud/SectionIntro';

// TODO: раскомментить когда будут реальные кейсы
// type CaseType = 'medical' | 'hotel' | 'construction' | 'restaurant' | 'auto';
// type FilterKey = 'all' | CaseType;
//
// interface CaseItem {
//   id: number;
//   name: string;
//   type: CaseType;
//   label: string;
//   price: string;
//   tags: string[];
//   url: string;
// }
//
// const CASES: CaseItem[] = [
//   { id: 1, name: 'Hotel Nova',    type: 'hotel',        label: 'Гостиница',     price: '120 000 ₽', tags: ['Booking', 'AI-бот', '360°'],  url: '#' },
//   { id: 2, name: 'MedPro Clinic', type: 'medical',      label: 'Медицина',      price: '180 000 ₽', tags: ['Запись', 'AI-бот', 'SEO'],     url: '#' },
//   { id: 3, name: 'СтройПро',      type: 'construction', label: 'Строительство', price: '90 000 ₽',  tags: ['Лендинг', 'SEO'],              url: '#' },
//   { id: 4, name: 'Le Grand',      type: 'restaurant',   label: 'Ресторан',      price: '360° тур',  tags: ['Panorama', 'Virtual tour'],    url: '#' },
//   { id: 5, name: 'AutoMax',       type: 'auto',         label: 'Авто',          price: '85 000 ₽',  tags: ['Директ', 'SEO'],               url: '#' },
//   { id: 6, name: 'ЖК Горизонт',   type: 'construction', label: 'Недвижимость',  price: '360° тур',  tags: ['Panorama', '3D'],              url: '#' },
// ];
//
// const PREVIEW_GRADIENTS: Record<CaseType, string> = {
//   medical:      'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d2040 100%)',
//   hotel:        'linear-gradient(135deg, #1a1200 0%, #3d2b00 50%, #1a1200 100%)',
//   construction: 'linear-gradient(135deg, #0d1a0d 0%, #1a3320 50%, #0d1a0d 100%)',
//   restaurant:   'linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #1a0a0a 100%)',
//   auto:         'linear-gradient(135deg, #0a0a1a 0%, #15153d 50%, #0a0a1a 100%)',
// };
//
// const FILTER_KEYS: FilterKey[] = ['all', 'medical', 'hotel', 'construction', 'restaurant', 'auto'];
//
// interface CaseCardProps {
//   item: CaseItem;
//   index: number;
//   viewLabel: string;
// }
//
// function CaseCard({ item, index, viewLabel }: CaseCardProps) { ... }

// ─── Section ──────────────────────────────────────────────────────────────────

export default function CasesSection() {
  const t = useTranslations('cases');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="cases" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }}>

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionIntro code="04" cmd="cases.query({hot:true})" title={t('title')} sub={t('sub')} crimson />
        </motion.div>

        {/* Coming soon placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            padding: '64px 0',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{
              font: "500 11px/1 'JetBrains Mono',monospace",
              color: 'var(--op-text-faint)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
            }}>
              ◆ Скоро
            </span>
            <p style={{
              font: "400 16px/1.6 'Inter',sans-serif",
              color: 'var(--op-text-muted)',
              margin: 0,
              maxWidth: 400,
            }}>
              Реальные кейсы студии появятся здесь — сейчас идёт работа с первыми клиентами
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
