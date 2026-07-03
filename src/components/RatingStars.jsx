import React from 'react'
import { Star } from 'lucide-react'

const LABELS = {
  0: 'لم تقيم بعد',
  1: 'سيء',
  2: 'ضعيف',
  3: 'جيد',
  4: 'ممتاز',
  5: 'رائع!',
}

export default function RatingStars({ rating, onChange }) {
  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <h2 className="text-sm font-bold text-text-primary mb-3">تقييم اليوم</h2>
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star === rating ? 0 : star)}
            className={`p-1.5 rounded-lg transition-all ${
              star <= rating
                ? 'text-accent-gold scale-110'
                : 'text-text-muted hover:text-accent-gold/50'
            }`}
          >
            <Star
              className="w-7 h-7 transition-all"
              fill={star <= rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-text-muted mt-2">
        {LABELS[rating] || 'لم تقيم بعد'}
      </p>
    </div>
  )
}
