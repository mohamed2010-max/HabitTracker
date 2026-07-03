import React, { useState, useMemo, useCallback } from 'react'
import DayHeader from './components/DayHeader.jsx'
import MissionsList from './components/MissionsList.jsx'
import HabitsList from './components/HabitsList.jsx'
import RatingStars from './components/RatingStars.jsx'
import JournalEntry from './components/JournalEntry.jsx'
import DayFooter from './components/DayFooter.jsx'
import { createInitialState, getRewardForDay } from './data/initialData.js'

const TOTAL_DAYS = 30

function calcDayXP(dayData) {
  const missionXP = dayData.missions
    .filter(m => m.completed)
    .reduce((sum, m) => sum + (m.xp || 0), 0)
  const habitXP = dayData.habits.filter(h => h.completed).length * 25
  const ratingBonus = dayData.rating >= 4 ? 30 : dayData.rating >= 2 ? 10 : 0
  return missionXP + habitXP + ratingBonus
}

export default function App() {
  const [state, setState] = useState(() => createInitialState())

  const currentDayData = state.days[state.currentDay]

  const reward = useMemo(
    () => getRewardForDay(state.currentDay),
    [state.currentDay]
  )

  const handleToggleMission = useCallback((missionId) => {
    setState(prev => {
      const day = { ...prev.days[prev.currentDay] }
      day.missions = day.missions.map(m =>
        m.id === missionId ? { ...m, completed: !m.completed } : m
      )
      const dayXP = calcDayXP(day)
      return {
        ...prev,
        days: { ...prev.days, [prev.currentDay]: day },
        totalXP: Object.entries(prev.days).reduce((sum, [key, d]) => {
          if (Number(key) === prev.currentDay) return sum + dayXP
          return sum + calcDayXP(d)
        }, 0),
      }
    })
  }, [])

  const handleToggleHabit = useCallback((habitId) => {
    setState(prev => {
      const day = { ...prev.days[prev.currentDay] }
      day.habits = day.habits.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      )
      const dayXP = calcDayXP(day)
      return {
        ...prev,
        days: { ...prev.days, [prev.currentDay]: day },
        totalXP: Object.entries(prev.days).reduce((sum, [key, d]) => {
          if (Number(key) === prev.currentDay) return sum + dayXP
          return sum + calcDayXP(d)
        }, 0),
      }
    })
  }, [])

  const handleRating = useCallback((rating) => {
    setState(prev => {
      const day = { ...prev.days[prev.currentDay] }
      day.rating = rating
      const dayXP = calcDayXP(day)
      return {
        ...prev,
        days: { ...prev.days, [prev.currentDay]: day },
        totalXP: Object.entries(prev.days).reduce((sum, [key, d]) => {
          if (Number(key) === prev.currentDay) return sum + dayXP
          return sum + calcDayXP(d)
        }, 0),
      }
    })
  }, [])

  const handleJournal = useCallback((text) => {
    setState(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [prev.currentDay]: { ...prev.days[prev.currentDay], journal: text },
      },
    }))
  }, [])

  const handlePrevDay = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDay: Math.max(1, prev.currentDay - 1),
    }))
  }, [])

  const handleNextDay = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDay: Math.min(TOTAL_DAYS, prev.currentDay + 1),
    }))
  }, [])

  const handleGoToToday = useCallback(() => {
    setState(prev => ({ ...prev, currentDay: 1 }))
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        <DayHeader
          currentDay={state.currentDay}
          totalDays={TOTAL_DAYS}
          totalXP={state.totalXP}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />

        <MissionsList
          missions={currentDayData.missions}
          onToggleMission={handleToggleMission}
        />

        <HabitsList
          habits={currentDayData.habits}
          onToggleHabit={handleToggleHabit}
        />

        <RatingStars
          rating={currentDayData.rating}
          onChange={handleRating}
        />

        <JournalEntry
          text={currentDayData.journal}
          onChange={handleJournal}
        />

        <DayFooter
          currentDay={state.currentDay}
          totalDays={TOTAL_DAYS}
          onGoToToday={handleGoToToday}
          reward={reward}
        />

      </div>
    </div>
  )
}
