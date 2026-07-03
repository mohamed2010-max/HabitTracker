const HABIT_TEMPLATES = [
  { id: 'habit-1', text: 'شرب ٨ أكواب ماء', icon: 'droplets' },
  { id: 'habit-2', text: 'قراءة ٣٠ دقيقة', icon: 'book-open' },
  { id: 'habit-3', text: 'رياضة ٣٠ دقيقة', icon: 'dumbbell' },
  { id: 'habit-4', text: 'النوم قبل ١١ مساءً', icon: 'moon' },
]

const MISSION_TEMPLATES = {
  1: [
    { id: 'm-1-1', text: 'حدد ٣ أهداف لهذا الشهر', xp: 100 },
    { id: 'm-1-2', text: 'رتب غرفتك', xp: 50 },
    { id: 'm-1-3', text: 'اكتب يومياتك', xp: 50 },
  ],
}

const REWARDS = [
  { day: 7, text: 'أسبوع كامل! أنت نجم ?️', emoji: '⭐' },
  { day: 14, text: 'نصف الرحلة! استمر ?', emoji: '🔥' },
  { day: 21, text: 'ثلاثة أسابيع! لا تتوقف ?', emoji: '💪' },
  { day: 30, text: 'أكملت الرحلة! أنت بطل ?', emoji: '🏆' },
]

function createDayData(dayNumber) {
  return {
    missions: (MISSION_TEMPLATES[dayNumber] || []).map(m => ({ ...m, completed: false })),
    habits: HABIT_TEMPLATES.map(h => ({ ...h, completed: false })),
    rating: 0,
    journal: '',
    completed: false,
  }
}

export function createInitialState() {
  const days = {}
  for (let i = 1; i <= 30; i++) {
    days[i] = createDayData(i)
  }
  return {
    currentDay: 1,
    days,
    totalXP: 0,
  }
}

export function getRewardForDay(day) {
  return REWARDS.find(r => r.day === day) || null
}
