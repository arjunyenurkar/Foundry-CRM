import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { ToastProvider } from '../components/toast-provider';
import { CRMProvider } from '../components/crm-provider';
import { AppLayout } from '../components/layout/app-layout';

export const metadata: Metadata = {
  title: 'Truform CRM | Enterprise Sales Lifecycle',
  description: 'Enterprise Sales CRM tailored for Truform Techno Products Pvt. Ltd. to manage Prospects, Leads, Enquiries, Technical Evaluations, Quotations, Orders, Dispatches, and Customer Complaints.',
  icons: {
    icon: '/favicon-logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider>
          <ToastProvider>
            <CRMProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </CRMProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
