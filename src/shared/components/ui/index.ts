/**
 * Studio design system — shared UI primitives.
 *
 * Import from this barrel:
 *   import { Button, Card, StageChip } from '@/shared/components/ui';
 *
 * (Or relative; the project does not use path aliases.)
 */

export { cn } from './cn';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { IconButton, type IconButtonProps } from './IconButton';
export { Card, CardHeader, CardBody, CardFooter, type CardProps } from './Card';
export { PageHeader, PageContainer, Section, SectionHeader } from './Surface';
export { Input, type InputProps } from './Input';
export { Textarea, type TextareaProps } from './Textarea';
export { Field, type FieldProps } from './Field';
export { Select, type SelectProps, type SelectOption } from './Select';
export { Combobox, type ComboboxProps, type ComboboxOption } from './Combobox';
export { Tabs, type TabsProps, type TabItem } from './Tabs';
export { Drawer, type DrawerProps } from './Drawer';
export { Modal, type ModalProps, type ModalSize } from './Modal';
export { Chip, type ChipProps, type ChipTone } from './Chip';
export { StageChip, type StageChipProps } from './StageChip';
export { KBD, KBDSequence, type KBDProps } from './KBD';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { KpiTile, type KpiTileProps } from './KpiTile';
export { Avatar, AvatarStack, type AvatarProps, type AvatarSize, type AvatarStackProps } from './Avatar';
export { Tooltip, type TooltipProps, type TooltipSide } from './Tooltip';
export { ToastProvider, useToast, type ToastOptions, type ToastTone } from './Toast';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from './Table';
export { Switch, type SwitchProps } from './Switch';
