import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | BestOnlineTools',
  description: 'Learn more about BestOnlineTools and our mission to provide free, secure, and fast online tools.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About BestOnlineTools</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p className="text-lg leading-relaxed">
            Welcome to BestOnlineTools, your trusted destination for fast, secure, and completely free online utilities. Our mission is to simplify your digital workflow by providing intuitive tools that just work.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Our Philosophy</h2>
          <p>
            We believe that basic file manipulation should be accessible to everyone without paywalls, subscriptions, or compromising privacy. That&apos;s why we built BestOnlineTools with a privacy-first approach.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Privacy First</h2>
          <p>
            Unlike many other online tools, <strong>we never upload your files to our servers</strong>. All processing&mdash;whether it&apos;s resizing an image, converting formats, or compressing a PDF&mdash;happens entirely within your web browser. This means your sensitive documents and personal photos remain strictly on your device.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>100% Free:</strong> No hidden costs, no premium tiers.</li>
            <li><strong>Secure:</strong> Client-side processing ensures your data never leaves your device.</li>
            <li><strong>Fast:</strong> Leveraging modern browser capabilities for instant results.</li>
            <li><strong>No Registration:</strong> Start using our tools immediately without creating an account.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact Us</h2>
          <p>
            Have a suggestion, found a bug, or just want to say hi? We&apos;d love to hear from you. Visit our <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a> to get in touch.
          </p>
        </div>
      </div>
    </div>
  );
}
