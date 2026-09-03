import { useState, type KeyboardEvent } from 'react';

type Props = {
  skills: string[];
  onChange: (skills: string[]) => void;
};

export function SkillsInput({ skills, onChange }: Props) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (value.length === 0) {
      return;
    }
    onChange(skills.concat(value));
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    add();
  };

  return (
    <div>
      <div className="field-label">Навыки</div>
      <div className="chips">
        {skills.map((label, index) => (
          <span className="chip" key={`${label}-${index}`}>
            {label}
            <button
              type="button"
              className="chip-x"
              onClick={() => onChange(skills.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="chip-row">
        <input
          className="field-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Добавить навык"
        />
        <button type="button" className="ghost-btn" onClick={add}>
          Добавить
        </button>
      </div>
    </div>
  );
}
