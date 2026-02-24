import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | BestOnlineTools',
  description: 'Terms of Service for BestOnlineTools. Read the rules and guidelines for using our website.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>
            Welcome to BestOnlineTools. By accessing or using our website, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Use of Service</h2>
          <p>
            Our tools are provided for personal and commercial use. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the website.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Intellectual Property</h2>
          <p>
            The website and its original content, features, and functionality are owned by BestOnlineTools and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. User Content</h2>
          <p>
            We do not claim ownership of any files you process using our tools. Since all processing happens locally in your browser, your files remain your property and are never uploaded to our servers.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall BestOnlineTools, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us via our <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
