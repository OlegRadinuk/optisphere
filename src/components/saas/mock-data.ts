export type LeadStatus = "new" | "working" | "closed"

export interface Lead {
  id: string
  name: string
  contact: string
  request: string
  status: LeadStatus
  timeAgo: string
  dialog: Array<{ role: "user" | "assistant"; content: string; time: string }>
}

export const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    name: "Анна Петрова",
    contact: "+7 978 123-45-67",
    request: "Запись к стоматологу, ребёнок 6 лет",
    status: "new",
    timeAgo: "5 мин назад",
    dialog: [
      { role: "user", content: "Здравствуйте! Хочу записаться к стоматологу для ребёнка, ему 6 лет", time: "22:41" },
      { role: "assistant", content: "Добрый день! Конечно, записать ребёнка к детскому стоматологу — в любое время. Как зовут ребёнка и на какой день вам удобно?", time: "22:41" },
      { role: "user", content: "Антон. Можно на завтра, во второй половине дня?", time: "22:42" },
      { role: "assistant", content: "Антон — принял. Завтра после 14:00 есть свободное время в 15:00 и 17:00. Какое предпочитаете?", time: "22:42" },
      { role: "user", content: "В 15:00, пожалуйста", time: "22:43" },
      { role: "assistant", content: "Отлично! Записал Антона на завтра в 15:00 к детскому стоматологу. Оставьте ваш телефон — администратор подтвердит запись.", time: "22:43" },
      { role: "user", content: "+7 978 123-45-67", time: "22:44" },
      { role: "assistant", content: "Спасибо, Анна! Ваш номер зафиксирован. Ждём Антона завтра в 15:00. Если что-то изменится — пишите, поможем перенести.", time: "22:44" },
    ],
  },
  {
    id: "2",
    name: "Сергей Иванов",
    contact: "@serg_iv",
    request: "Сколько стоит консультация терапевта?",
    status: "working",
    timeAgo: "42 мин назад",
    dialog: [
      { role: "user", content: "Сколько стоит консультация терапевта?", time: "22:05" },
      { role: "assistant", content: "Первичная консультация терапевта — 1 500 ₽, повторная — 1 000 ₽. Хотите записаться?", time: "22:05" },
    ],
  },
  {
    id: "3",
    name: "Марина К.",
    contact: "+7 965 987-65-43",
    request: "Хочу записаться на УЗИ, завтра можно?",
    status: "new",
    timeAgo: "1 ч назад",
    dialog: [
      { role: "user", content: "Хочу записаться на УЗИ, завтра можно?", time: "21:48" },
      { role: "assistant", content: "Да, завтра есть окна на УЗИ. Какой орган нужно обследовать?", time: "21:48" },
    ],
  },
  {
    id: "4",
    name: "Дмитрий Фёдоров",
    contact: "+7 921 456-78-90",
    request: "Работаете ли в воскресенье?",
    status: "closed",
    timeAgo: "вчера",
    dialog: [
      { role: "user", content: "Работаете ли в воскресенье?", time: "18:30" },
      { role: "assistant", content: "Да, воскресенье работаем с 9:00 до 15:00. Хотите записаться?", time: "18:30" },
      { role: "user", content: "Нет, спасибо, просто уточнял", time: "18:32" },
    ],
  },
  {
    id: "5",
    name: "Елена Сидорова",
    contact: "@elena_s",
    request: "Нужна справка для школы",
    status: "working",
    timeAgo: "вчера",
    dialog: [
      { role: "user", content: "Нужна справка для школы", time: "14:20" },
      { role: "assistant", content: "Справку для школы выдаёт педиатр на приёме. Хотите записаться к педиатру?", time: "14:20" },
    ],
  },
  {
    id: "6",
    name: "Ольга Никитина",
    contact: "+7 989 234-56-78",
    request: "Цена на брекеты для взрослых",
    status: "new",
    timeAgo: "2 дня назад",
    dialog: [
      { role: "user", content: "Какая цена на брекеты для взрослых?", time: "11:05" },
      { role: "assistant", content: "Металлические брекеты — от 45 000 ₽, сапфировые — от 65 000 ₽. Хотите записаться на консультацию к ортодонту бесплатно?", time: "11:05" },
    ],
  },
  {
    id: "7",
    name: "Алексей Волков",
    contact: "+7 978 345-67-89",
    request: "Запись к ортодонту",
    status: "closed",
    timeAgo: "3 дня назад",
    dialog: [
      { role: "user", content: "Запишите к ортодонту пожалуйста", time: "10:15" },
      { role: "assistant", content: "Конечно! Ближайшее окно к ортодонту — послезавтра в 11:00 или в пятницу в 15:00. Что удобнее?", time: "10:15" },
      { role: "user", content: "Послезавтра в 11:00", time: "10:16" },
      { role: "assistant", content: "Записал! Оставьте телефон — администратор подтвердит.", time: "10:17" },
      { role: "user", content: "+7 978 345-67-89", time: "10:18" },
    ],
  },
  {
    id: "8",
    name: "Татьяна М.",
    contact: "@tanya_m",
    request: "Есть ли у вас детский врач?",
    status: "closed",
    timeAgo: "4 дня назад",
    dialog: [
      { role: "user", content: "Есть ли у вас детский врач?", time: "09:30" },
      { role: "assistant", content: "Да, у нас работает педиатр — принимает детей с рождения до 14 лет. Записать?", time: "09:30" },
      { role: "user", content: "Спасибо, позже перезвоним", time: "09:32" },
    ],
  },
]

export const MOCK_STATS = {
  leadsWeek: 23,
  leadsToday: 5,
  avgResponseTime: "< 3 сек",
  conversionRate: "34%",
  totalDialogs: 68,
  trialDaysLeft: 7,
}

export const MOCK_ANALYTICS = {
  period: "7 дней",
  totalLeads: 23,
  trend: "+12%",
  chartHeights: [40, 55, 30, 70, 85, 45, 65],
  avgAiResponseTime: "< 3 сек",
  avgCloseTime: "2 ч 14 мин",
  conversionRate: 34,
  totalDialogs: 68,
}
