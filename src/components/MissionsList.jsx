import React from 'react'
import { Swords, CheckCircle, Circle } from 'lucide-react'

export default function MissionsList({ missions, onToggleMission }) {
  const completed = missions.filter(m => m.completed).length
  const total = missions.length

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-accent-gold" />
          <h2 className="text-sm font-bold text-text-primary">المهمات</h2>
        </div>
        <span className="text-xs text-text-muted">{completed}/{total}</span>
      </div>
      <div className="space-y-2">
        {missions.map((mission) => (
          <button
            key={mission.id}
            onClick={() => onToggleMission(mission.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
              mission.completed
                ? 'bg-accent-green/8 border border-accent-green/20'
                : 'bg-dark-surface hover:bg-dark-surface/80 border border-transparent'
            }`}
          >
            {mission.completed ? (
              <CheckCircle className="w-5 h-5 text-accent-green shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-text-muted shrink-0" />
            )}
            <span className={`flex-1 text-sm ${
              mission.completed ? 'text-text-muted line-through' : 'text-text-primary'
            }`}>
              {mission.text}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              mission.completed
                ? 'bg-accent-green/15 text-accent-green'
                : 'bg-accent-gold/10 text-accent-gold'
            }`}>
              +{mission.xp} XP
            </span>
          </button>
        ))}
        {missions.length === 0 && (
          <p className="text-center text-text-muted text-sm py-4">لا توجد مهمات اليوم</p>
        )}
      </div>
    </div>
  )
}
