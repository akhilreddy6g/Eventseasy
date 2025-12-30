import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/query-provider";
import StoreProvider from './StoreProvider';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Eventseasy - Modern Event Management Platform',
  description: 'Seamlessly manage events, collaborate with teams, and create memorable experiences with Eventseasy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}> 
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
           <QueryProvider>
             <StoreProvider>
              {children}
            </StoreProvider>
            </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}