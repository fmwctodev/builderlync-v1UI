import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const TemperatureSlider: React.FC<Props> = ({ value, onChange, disabled }) => {
  const steps = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
  const index = steps.indexOf(value);
  const pct = index >= 0 ? (index / (steps.length - 1)) * 100 : 40;

  const label = value <= 0.3 ? 'Precise' : value <= 0.5 ? 'Balanced' : 'Creative';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Precise</span>
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
          {value.toFixed(1)} — {label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Creative</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          step={1}
          value={index >= 0 ? index : 2}
          disabled={disabled}
          onChange={(e) => onChange(steps[parseInt(e.target.value)])}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #dc2626 ${pct}%, #e5e7eb ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
};
