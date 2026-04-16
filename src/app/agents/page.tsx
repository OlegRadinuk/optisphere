/**
 * Agent Dashboard — DEV ONLY
 * Читает agents/state.json и рендерит статус команды агентов.
 * Доступно по адресу: /agents
 * В production — редиректит на главную.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { redirect } from 'next/navigation';

interface AgentState {
  project: { name: string; stack: string };
  queue: {
    active: { id: string; title: string; chain: string[] } | null;
    pending: Array<{ id: string; title: string; priority: number; chain: string[] }>;
    blocked: Array<{ item: string; action: string }>;
  };
  metrics: {
    tasks_completed: number;
    tasks_in_progress: number;
    agents_invoked: number;
    last_activity: string | null;
  };
  tasks: {
    completed: string[];
    in_progress: string[];
    blocked: Array<{ item: string; hypothesis: string; action: string }>;
  };
  last_changes: Array<{
    timestamp: string;
    agent: string;
    task: string;
    files: string[];
    summary: string;
  }>;
}

const AGENTS = [
  { id: 'orchestrator', label: 'Orchestrator', icon: '🎯', model: 'opus', role: 'Планирует · Маршрутизирует', color: '#4F8EFF' },
  { id: 'planner', label: 'Planner', icon: '📋', model: 'opus', role: 'Декомпозиция задач', color: '#C9A96E' },
  { id: 'designer', label: 'Designer', icon: '🎨', model: 'sonnet', role: 'UI/UX спецификации', color: '#C9A96E' },
  { id: 'frontend', label: 'Frontend', icon: '⚡', model: 'sonnet/opus', role: 'React · R3F · 21st.dev', color: '#3ECFA0' },
  { id: 'backend', label: 'Backend', icon: '🔧', model: 'sonnet', role: 'API · Claude API · Telegram', color: '#3ECFA0' },
  { id: 'security', label: 'Security', icon: '🔒', model: 'haiku', role: 'Аудит безопасности', color: '#7878A0' },
  { id: 'qa', label: 'QA', icon: '✅', model: 'haiku', role: 'Тесты · Edge cases · E2E', color: '#7878A0' },
] as const;

const MODEL_COLOR: Record<string, string> = {
  'opus': '#C9A96E',
  'sonnet': '#4F8EFF',
  'sonnet/opus': '#3ECFA0',
  'haiku': '#7878A0',
};

export default function AgentsDashboard() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  let state: AgentState;
  try {
    const raw = readFileSync(join(process.cwd(), 'agents/state.json'), 'utf-8');
    state = JSON.parse(raw);
  } catch {
    return (
      <div style={{ background: '#07070F', color: '#F0F0FF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <p>❌ agents/state.json не найден</p>
      </div>
    );
  }

  const recentChanges = state.last_changes.slice(-10).reverse();

  return (
    <div style={{ background: '#07070F', color: '#F0F0FF', minHeight: '100vh', padding: '2rem', fontFamily: 'Geist, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: '#4F8EFF', margin: 0 }}>
            OPTISPHERE AGENTS
          </h1>
          <span style={{ background: '#10101E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9999px', padding: '0.2rem 0.75rem', fontSize: '0.7rem', color: '#7878A0', letterSpacing: '0.1em' }}>
            DEV ONLY
          </span>
        </div>
        <p style={{ color: '#7878A0', fontSize: '0.85rem', margin: 0 }}>{state.project.stack}</p>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Завершено задач', value: state.metrics.tasks_completed, color: '#3ECFA0' },
          { label: 'В прогрессе', value: state.metrics.tasks_in_progress, color: '#4F8EFF' },
          { label: 'Агентов вызвано', value: state.metrics.agents_invoked, color: '#C9A96E' },
          { label: 'Последняя активность', value: state.metrics.last_activity ? new Date(state.metrics.last_activity).toLocaleString('ru') : '—', color: '#7878A0' },
        ].map(m => (
          <div key={m.label} style={{ background: '#10101E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1rem 1.25rem' }}>
            <div style={{ color: m.color, fontSize: typeof m.value === 'number' ? '1.75rem' : '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{m.value}</div>
            <div style={{ color: '#7878A0', fontSize: '0.75rem' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Agents grid */}
      <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#7878A0', marginBottom: '1rem' }}>КОМАНДА</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {AGENTS.map(agent => (
          <div key={agent.id} style={{ background: '#10101E', border: `1px solid ${agent.color}22`, borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{agent.icon}</span>
              <span style={{ background: `${MODEL_COLOR[agent.model]}22`, color: MODEL_COLOR[agent.model], borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                {agent.model}
              </span>
            </div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: agent.color }}>{agent.label}</div>
            <div style={{ color: '#7878A0', fontSize: '0.75rem' }}>{agent.role}</div>
          </div>
        ))}
      </div>

      {/* Queue + Blocked */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Active + Queue */}
        <div>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#7878A0', marginBottom: '1rem' }}>ОЧЕРЕДЬ ЗАДАЧ</h2>

          {state.queue.active && (
            <div style={{ background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F8EFF', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '0.7rem', color: '#4F8EFF', letterSpacing: '0.1em' }}>АКТИВНА</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{state.queue.active.title}</div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {state.queue.active.chain.map((step, i) => (
                  <span key={i} style={{ background: '#0D0D1A', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', color: '#7878A0' }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {state.queue.pending.length === 0 && !state.queue.active && (
            <div style={{ color: '#3A3A5C', fontSize: '0.85rem', padding: '1rem 0' }}>Очередь пуста</div>
          )}

          {state.queue.pending.map(task => (
            <div key={task.id} style={{ background: '#10101E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#3A3A5C', fontFamily: 'monospace' }}>{task.id}</span>
                <span style={{ fontSize: '0.7rem', color: task.priority === 1 ? '#C9A96E' : '#7878A0' }}>P{task.priority}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{task.title}</div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {task.chain.map((step, i) => (
                  <span key={i} style={{ background: '#0D0D1A', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', color: '#7878A0' }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Blocked */}
        <div>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#7878A0', marginBottom: '1rem' }}>ПРОБЛЕМЫ</h2>
          {state.tasks.blocked.length === 0 ? (
            <div style={{ color: '#3ECFA0', fontSize: '0.85rem', padding: '1rem 0' }}>✓ Нет заблокированных задач</div>
          ) : (
            state.tasks.blocked.map((b, i) => (
              <div key={i} style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: '#C9A96E', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{b.item}</div>
                {'hypothesis' in b && <div style={{ color: '#7878A0', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{b.hypothesis}</div>}
                <div style={{ color: '#F0F0FF', fontSize: '0.8rem' }}>→ {b.action}</div>
              </div>
            ))
          )}

          {/* Completed summary */}
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#7878A0', marginBottom: '1rem', marginTop: '1.5rem' }}>ГОТОВО</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {state.tasks.completed.slice(-6).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#3ECFA0', flexShrink: 0, fontSize: '0.8rem' }}>✓</span>
                <span style={{ color: '#7878A0', fontSize: '0.8rem' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last changes log */}
      <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#7878A0', marginBottom: '1rem' }}>
        ПОСЛЕДНИЕ ИЗМЕНЕНИЯ {recentChanges.length === 0 && '— пусто'}
      </h2>
      {recentChanges.length > 0 && (
        <div style={{ background: '#10101E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          {recentChanges.map((change, i) => (
            <div key={i} style={{ padding: '0.875rem 1.25rem', borderBottom: i < recentChanges.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'grid', gridTemplateColumns: '120px 80px 1fr auto', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#3A3A5C', fontFamily: 'monospace' }}>
                {new Date(change.timestamp).toLocaleTimeString('ru')}
              </span>
              <span style={{ background: '#07070F', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', color: '#4F8EFF', textAlign: 'center' }}>
                {change.agent}
              </span>
              <span style={{ fontSize: '0.85rem' }}>{change.summary}</span>
              <span style={{ fontSize: '0.7rem', color: '#3A3A5C' }}>
                {change.files.length} file{change.files.length !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', color: '#3A3A5C', fontSize: '0.75rem' }}>
        <span>agents/state.json — обновляется агентами автоматически</span>
        <span>Reload page = refresh state</span>
      </div>
    </div>
  );
}
