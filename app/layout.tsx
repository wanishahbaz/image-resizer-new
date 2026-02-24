import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/navbar';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BestOnlineTools – Free Image & PDF Tools Online',
  description: 'BestOnlineTools provides free online image resizer, image converter, PDF compressor, image to PDF, and more. 100% secure and browser-based processing.',
  openGraph: {
    title: 'BestOnlineTools – Free Image & PDF Tools Online',
    description: 'BestOnlineTools provides free online image resizer, image converter, PDF compressor, image to PDF, and more. 100% secure and browser-based processing.',
    url: 'https://bestonlinetools.com',
    siteName: 'BestOnlineTools',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BestOnlineTools – Free Image & PDF Tools Online',
    description: 'BestOnlineTools provides free online image resizer, image converter, PDF compressor, image to PDF, and more. 100% secure and browser-based processing.',
  },
  alternates: {
    canonical: 'https://bestonlinetools.com',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-slate-100 border-t border-slate-200 pt-16 pb-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Settings2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900">BestOnlineTools</span>
                </Link>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Fast, secure, and 100% free online tools for image and PDF manipulation. All processing happens locally in your browser to ensure your privacy.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li><Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Home</Link></li>
                  <li><Link href="/#tools" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Tools</Link></li>
                  <li><Link href="/about" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li><Link href="/privacy-policy" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} BestOnlineTools. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
