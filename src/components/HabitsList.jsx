import React from 'react'
import { Zap, CheckCircle, Circle } from 'lucide-react'

const ICON_MAP = {
  droplets: '💧',
  'book-open': '📖',
  dumbbell: '🏋️',
  moon: '🌙',
}

export default function HabitsList({ habits, onToggleHabit }) {
  const completed = habits.filter(h => h.completed).length
  const total = habits.length

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-green" />
          <h2 className="text-sm font-bold text-text-primary">العادات اليومية</h2>
        </div>
        <span className="text-xs text-text-muted">{completed}/{total}</span>
      </div>
      <div className="space-y-2">
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => onToggleHabit(habit.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
              habit.completed
                ? 'bg-accent-green/8 border border-accent-green/20'
                : 'bg-dark-surface hover:bg-dark-surface/80 border border-transparent'
            }`}
          >
            {habit.completed ? (
              <CheckCircle className="w-5 h-5 text-accent-green shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-text-muted shrink-0" />
            )}
            <span className="text-lg shrink-0">{ICON_MAP[habit.icon] || '📌'}</span>
            <span className={`flex-1 text-sm ${
              habit.completed ? 'text-text-muted line-through' : 'text-text-primary'
            }`}>
              {habit.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
