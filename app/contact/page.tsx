'use client';

import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">Contact Us</h1>
        <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
          Have a question, feedback, or need support? We&apos;re here to help. Reach out to us using the information below.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Get in Touch</h2>
            
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Email Us</h3>
                <p className="text-slate-600 mb-2">For general inquiries and support.</p>
                <a href="mailto:support@bestonlinetools.com" className="text-indigo-600 hover:underline font-medium">
                  support@bestonlinetools.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Location</h3>
                <p className="text-slate-600">
                  San Francisco, CA<br />
                  United States
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Call Us</h3>
                <p className="text-slate-600 mb-2">Mon-Fri from 9am to 5pm PST.</p>
                <a href="tel:+15551234567" className="text-indigo-600 hover:underline font-medium">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form (Placeholder) */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="button"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                onClick={() => alert('This is a demo form. In a real app, this would send an email.')}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
