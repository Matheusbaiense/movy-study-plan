export interface TextBlock      { type: 'text';      content: string }
export interface StepsBlock     { type: 'steps';     title?: string; items: { num?: number; title: string; body?: string; note?: string }[] }
export interface ChecklistBlock { type: 'checklist'; id: string; title?: string; items: { id: string; label: string }[] }
export interface InfoBoxBlock   { type: 'infobox';   variant: 'tip' | 'warn' | 'alert' | 'info'; title?: string; content: string }
export interface EmailBlock     { type: 'email';     id: string; label?: string; from?: string; to?: string; cc?: string; subject: string; body: string }
export interface TableBlock     { type: 'table';     headers: string[]; rows: string[][] }
export interface SectionBlock   { type: 'section';   title: string; children: Block[] }

export type Block =
  | TextBlock
  | StepsBlock
  | ChecklistBlock
  | InfoBoxBlock
  | EmailBlock
  | TableBlock
  | SectionBlock
