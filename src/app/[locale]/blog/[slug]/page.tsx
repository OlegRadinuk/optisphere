import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale as 'ru' | 'en');
  if (!post) return {};
  return {
    title: `${post.title} | Optisphere`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const isRu = locale === 'ru';
  const post = getPostBySlug(slug, locale as 'ru' | 'en');
  if (!post) notFound();

  return (
    <main style={{ paddingTop: '80px', background: 'var(--op-bg)', minHeight: '100vh' }}>
      <article style={{ padding: '60px 48px 120px', maxWidth: '740px', margin: '0 auto' }}>
        {/* Back */}
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--op-muted)', textDecoration: 'none', marginBottom: '40px' }}>
          ← {isRu ? 'Все статьи' : 'All articles'}
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--op-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,59,48,0.1)', padding: '3px 10px', borderRadius: '12px' }}>
            {post.category}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--op-muted)' }}>{post.date}</span>
          <span style={{ fontSize: '13px', color: 'var(--op-muted)' }}>{post.readTime}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--op-text)', lineHeight: 1.2, marginBottom: '24px' }}>
          {post.title}
        </h1>

        {/* Content */}
        <div
          style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--op-muted)' }}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* CTA */}
        <div style={{ marginTop: '64px', padding: '40px', background: 'var(--op-surface)', border: '1px solid var(--op-border)', borderRadius: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--op-text)', marginBottom: '12px' }}>
            {isRu ? 'Хотите то же самое для своего бизнеса?' : 'Want the same for your business?'}
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--op-muted)', marginBottom: '24px' }}>
            {isRu ? 'Расскажите о задаче — предложим решение и стоимость.' : 'Tell us about your task — we\'ll suggest a solution and price.'}
          </p>
          <Link href="/contact" style={{ display: 'inline-block', background: 'var(--op-accent)', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '14px 32px', borderRadius: '12px', textDecoration: 'none' }}>
            {isRu ? 'Обсудить проект' : 'Discuss Project'}
          </Link>
        </div>
      </article>
    </main>
  );
}
