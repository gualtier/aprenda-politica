/** URL canônica do site (override por env quando o domínio mudar). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aprendapolitica.com.br').replace(/\/$/, '')
export const SITE_NAME = 'Aprenda Política'
