export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatMandate(start: string | null, end: string | null): string {
  if (!start) return ''
  const startYear = parseInt(start.split('-')[0], 10)
  const endYear = end ? parseInt(end.split('-')[0], 10) : 'presente'
  return `${startYear}–${endYear}`
}
