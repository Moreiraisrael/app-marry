import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marry Miele - Estilo',
    short_name: 'Marry Miele',
    description: 'Aplicativo de consultoria de estilo e guarda-roupa virtual por Marry Miele.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#d97706',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
