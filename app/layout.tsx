import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartProvider } from '@/components/CartContext';
import { I18nProvider } from '@/components/I18nContext';
import { AuthProvider } from '@/components/AuthContext';
import LanguageHandler from '@/components/LanguageHandler';

export const metadata: Metadata = {
  title: {
    default: 'Lillistyle | Mode Élégante pour Femme, Homme & Enfant',
    template: '%s | Lillistyle'
  },
  description: 'Découvrez la collection Lillistyle : vêtements premium et accessoires de mode pour femmes, hommes et enfants. Élégance intemporelle et design contemporain.',
  keywords: ['mode', 'vêtements', 'luxe', 'femme', 'homme', 'enfant', 'accessoires', 'boutique en ligne', 'Lillistyle', 'Tunisie'],
  authors: [{ name: 'Lillistyle' }],
  creator: 'Lillistyle',
  publisher: 'Lillistyle',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Lillistyle | Mode Élégante Femme, Homme & Enfant',
    description: 'Vêtements premium et accessoires de mode. Livraison rapide et service client dédié.',
    url: 'https://lillistyle.com',
    siteName: 'Lillistyle',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lillistyle | Mode Élégante',
    description: 'Le meilleur de la mode pour toute la famille.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from 'react-hot-toast';

import { Playfair_Display, Lato } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <html lang="fr" suppressHydrationWarning className={`${playfair.variable} ${lato.variable}`}>
        <body suppressHydrationWarning>
          <LanguageHandler />
          <AuthProvider>
            <CartProvider>
              <Header />
              <Toaster position="top-center" />
              <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </body>
      </html>
    </I18nProvider>
  );
}
