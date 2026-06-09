/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'www.camara.leg.br' },
      { protocol: 'https', hostname: 'www.senado.leg.br' },
      { protocol: 'http', hostname: 'www.senado.leg.br' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'objectstorage.sa-saopaulo-1.oraclecloud.com' },
    ],
  },
  async redirects() {
    return [
      // Canônico sem www — redireciona www → apex (301)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.aprendapolitica.com.br' }],
        destination: 'https://aprendapolitica.com.br/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
