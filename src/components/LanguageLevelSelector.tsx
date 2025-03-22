
import React from 'react';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Fluent'] as const;
type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];

interface LanguageLevelSelectorProps {
  selectedLevel: ProficiencyLevel;
  onChange: (level: ProficiencyLevel) => void;
  disabled?: boolean;
}

const LanguageLevelSelector: React.FC<LanguageLevelSelectorProps> = ({
  selectedLevel,
  onChange,
  disabled = false
}) => {
  return (
    <div className="flex space-x-1">
      {PROFICIENCY_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => !disabled && onChange(level)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedLevel === level
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

export default LanguageLevelSelector;
