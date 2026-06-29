import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import { AuthProviderWrapper } from '@/components/auth/AuthProviderWrapper';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fluxy — Gestão moderna para negócios digitais',
  description: 'Fluxy é uma plataforma de gestão para clientes, entregas, financeiro e portfólio.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}