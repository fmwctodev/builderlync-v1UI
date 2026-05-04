import { type HTMLAttributes, type ReactNode, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';
import { cn } from './cn';

/**
 * Studio table primitives.
 *
 * Compose like:
 *   <Table>
 *     <TableHeader>
 *       <TableRow>
 *         <TableHead>Project</TableHead>
 *         <TableHead numeric>Value</TableHead>
 *       </TableRow>
 *     </TableHeader>
 *     <TableBody>
 *       <TableRow interactive onClick={...}>
 *         <TableCell>...</TableCell>
 *         <TableCell numeric>$12,300</TableCell>
 *       </TableRow>
 *     </TableBody>
 *   </Table>
 *
 * For very large datasets, wrap with `react-virtuoso` or similar at the call
 * site — these primitives do not virtualize automatically.
 */

export function Table({ className, children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto scrollbar-studio rounded-studio-3 border border-edge-soft dark:border-edge-d-soft">
      <table className={cn('w-full border-collapse text-left', className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-surface-2 dark:bg-surface-d-2 border-b border-edge-soft dark:border-edge-d-soft',
        className,
      )}
      {...rest}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('', className)} {...rest}>
      {children}
    </tbody>
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
  selected?: boolean;
}

export function TableRow({ interactive = false, selected = false, className, children, ...rest }: TableRowProps) {
  return (
    <tr
      data-selected={selected || undefined}
      className={cn(
        'border-b border-edge-soft dark:border-edge-d-soft last:border-b-0 transition-colors duration-fast',
        interactive && 'hover:bg-surface-2/60 dark:hover:bg-surface-d-2/60 cursor-pointer',
        selected && 'bg-surface-2 dark:bg-surface-d-2',
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function TableHead({ numeric = false, className, children, ...rest }: TableHeadProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 h-10 studio-text-label whitespace-nowrap',
        numeric && 'text-right',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  muted?: boolean;
}

export function TableCell({ numeric = false, muted = false, className, children, ...rest }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle',
        numeric ? 'studio-num text-right' : 'studio-text-body',
        muted && 'text-ink-3 dark:text-ink-d-3',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={100} className="px-4 py-12">
        {children}
      </td>
    </tr>
  );
}
