import React from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DayHeader({ currentDay, totalDays, totalXP, onPrevDay, onNextDay }) {
  const progress = (currentDay / totalDays) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">رحلة العادات</h1>
            <p className="text-xs text-text-muted">٣٠ يوماً من التغيير</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-accent-gold/10 px-3 py-1.5 rounded-full">
          <span className="text-sm font-bold text-accent-gold">{totalXP}</span>
          <span className="text-xs text-text-muted">XP</span>
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onPrevDay}
            disabled={currentDay === 1}
            className="p-1.5 rounded-lg hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-text-primary">
              اليوم <span className="text-accent-gold">{currentDay}</span>
            </p>
            <p className="text-xs text-text-muted">من أصل {totalDays}</p>
          </div>
          <button
            onClick={onNextDay}
            disabled={currentDay === totalDays}
            className="p-1.5 rounded-lg hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #A78BFA, #4ADE80)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
