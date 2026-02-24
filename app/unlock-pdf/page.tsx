'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes } from '@/lib/image-utils';
import { createSafePdfBlob, isPdf, getPdfPageCount } from '@/lib/pdf-utils';
import { Download, ArrowRight, Settings2, FileText, Unlock, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      getPdfPageCount(file).then(setPageCount);
    } else {
      setPageCount(0);
    }
  }, [file]);

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(isPdf);
    if (!pdfFile) {
      setError('Please upload a valid PDF file.');
      return;
    }
    setFile(pdfFile);
    setUnlockedBlob(null);
    setError(null);
    setSuccess(false);
    setPassword('');
  };

  const processUnlock = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setUnlockedBlob(null);
    setSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdfDoc;
      
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { password });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.toLowerCase().includes('password')) {
          throw new Error('Incorrect password. Please try again.');
        }
        throw err;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = createSafePdfBlob(pdfBytes);
      setUnlockedBlob(blob);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error unlocking PDF. Ensure the file is valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!unlockedBlob || !file) return;
    const url = URL.createObjectURL(unlockedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unlocked-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Unlock PDF</h1>
        <p className="text-slate-500">Remove passwords and restrictions from your PDF files.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          label="Drag & drop a protected PDF file here"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Unlock Options
              </h2>
              <button 
                onClick={() => { setFile(null); setUnlockedBlob(null); setError(null); setSuccess(false); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change PDF
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter PDF Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    disabled={isProcessing || success}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-slate-50"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-slate-500 mt-2">We do not store your passwords. Everything happens in your browser.</p>
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
                      Unlocking PDF...
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}

              {success && unlockedBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Unlock Successful!</p>
                    <p className="text-xs">Restrictions have been removed. Size: {formatBytes(unlockedBlob.size)}</p>
                  </div>
                </div>
              )}

              {!unlockedBlob ? (
                <button
                  onClick={processUnlock}
                  disabled={isProcessing || !password}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Unlock PDF'}
                  {!isProcessing && <Unlock className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={downloadPdf}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Unlocked PDF
                  </button>
                  <button
                    onClick={() => { setUnlockedBlob(null); setPassword(''); setSuccess(false); }}
                    className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Unlock Another
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-indigo-500" />
              File Info
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 mb-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 truncate max-w-full px-4">{file.name}</h3>
              <p className="text-slate-500">{formatBytes(file.size)} • {pageCount} Pages</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500">
              <p className="font-semibold mb-1 text-slate-700 uppercase tracking-wider">Security:</p>
              <p>Your password is processed locally and never sent to any server. Your privacy is guaranteed.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
