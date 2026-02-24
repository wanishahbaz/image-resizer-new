'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes, compressImageToSize } from '@/lib/image-utils';
import { isPdf, getPdfPageCount } from '@/lib/pdf-utils';
import { Download, ArrowRight, Settings2, FileDown, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [targetKB, setTargetKB] = useState<number>(500);
  
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      setTargetKB(Math.max(10, Math.round(file.size / 1024 / 2)));
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
    setCompressedBlob(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
  };

  const processPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setCompressedBlob(null);
    setError(null);
    setSuccess(false);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;

      const newPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const targetImageBytes = (targetKB * 1024 * 0.95) / numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        const pageBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/jpeg', 1.0);
        });

        const compressedPageBlob = await compressImageToSize(pageBlob, targetImageBytes / 1024, (p) => {
          setProgress((((pageNum - 1) * 100) + p) / numPages);
        });

        if (pageNum > 1) newPdf.addPage();

        const pdfWidth = newPdf.internal.pageSize.getWidth();
        const pdfHeight = newPdf.internal.pageSize.getHeight();
        
        const imgRatio = canvas.width / canvas.height;
        const pdfRatio = pdfWidth / pdfHeight;

        let renderWidth = pdfWidth;
        let renderHeight = pdfHeight;

        if (imgRatio > pdfRatio) {
          renderHeight = pdfWidth / imgRatio;
        } else {
          renderWidth = pdfHeight * imgRatio;
        }

        const x = (pdfWidth - renderWidth) / 2;
        const y = (pdfHeight - renderHeight) / 2;

        const base64data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedPageBlob);
        });

        newPdf.addImage(base64data, 'JPEG', x, y, renderWidth, renderHeight);
      }

      const pdfOutput = newPdf.output('blob');
      setCompressedBlob(pdfOutput);
      setProgress(100);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError('Error compressing PDF. Please ensure the file is valid and not password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!compressedBlob || !file) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">PDF Compressor</h1>
        <p className="text-slate-500">Reduce PDF file size to your exact target KB dynamically.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          label="Drag & drop a PDF file here to compress"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Compression Settings
              </h2>
              <button 
                onClick={() => { setFile(null); setCompressedBlob(null); setProgress(0); setError(null); setSuccess(false); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change PDF
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Size (KB)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="10"
                    value={targetKB}
                    onChange={(e) => setTargetKB(Number(e.target.value))}
                    disabled={isProcessing || success}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium disabled:bg-slate-50"
                  />
                  <span className="text-slate-500 font-medium">KB</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Original size: {formatBytes(file.size)} • {pageCount} Pages
                </p>
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
                      Compressing PDF...
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2">This may take a moment for large PDFs.</p>
                </div>
              )}

              {!success ? (
                <button
                  onClick={processPdf}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Compress PDF'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold">Compression Complete!</p>
                  </div>
                  <button
                    onClick={downloadPdf}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Compressed PDF
                  </button>
                  <button
                    onClick={() => { setCompressedBlob(null); setProgress(0); setSuccess(false); }}
                    className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Compress Again
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <FileDown className="w-5 h-5 text-indigo-500" />
              Result
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 mb-6 text-center">
              {compressedBlob ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileDown className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Ready for Download</h3>
                  <p className="text-slate-500">Your PDF has been successfully compressed.</p>
                </div>
              ) : (
                <div className="space-y-4 opacity-50">
                  <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileDown className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500">Ready to compress</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 mb-1">Original</p>
                <p>{formatBytes(file.size)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <p className="font-medium text-slate-900 mb-1">Compressed</p>
                <p className={compressedBlob ? (compressedBlob.size > targetKB * 1024 * 1.1 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold') : ''}>
                  {compressedBlob ? formatBytes(compressedBlob.size) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
