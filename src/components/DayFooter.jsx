import React from 'react'
import { Trophy, ArrowLeftToLine, Lock } from 'lucide-react'

export default function DayFooter({ currentDay, totalDays, onGoToToday, reward }) {
  const isLastDay = currentDay === totalDays

  return (
    <div className="space-y-3">
      {reward && (
        <div className="bg-gradient-to-r from-accent-gold/10 to-accent-purple/10 rounded-2xl p-4 border border-accent-gold/20 text-center">
          <span className="text-2xl block mb-1">{reward.emoji}</span>
          <p className="text-sm font-bold text-accent-gold">{reward.text}</p>
        </div>
      )}

      <button
        onClick={onGoToToday}
        className="w-full flex items-center justify-center gap-2 bg-dark-card hover:bg-dark-surface border border-dark-border rounded-2xl p-3.5 transition-colors text-text-secondary hover:text-text-primary text-sm font-medium"
      >
        <ArrowLeftToLine className="w-4 h-4" />
        عد إلى اليوم الحالي
      </button>

      {isLastDay && (
        <div className="flex items-center justify-center gap-2 bg-accent-gold/10 rounded-2xl p-4 border border-accent-gold/20">
          <Trophy className="w-5 h-5 text-accent-gold" />
          <p className="text-sm font-bold text-accent-gold">أكملت الرحلة! أنت بطل 🏆</p>
        </div>
      )}
    </div>
  )
}
