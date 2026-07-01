import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "ARC-EN-CIEL Affair",
  description: "Ici, tu n'as rien à expliquer.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ARC-EN-CIEL Affair',
    description: "Ici, tu n'as rien à expliquer.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,560;9..144,680&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
