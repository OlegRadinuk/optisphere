import type { Metadata } from 'next';
import { OptiCtaButton } from '@/components/ui/OptiCtaButton';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return {
    title: isRu
      ? 'AI-ассистент для сайта — умный чат-бот для вашего бизнеса'
      : 'AI Assistant for Your Website — Smart Chatbot for Business',
    description: isRu
      ? 'Встраиваем AI-чат-бота в ваш сайт: отвечает 24/7, принимает заявки, увеличивает конверсию. На базе Claude AI. Для гостиниц, клиник, магазинов. Крым и вся Россия.'
      : 'We embed an AI chatbot in your site: answers 24/7, captures leads, increases conversion. Powered by Claude AI. For hotels, clinics, stores. Crimea and all Russia.',
  };
}

const STEPS = [
  {
    numRu: '01',
    numEn: '01',
    titleRu: 'Подключение',
    titleEn: 'Connection',
    descRu: 'Встраиваем виджет на ваш сайт. Один скрипт — работает везде.',
    descEn: 'We embed the widget on your site. One script — works everywhere.',
  },
  {
    numRu: '02',
    numEn: '02',
    titleRu: 'Обучение',
    titleEn: 'Training',
    descRu:
      'Загружаем данные вашего бизнеса: прайс, услуги, FAQ, условия работы.',
    descEn:
      'We load your business data: price list, services, FAQ, working conditions.',
  },
  {
    numRu: '03',
    numEn: '03',
    titleRu: 'Тест',
    titleEn: 'Testing',
    descRu:
      'Тестируем 20+ сценариев диалога. Проверяем граничные случаи и эскалацию.',
    descEn:
      'We test 20+ dialogue scenarios. Edge cases and escalation are verified.',
  },
  {
    numRu: '04',
    numEn: '04',
    titleRu: 'Запуск',
    titleEn: 'Launch',
    descRu: 'Ассистент запущен — вы получаете заявки в Telegram или CRM.',
    descEn: 'Assistant is live — you receive leads via Telegram or CRM.',
  },
];

const USE_CASES = [
  {
    titleRu: 'Гостиница / апартаменты',
    titleEn: 'Hotel / apartments',
    descRu:
      'Бот принимает запросы на бронирование, называет цены и свободные даты, передаёт подтверждённые заявки менеджеру.',
    descEn:
      'The bot handles booking requests, quotes prices and available dates, forwards confirmed requests to the manager.',
    metricsRu: '+40% онлайн-броней',
    metricsEn: '+40% online bookings',
  },
  {
    titleRu: 'Клиника / стоматология',
    titleEn: 'Clinic / dental',
    descRu:
      'Записывает пациентов на приём, отвечает на вопросы о процедурах и ценах, напоминает о визите за день.',
    descEn:
      'Books patient appointments, answers questions about procedures and prices, sends reminders one day before.',
    metricsRu: '–60% нагрузки на регистратуру',
    metricsEn: '-60% reception workload',
  },
  {
    titleRu: 'Интернет-магазин',
    titleEn: 'Online store',
    descRu:
      'Помогает выбрать товар по параметрам, отвечает на вопросы о наличии и доставке, помогает оформить заказ.',
    descEn:
      'Helps choose products by parameters, answers availability and delivery questions, assists with checkout.',
    metricsRu: '+25% конверсия в заказ',
    metricsEn: '+25% order conversion',
  },
];

const FAQ = [
  {
    qRu: 'Как ассистент узнаёт о моём бизнесе?',
    aRu:
      'Вы передаёте нам документы: прайс, описание услуг, FAQ, регламенты. Мы загружаем их в базу знаний ассистента. Он работает только в рамках этой базы.',
    qEn: 'How does the assistant learn about my business?',
    aEn:
      'You provide documents: price list, service descriptions, FAQ, policies. We load them into the assistant\'s knowledge base. It works only within that base.',
  },
  {
    qRu: 'Что если ассистент ответит неправильно?',
    aRu:
      'Ассистент обучен только на ваших данных и работает в жёстких сценариях. На неизвестные вопросы — эскалация на человека. Мы тестируем 20+ граничных случаев перед запуском.',
    qEn: 'What if the assistant answers incorrectly?',
    aEn:
      'The assistant is trained only on your data and works within strict scenarios. Unknown questions escalate to a human. We test 20+ edge cases before launch.',
  },
  {
    qRu: 'Куда приходят заявки?',
    aRu:
      'В Telegram к вам или в CRM (AmoCRM, Bitrix24 — по договорённости). Заявка содержит имя, контакт, запрос.',
    qEn: 'Where do leads arrive?',
    aEn:
      'To your Telegram or CRM (AmoCRM, Bitrix24 — by arrangement). The lead contains name, contact, request.',
  },
  {
    qRu: 'Можно ли добавить ассистента на уже готовый сайт?',
    aRu:
      'Да. Один строкой кода встраивается на любой сайт: WordPress, Tilda, Bitrix, Next.js, чистый HTML.',
    qEn: 'Can I add the assistant to an existing site?',
    aEn:
      'Yes. One line of code embeds it on any site: WordPress, Tilda, Bitrix, Next.js, plain HTML.',
  },
];

export default async function AiAssistantsPage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';

  return (
    <article style={{ padding: '48px 0 0' }}>
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}
        className="ai-container"
      >
        {/* Hero */}
        <header style={{ marginBottom: 96 }}>
          <p
            style={{
              font: "500 11px/1 'JetBrains Mono',monospace",
              color: 'var(--op-accent)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            {isRu ? '// AI-АССИСТЕНТЫ' : '// AI ASSISTANTS'}
          </p>
          <h1
            style={{
              font: "700 56px/1.1 'Oxanium',sans-serif",
              letterSpacing: '-0.03em',
              margin: '0 0 24px',
              color: 'var(--op-text)',
            }}
            className="ai-hero-title"
          >
            {isRu
              ? 'AI-ассистент для вашего бизнеса'
              : 'AI assistant for your business'}
          </h1>
          <p
            style={{
              font: "400 20px/1.5 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: '0 0 12px',
              maxWidth: 640,
            }}
          >
            {isRu
              ? 'Отвечает на вопросы 24/7, принимает заявки и передаёт их вам — пока вы занимаетесь бизнесом.'
              : 'Answers questions 24/7, captures leads and forwards them to you — while you focus on business.'}
          </p>
          <p
            style={{
              font: "500 14px/1 'JetBrains Mono',monospace",
              color: 'var(--op-accent)',
              margin: '0 0 32px',
              letterSpacing: '0.08em',
            }}
          >
            {isRu ? 'от 50 000 ₽ · интеграция за 3 дня' : 'from ₽50,000 · 3-day integration'}
          </p>
          <OptiCtaButton
            label={isRu ? 'Обсудить проект →' : 'Discuss project →'}
            variant="primary"
            height={48}
            padding="0 32px"
          />
        </header>

        {/* How it works */}
        <section style={{ marginBottom: 96 }}>
          <h2
            style={{
              font: "600 36px/1.15 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
              color: 'var(--op-text)',
            }}
          >
            {isRu ? 'Как это работает' : 'How it works'}
          </h2>
          <p
            style={{
              font: "400 16px/1.5 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: '0 0 48px',
            }}
          >
            {isRu ? '4 шага от брифа до первых заявок.' : '4 steps from brief to first leads.'}
          </p>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}
            className="steps-grid"
          >
            {STEPS.map((step) => (
              <div
                key={step.numRu}
                style={{
                  border: '1px solid var(--op-border)',
                  borderRadius: 12,
                  padding: '28px 24px',
                  background: 'var(--op-surface-elevated)',
                  position: 'relative',
                }}
              >
                <p
                  style={{
                    font: "700 48px/1 'Oxanium',sans-serif",
                    color: 'var(--op-border-strong)',
                    margin: '0 0 16px',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {isRu ? step.numRu : step.numEn}
                </p>
                <h3
                  style={{
                    font: "600 18px/1.3 'Oxanium',sans-serif",
                    margin: '0 0 8px',
                    color: 'var(--op-text)',
                  }}
                >
                  {isRu ? step.titleRu : step.titleEn}
                </h3>
                <p
                  style={{
                    font: "400 14px/1.55 'Inter',sans-serif",
                    color: 'var(--op-text-secondary)',
                    margin: 0,
                  }}
                >
                  {isRu ? step.descRu : step.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section style={{ marginBottom: 96 }}>
          <h2
            style={{
              font: "600 36px/1.15 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
              color: 'var(--op-text)',
            }}
          >
            {isRu ? 'Кейсы применения' : 'Use cases'}
          </h2>
          <p
            style={{
              font: "400 16px/1.5 'Inter',sans-serif",
              color: 'var(--op-text-secondary)',
              margin: '0 0 48px',
            }}
          >
            {isRu
              ? 'Ассистент адаптируется под любую нишу.'
              : 'The assistant adapts to any niche.'}
          </p>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
            className="cases-grid"
          >
            {USE_CASES.map((c) => (
              <div
                key={c.titleRu}
                style={{
                  border: '1px solid var(--op-border)',
                  borderRadius: 16,
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  background: 'var(--op-surface-elevated)',
                }}
              >
                <h3
                  style={{
                    font: "600 20px/1.2 'Oxanium',sans-serif",
                    margin: 0,
                    color: 'var(--op-text)',
                  }}
                >
                  {isRu ? c.titleRu : c.titleEn}
                </h3>
                <p
                  style={{
                    font: "400 14px/1.6 'Inter',sans-serif",
                    color: 'var(--op-text-secondary)',
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {isRu ? c.descRu : c.descEn}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    background: 'var(--op-accent-subtle)',
                    border: '1px solid var(--op-border-accent)',
                    borderRadius: 4,
                    width: 'fit-content',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--op-accent)',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      font: "500 12px/1 'JetBrains Mono',monospace",
                      color: 'var(--op-accent)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {isRu ? c.metricsRu : c.metricsEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 80 }}>
          <h2
            style={{
              font: "600 36px/1.15 'Oxanium',sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 40px',
              color: 'var(--op-text)',
            }}
          >
            {isRu ? 'Частые вопросы' : 'FAQ'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQ.map((item) => (
              <div
                key={item.qRu}
                style={{
                  border: '1px solid var(--op-border)',
                  borderRadius: 8,
                  padding: '24px 28px',
                  background: 'var(--op-surface-elevated)',
                }}
              >
                <p
                  style={{
                    font: "600 16px/1.4 'Oxanium',sans-serif",
                    margin: '0 0 8px',
                    color: 'var(--op-text)',
                  }}
                >
                  {isRu ? item.qRu : item.qEn}
                </p>
                <p
                  style={{
                    font: "400 14px/1.6 'Inter',sans-serif",
                    color: 'var(--op-text-secondary)',
                    margin: 0,
                  }}
                >
                  {isRu ? item.aRu : item.aEn}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ai-container { padding: 0 24px !important; }
          .ai-hero-title { font-size: 38px !important; }
          .steps-grid { grid-template-columns: repeat(2,1fr) !important; }
          .cases-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </article>
  );
}
