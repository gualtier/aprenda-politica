/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'www.camara.leg.br' },
      { protocol: 'https', hostname: 'www.senado.leg.br' },
      { protocol: 'http', hostname: 'www.senado.leg.br' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

export default nextConfig
