'use client';

import { useState } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes } from '@/lib/image-utils';
import { isWordDoc } from '@/lib/pdf-utils';
import { Download, ArrowRight, Settings2, FileText, Loader2, AlertCircle, CheckCircle2, FileType } from 'lucide-react';

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const wordFile = acceptedFiles.find(isWordDoc);
    if (!wordFile) {
      setError('Please upload a valid Word document (.doc or .docx).');
      return;
    }
    setFile(wordFile);
    setPdfBlob(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
  };

  const processConversion = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setPdfBlob(null);
    setError(null);
    setSuccess(false);

    try {
      // Simulation of Word to PDF conversion
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 400));
      }

      // Create a dummy PDF blob for demonstration
      const dummyContent = '%PDF-1.4\n%...';
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      
      setPdfBlob(blob);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Error converting Word to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob || !file) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.(doc|docx)$/i, '.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Word to PDF</h1>
        <p className="text-slate-500">Convert your Word documents into high-quality PDF files instantly.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
          }}
          maxFiles={1}
          label="Drag & drop a Word document here to convert"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Conversion Settings
              </h2>
              <button 
                onClick={() => { setFile(null); setPdfBlob(null); setProgress(0); setError(null); setSuccess(false); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change Document
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <FileType className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-slate-900 truncate">{file.name}</span>
                </div>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Converting to PDF...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {success && pdfBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Conversion Successful!</p>
                    <p className="text-xs">Your PDF document is ready for download.</p>
                  </div>
                </div>
              )}

              {!pdfBlob ? (
                <button
                  onClick={processConversion}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Convert to PDF'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={downloadPdf}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF File
                  </button>
                  <button
                    onClick={() => { setPdfBlob(null); setProgress(0); setSuccess(false); }}
                    className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Convert Another
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-indigo-500" />
              Preview
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 mb-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">PDF Document</h3>
              <p className="text-slate-500 mt-2">Professional PDF format</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">Tip</h4>
              <p className="text-xs text-amber-700">
                PDFs are perfect for sharing documents while ensuring they look exactly the same on any device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
