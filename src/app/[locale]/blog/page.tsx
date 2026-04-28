import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getAllPosts } from '@/lib/blog';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';
  return {
    title: isRu
      ? 'Блог об AI и маркетинге для малого бизнеса | Optisphere'
      : 'Blog on AI & Marketing for Small Business | Optisphere',
    description: isRu
      ? 'Практические статьи об AI-ассистентах, SEO-продвижении и рекламе для бизнеса в Крыму и России. Реальные кейсы с цифрами.'
      : 'Practical articles on AI assistants, SEO promotion, and advertising for business in Crimea and Russia.',
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';
  const posts = getAllPosts(locale as 'ru' | 'en');

  return (
    <main style={{ paddingTop: '80px', background: 'var(--op-bg)', minHeight: '100vh' }}>
      <section style={{ padding: '80px 48px 120px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '20px', marginBottom: '24px' }}>
          <span style={{ color: 'var(--op-accent)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {isRu ? 'Блог' : 'Blog'}
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: 'var(--op-text)', lineHeight: 1.15, marginBottom: '16px' }}>
          {isRu ? 'AI, SEO и маркетинг для малого бизнеса' : 'AI, SEO & Marketing for Small Business'}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--op-muted)', marginBottom: '64px', lineHeight: 1.6 }}>
          {isRu
            ? 'Практические статьи с реальными цифрами. Без воды.'
            : 'Practical articles with real numbers. No fluff.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {posts.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', padding: '36px 0', borderTop: i === 0 ? '1px solid var(--op-border)' : 'none', borderBottom: '1px solid var(--op-border)' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--op-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,59,48,0.1)', padding: '3px 10px', borderRadius: '12px' }}>
                  {post.category}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--op-muted)' }}>{post.date}</span>
                <span style={{ fontSize: '13px', color: 'var(--op-muted)' }}>{post.readTime}</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '10px', lineHeight: 1.3, transition: 'color 0.2s' }}>
                {post.title}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--op-muted)', lineHeight: 1.6, margin: 0 }}>
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
