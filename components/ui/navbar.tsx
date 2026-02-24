import Link from 'next/link';
import { Settings2 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">BestOnlineTools</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/image-resizer" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Resizer</Link>
            <Link href="/image-converter" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Converter</Link>
            <Link href="/image-compressor" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Compressor</Link>
            <Link href="/image-to-pdf" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">To PDF</Link>
            <Link href="/pdf-compressor" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">PDF Compressor</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
