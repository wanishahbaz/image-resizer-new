import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BestOnlineTools',
  description: 'Privacy Policy for BestOnlineTools. Learn how we protect your data and privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>
            At BestOnlineTools, your privacy is our top priority. This Privacy Policy outlines how we handle your information when you use our website and services.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Do Not Collect</h2>
          <p>
            <strong>We do not collect, store, or process your files on our servers.</strong> All file manipulation (resizing, converting, compressing) is performed locally within your web browser using client-side technologies. Your files never leave your device.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Information We May Collect</h2>
          <p>
            We may collect standard, non-personally identifiable information that your browser sends whenever you visit our website. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on the site</li>
            <li>Referring website addresses</li>
          </ul>
          <p>This information is used solely for analytical purposes to improve our website&apos;s performance and user experience.</p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. Cookies</h2>
          <p>
            We may use &quot;cookies&quot; to enhance your experience. You can choose to set your web browser to refuse cookies or to alert you when cookies are being sent. If you do so, note that some parts of the site may not function properly.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. Third-Party Services</h2>
          <p>
            We may use third-party analytics services (such as Google Analytics) to help us understand how users engage with our website. These services may use cookies and similar technologies to collect and analyze information about use of the services and report on activities and trends.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">5. Changes to This Privacy Policy</h2>
          <p>
            We reserve the right to update or change our Privacy Policy at any time. Any changes will be posted on this page with an updated revision date.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via our <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
