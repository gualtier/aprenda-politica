/**
 * Brand iconography — outline, stroke 2, rounded caps/joins, currentColor.
 * Heroicons / Lucide style per Aprenda Política design system.
 * Color comes from the parent via `currentColor` (set text color on the wrapper).
 */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { className?: string }

function base(className?: string): SVGProps<SVGSVGElement> {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    className,
  }
}

/** Justiça / Judiciário — scales of justice */
export function IconScale({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h4c2 0 4-1 5-2 1 1 3 2 5 2h4" />
    </svg>
  )
}

/** Instituições / Executivo — columned building */
export function IconBank({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M12 3 3 8h18z" />
    </svg>
  )
}

/** Conteúdos / Legislativo — document with lines */
export function IconFile({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M9 13h6M9 17h6" />
    </svg>
  )
}

/** Estadual — territory / map */
export function IconMap({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
    </svg>
  )
}

/** Município / Municipal — city skyline */
export function IconCity({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M3 21h18M9 21V7l7-4v18M5 21V12l4-4" />
      <path d="M13 21v-4h3v4" />
    </svg>
  )
}

/** Município pin (mapa) */
export function IconMapPin({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/** Federal / Brasil — flag */
export function IconFlag({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M4 21V4M4 4h13l-2 4 2 4H4" />
    </svg>
  )
}

/** Presidente — award / medal */
export function IconMedal({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
    </svg>
  )
}

/** Vereador — chair / seat */
export function IconChair({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M6 19v2M18 19v2M6 13h12M6 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4M9 4v5M15 4v5" />
    </svg>
  )
}

/** Lei / processo — scroll */
export function IconScroll({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M8 3h10a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2M16 8v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3 2 2 0 0 1 2-2h11" />
      <path d="M8 3a2 2 0 0 0-2 2v9M9 7h4M9 11h4" />
    </svg>
  )
}

/** Aprender — open book */
export function IconBook({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M2 5h7a3 3 0 0 1 3 3v11a2.5 2.5 0 0 0-2.5-2.5H2zM22 5h-7a3 3 0 0 0-3 3v11a2.5 2.5 0 0 1 2.5-2.5H22z" />
    </svg>
  )
}

/** Insight / dica — lightbulb */
export function IconBulb({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
    </svg>
  )
}

/** Apresentação — pencil / write */
export function IconPencil({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

/** Comissões — magnifier */
export function IconSearch({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/** Plenário — vote / ballot */
export function IconVote({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

/** Casa revisora — exchange / refresh */
export function IconRefresh({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
    </svg>
  )
}

/** Sanção — check circle */
export function IconCheckCircle({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  )
}

/** Diário Oficial — newspaper */
export function IconNewspaper({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M4 22a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v16a2 2 0 0 1-2 2zM4 6v14M18 14h-7M18 10h-7M8 10H7v4h1z" />
    </svg>
  )
}

/** Bullet check (listas) */
export function IconCheck({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** Seta para a direita (CTA / "ver mais") */
export function IconArrow({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** Faísca / destaque (eyebrow) */
export function IconSpark({ className, ...p }: IconProps) {
  return (
    <svg {...base(className)} {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  )
}
