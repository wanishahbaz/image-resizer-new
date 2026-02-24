'use client';

import { useState } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes } from '@/lib/image-utils';
import { createSafePdfBlob, isPdf } from '@/lib/pdf-utils';
import { Download, ArrowRight, Settings2, FileText, Trash2, GripVertical, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(isPdf);
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Some files were skipped because they are not valid PDFs.');
    } else {
      setError(null);
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
    setMergedBlob(null);
    setSuccess(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
    setSuccess(false);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);
    setFiles(updatedFiles);
    setMergedBlob(null);
    setSuccess(false);
  };

  const processMerge = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 PDF files to merge.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setMergedBlob(null);
    setSuccess(false);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = createSafePdfBlob(pdfBytes);
      setMergedBlob(blob);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Error merging PDFs. One or more files might be corrupted or password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Merge PDF</h1>
        <p className="text-slate-500">Combine multiple PDF files into a single document in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Dropzone
            onDrop={handleDrop}
            accept={{ 'application/pdf': ['.pdf'] }}
            label="Drag & drop PDF files here to merge"
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {files.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Files to Merge ({files.length})</h3>
                <span className="text-sm text-slate-500">Total: {formatBytes(totalSize)}</span>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {files.map((file, idx) => (
                  <li key={`${file.name}-${idx}`} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => idx > 0 && moveFile(idx, idx - 1)}
                          className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                          disabled={idx === 0 || isProcessing}
                        >
                          <GripVertical className="w-4 h-4 rotate-90" />
                        </button>
                        <button 
                          onClick={() => idx < files.length - 1 && moveFile(idx, idx + 1)}
                          className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                          disabled={idx === files.length - 1 || isProcessing}
                        >
                          <GripVertical className="w-4 h-4 rotate-90" />
                        </button>
                      </div>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      disabled={isProcessing}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">Merge Options</h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 mb-2">Files will be merged in the order shown in the list.</p>
                <p className="text-xs text-slate-400 italic">Use the arrows to reorder files.</p>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Merging files...
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}

              {success && mergedBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Merge Successful!</p>
                    <p className="text-xs">Final size: {formatBytes(mergedBlob.size)}</p>
                  </div>
                </div>
              )}

              {!mergedBlob ? (
                <button
                  onClick={processMerge}
                  disabled={isProcessing || files.length < 2}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Merge PDFs'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={downloadPdf}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Merged PDF
                  </button>
                  <button
                    onClick={() => { setMergedBlob(null); setFiles([]); setSuccess(false); }}
                    className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
