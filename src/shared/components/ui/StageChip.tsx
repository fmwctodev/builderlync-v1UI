import { type HTMLAttributes } from 'react';
import { STAGE_CHIP_CLASS, STAGE_LABELS, type PipelineStage } from '../../tokens';
import { cn } from './cn';

export interface StageChipProps extends HTMLAttributes<HTMLSpanElement> {
  stage: PipelineStage;
  /** Show a 6px circle dot before the label. */
  withDot?: boolean;
}

/**
 * Pipeline stage badge — desaturated, readable on any surface.
 * Pairs with STAGE_LABELS / STAGE_CHIP_CLASS in tokens.ts.
 */
export function StageChip({ stage, withDot = true, className, children, ...rest }: StageChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 h-6 rounded-studio-1 border text-caption font-medium whitespace-nowrap',
        STAGE_CHIP_CLASS[stage],
        className,
      )}
      {...rest}
    >
      {withDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children ?? STAGE_LABELS[stage]}
    </span>
  );
}
