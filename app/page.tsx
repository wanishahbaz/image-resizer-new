import Link from 'next/link';
import { Maximize, RefreshCw, Minimize2, FileImage, FileDown, Star, Zap, ShieldCheck } from 'lucide-react';

const tools = [
  {
    title: 'Image Resizer',
    description: 'Resize images by dimensions or percentage. Maintain aspect ratio easily.',
    icon: Maximize,
    href: '/image-resizer',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    title: 'Image Converter',
    description: 'Convert images between JPG, PNG, WEBP, and more instantly.',
    icon: RefreshCw,
    href: '/image-converter',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Image Compressor',
    description: 'Compress images to an exact target KB size without losing quality.',
    icon: Minimize2,
    href: '/image-compressor',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    title: 'Image to PDF',
    description: 'Merge multiple images into a single PDF with exact file size control.',
    icon: FileImage,
    href: '/image-to-pdf',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    title: 'PDF Compressor',
    description: 'Reduce PDF file size to your exact target KB dynamically.',
    icon: FileDown,
    href: '/pdf-compressor',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white overflow-hidden py-24">
        {/* Radial blur background effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Free Online Tools
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-8">
            Fast, secure, and completely free. All processing happens locally in your browser, meaning your files are never uploaded to any server.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link 
              href="#tools"
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Start Using Tools
            </Link>
          </div>
          <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Fast, secure, and 100% free. All processing happens locally in your browser.
          </p>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group relative bg-white rounded-2xl shadow-md p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100"
                >
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl ${tool.bg} ${tool.color} mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
              <div className="inline-flex items-center justify-center p-4 bg-amber-100 text-amber-500 rounded-full mb-4">
                <Star className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">10,000+ Happy Users</h4>
              <p className="text-slate-500">Trusted by thousands of users daily for their file manipulation needs.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
              <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-500 rounded-full mb-4">
                <Zap className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">100% Free Forever</h4>
              <p className="text-slate-500">No hidden fees, no subscriptions, and no premium tiers. Just free tools.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-500 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">No File Upload Required</h4>
              <p className="text-slate-500">Your files never leave your device. All processing is done securely in your browser.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
