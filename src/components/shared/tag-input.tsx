'use client';

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useTags } from '@/lib/hooks/use-tags';

const TAG_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = 'Etiket ekle...' }: TagInputProps) {
  const { tags: allTags, addTag } = useTags();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = allTags.filter(
    (t) => !value.includes(t.name) && t.name.toLowerCase().includes(input.toLowerCase())
  );

  const handleAdd = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || value.includes(trimmed)) return;

    // Create tag if it doesn't exist
    const existing = allTags.find((t) => t.name === trimmed);
    if (!existing) {
      const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      await addTag(trimmed, randomColor);
    }

    onChange([...value, trimmed]);
    setInput('');
    setShowSuggestions(false);
  };

  const handleRemove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAdd(suggestions[0].name);
      } else {
        handleAdd(input);
      }
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[32px] p-1 rounded-lg border bg-transparent">
        {value.map((tag) => {
          const tagData = allTags.find((t) => t.name === tag);
          return (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs gap-1"
              style={{
                backgroundColor: tagData ? tagData.color + '20' : undefined,
                color: tagData ? tagData.color : undefined,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="hover:text-destructive ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent text-sm outline-none px-1"
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && (input || suggestions.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 10).map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="text-xs px-2 py-1 rounded-md border hover:bg-accent transition-colors flex items-center gap-1"
              style={{
                borderColor: tag.color + '40',
                color: tag.color,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleAdd(tag.name);
              }}
            >
              {tag.name}
            </button>
          ))}
          {input && !allTags.find((t) => t.name === input.trim()) && (
            <button
              type="button"
              className="text-xs px-2 py-1 rounded-md border border-dashed hover:bg-accent transition-colors flex items-center gap-1"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAdd(input);
              }}
            >
              <Plus className="w-3 h-3" />
              &quot;{input}&quot; oluştur
            </button>
          )}
        </div>
      )}
    </div>
  );
}
