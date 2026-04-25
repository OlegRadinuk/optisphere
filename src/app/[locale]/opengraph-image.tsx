import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Optisphere — AI Web Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#060606',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(232,32,32,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(232,32,32,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Red accent line top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3, background: '#e82020', display: 'flex',
        }} />

        {/* Corner accent */}
        <div style={{
          position: 'absolute', top: 3, right: 0,
          width: 200, height: 1, background: 'rgba(232,32,32,0.3)', display: 'flex',
        }} />

        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid #e82020',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}>
            <div style={{
              width: 12, height: 12, background: '#e82020',
              borderRadius: '50%', display: 'flex',
            }} />
          </div>
          <span style={{
            fontSize: 36, fontWeight: 700, color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>
            Optisphere
          </span>
          <span style={{
            marginLeft: 16,
            fontSize: 11, color: 'rgba(232,32,32,0.8)',
            letterSpacing: '0.2em', fontFamily: 'monospace',
          }}>
            OPTI · READY
          </span>
        </div>

        {/* Main headline */}
        <div style={{
          fontSize: 64, fontWeight: 800, color: '#ffffff',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          marginBottom: 24,
          display: 'flex', flexDirection: 'column',
        }}>
          <span>{isRu ? 'AI-нативная' : 'AI-Native'}</span>
          <span style={{ color: '#e82020' }}>{isRu ? 'веб-студия' : 'Web Studio'}</span>
        </div>

        {/* Subheading */}
        <div style={{
          fontSize: 22, color: '#888888',
          lineHeight: 1.5, maxWidth: 640,
          display: 'flex',
        }}>
          {isRu
            ? 'Сайт + AI-ассистент, который продаёт 24/7'
            : 'Website + AI assistant that sells 24/7'}
        </div>

        {/* Bottom row */}
        <div style={{
          position: 'absolute', bottom: 48, left: 80, right: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 14, color: '#555555',
            fontFamily: 'monospace', letterSpacing: '0.1em',
          }}>
            optisphere.tech
          </span>
          <span style={{
            fontSize: 14, color: '#555555',
            fontFamily: 'monospace', letterSpacing: '0.1em',
          }}>
            {isRu ? 'ОТ 30 000 ₽' : 'FROM 30 000 ₽'}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
