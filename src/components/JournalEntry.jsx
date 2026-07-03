import React from 'react'
import { BookHeart } from 'lucide-react'

export default function JournalEntry({ text, onChange }) {
  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <div className="flex items-center gap-2 mb-3">
        <BookHeart className="w-4 h-4 text-accent-pink" />
        <h2 className="text-sm font-bold text-text-primary">مذكرات اليوم</h2>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب ما تشعر به اليوم..."
        rows={3}
        className="w-full bg-dark-surface text-text-primary text-sm rounded-xl p-3 border border-dark-border placeholder:text-text-muted/50 resize-none transition-colors focus:border-accent-purple/50 leading-relaxed"
      />
    </div>
  )
}
