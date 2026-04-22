# Agent Flow — Optisphere

> **VS Code:** установить расширение [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid), затем `Ctrl+Shift+V` для просмотра.  
> **GitHub:** рендерится автоматически в любом .md файле.

---

## Маршрутизация агентов

```mermaid
flowchart TD
    U(["👤 Олег"])

    subgraph CORE ["ORCHESTRATOR · claude-opus-4-6"]
        ORC["🎯 orchestrator.md\nПланирует · Маршрутизирует · Хранит стейт"]
        ST[("📦 state.json")]
        ORC <-.->|read / last_changes append| ST
    end

    subgraph PLAN ["PLANNING · opus"]
        PLN["📋 planner.md\nДекомпозиция сложных фич\ntask-tree JSON"]
    end

    subgraph CREATE ["CREATION"]
        DSN["🎨 designer.md\nUI/UX спецификации\nCinematic · Interactive\nsonnet"]
        FE["⚡ frontend.md\nReact · R3F · Framer Motion\n21st.dev · GSAP\nsonnet / opus для 3D"]
        BE["🔧 backend.md\nAPI routes · Claude API\nTelegram Bot\nsonnet"]
    end

    subgraph QUALITY ["QUALITY · claude-haiku-4-5"]
        SEC["🔒 security.md\nXSS · Инъекции · CORS\nRate limiting · Secrets"]
        QA["✅ qa.md\nТесты · Edge cases\nPlaywright E2E"]
    end

    U -->|"задача"| ORC

    ORC -->|"сложная фича ≥3 агентов"| PLN
    PLN -->|"task-tree"| ORC

    ORC -->|"UI компонент"| DSN
    DSN -->|"spec + i18n keys"| FE
    ORC -->|"API / интеграция"| BE
    ORC -->|"баг WebGL/3D · opus"| FE

    FE -->|"компонент готов"| QA
    BE -->|"endpoint готов"| SEC
    SEC -->|"issues · фиксы нужны"| BE
    SEC -->|"чисто"| QA

    QA -->|"bug found → frontend"| FE
    QA -->|"bug found → backend"| BE
    QA -->|"✓ всё ок"| ORC

    ORC -->|"отчёт"| U

    style CORE fill:#0D0D1A,stroke:#4F8EFF,stroke-width:2px,color:#F0F0FF
    style PLAN fill:#0D0D1A,stroke:#C9A96E,stroke-width:1px,color:#F0F0FF
    style CREATE fill:#0D0D1A,stroke:#3ECFA0,stroke-width:1px,color:#F0F0FF
    style QUALITY fill:#0D0D1A,stroke:#7878A0,stroke-width:1px,color:#F0F0FF
```

---

## Матрица: задача → цепочка → модели

```mermaid
flowchart LR
    T1["UI секция"] -->|designer→| F1["sonnet"] -->|frontend→| F2["sonnet"] -->|qa| F3["haiku"]
    T2["Cinematic 3D"] -->|designer→| G1["sonnet"] -->|frontend| G2["OPUS"] -->|qa| G3["haiku"]
    T3["API endpoint"] -->|backend→| H1["sonnet"] -->|security→| H2["haiku"] -->|qa| H3["haiku"]
    T4["Баг WebGL"] -->|frontend| I1["OPUS"] -->|qa| I2["haiku"]
    T5["Полная фича"] -->|planner→| J1["opus"] -->|...| J2["цепочки\nвыше"]

    style T2 fill:#10101E,stroke:#4F8EFF
    style T4 fill:#10101E,stroke:#C9A96E
    style T5 fill:#10101E,stroke:#3ECFA0
    style G2 fill:#10101E,stroke:#4F8EFF,stroke-width:2px
    style I1 fill:#10101E,stroke:#4F8EFF,stroke-width:2px
    style J1 fill:#10101E,stroke:#3ECFA0,stroke-width:2px
```

---

## Обновление стейта (только диффы)

```mermaid
sequenceDiagram
    participant O as Orchestrator
    participant A as Sub-Agent
    participant S as state.json

    O->>S: read() → нужный slice
    O->>A: task + context-slice + constraints
    A-->>O: { result, files_changed, next_agent, context_for_next }
    O->>S: append last_changes (diff only)
    
    alt next_agent != null
        O->>A: передаёт context_for_next следующему агенту
    else next_agent == null
        O-->>U: отчёт пользователю
    end
```

---

## Файлы системы

| Файл | Назначение |
|------|-----------|
| [orchestrator.md](orchestrator.md) | Главный агент: планировщик + маршрутизатор |
| [planner.md](planner.md) | Декомпозиция → task-tree JSON |
| [designer.md](designer.md) | UI/UX спецификации (cinematic) |
| [frontend.md](frontend.md) | React, R3F, 21st.dev, GSAP |
| [backend.md](backend.md) | API routes, Claude API, Telegram |
| [security.md](security.md) | Аудит безопасности |
| [qa.md](qa.md) | Тесты + E2E |
| [state.json](state.json) | Общий стейт проекта |
| [tasks/](tasks/) | Задачи для команды |
