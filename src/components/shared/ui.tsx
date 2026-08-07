import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { CloseIcon } from './icons'

/** A flat, rule-divided section — the system draws structure with a top rule, never a boxed card. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 border-t-2 border-divider pt-4 ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {kicker && (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-accent-700 uppercase">{kicker}</p>
        )}
        <h1 className="text-[32px] leading-[1.05] tracking-[-0.03em] font-semibold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-neutral-700">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Tag({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'ink'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-neutral-200 text-neutral-700',
    accent: 'bg-accent-200 text-accent-800',
    ink: 'bg-ink text-paper',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'done'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-3 font-heading text-[14.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45'
  const variants: Record<ButtonVariant, string> = {
    primary: 'border-2 border-accent bg-accent text-white hover:bg-accent-600 active:bg-accent-700',
    secondary: 'border-2 border-divider bg-transparent text-ink hover:bg-neutral-100',
    ghost: 'border-2 border-transparent bg-transparent text-accent-700 hover:bg-accent-100',
    danger: 'border-2 border-accent-700 bg-transparent text-accent-700 hover:bg-accent-100',
    done: 'border-2 border-ink bg-ink text-paper',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function IconButton({
  className = '',
  active = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition ${
        active ? 'border-accent bg-accent-100 text-accent' : 'border-divider bg-transparent text-neutral-600 hover:bg-neutral-100'
      } ${className}`}
      {...props}
    />
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div className={`flex gap-0.5 rounded-full bg-neutral-200 p-1 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`min-h-10 flex-1 rounded-full px-2 font-heading text-[13px] font-semibold transition ${
            value === opt.id ? 'bg-ink text-paper' : 'text-neutral-700 hover:text-ink'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-10 rounded-full px-4 py-2 font-heading text-[13px] font-semibold whitespace-nowrap transition ${
        active ? 'bg-ink text-paper' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
      }`}
    >
      {children}
    </button>
  )
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-neutral-200 ${className}`}>
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${clamped * 100}%` }} />
    </div>
  )
}

export const inputClass =
  'w-full min-h-11 rounded-full border-2 border-divider bg-neutral-100 px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-neutral-500 focus-visible:border-accent'

export const textareaClass =
  'w-full rounded-2xl border-2 border-divider bg-neutral-100 px-4 py-3 text-[15px] text-ink outline-none placeholder:text-neutral-500 focus-visible:border-accent resize-none'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`${inputClass} ${className}`} {...rest} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea className={`${textareaClass} ${className}`} {...rest} />
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto border-t-4 border-ink bg-paper px-5 pt-5 pb-8 sm:border-2 sm:pb-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">{title}</h2>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon width={16} height={16} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-t-2 border-divider px-4 py-12 text-center">
      <span className="mb-3 text-neutral-400">{icon}</span>
      <p className="font-heading font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-neutral-600">{description}</p>}
    </div>
  )
}

export function Banner({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded-full bg-accent-100 px-4 py-2.5 text-sm text-accent-800">{children}</div>
}
