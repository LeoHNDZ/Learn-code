import React from 'react';
import '../../styles/chat.css';

const SUGGESTIONS = [
  'Explain this concept',
  'Give me a practice exercise', 
  'Summarize the last lesson',
  'What should I learn next?'
];

interface QuickSuggestionsProps { 
  onSelect: (value: string) => void; 
}

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSelect }) => (
  <div className="quick-suggestions">
    {SUGGESTIONS.map(s => (
      <button key={s} className="suggestion-chip" onClick={() => onSelect(s)}>
        {s}
      </button>
    ))}
  </div>
);