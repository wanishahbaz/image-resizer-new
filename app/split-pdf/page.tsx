'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes } from '@/lib/image-utils';
import { createSafePdfBlob, isPdf, getPdfPageCount } from '@/lib/pdf-utils';
import { Download, ArrowRight, Settings2, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'range' | 'extract' | 'all'>('all');
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(1);
  const [extractPages, setExtractPages] = useState<string>('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultType, setResultType] = useState<'pdf' | 'zip'>('pdf');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      getPdfPageCount(file).then((count) => {
        setPageCount(count);
        setRangeEnd(count);
      });
    } else {
      setPageCount(0);
      setRangeStart(1);
      setRangeEnd(1);
      setExtractPages('');
    }
  }, [file]);

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(isPdf);
    if (!pdfFile) {
      setError('Please upload a valid PDF file.');
      return;
    }
    setFile(pdfFile);
    setResultBlob(null);
    setError(null);
    setSuccess(false);
  };

  const processSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResultBlob(null);
    setSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      if (splitMode === 'range') {
        const newPdf = await PDFDocument.create();
        const indices = Array.from(
          { length: rangeEnd - rangeStart + 1 }, 
          (_, i) => rangeStart - 1 + i
        );
        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        setResultBlob(createSafePdfBlob(pdfBytes));
        setResultType('pdf');
      } else if (splitMode === 'extract') {
        const pagesToExtract = extractPages
          .split(',')
          .map(p => parseInt(p.trim()))
          .filter(p => !isNaN(p) && p > 0 && p <= pageCount);
        
        if (pagesToExtract.length === 0) {
          throw new Error('Please enter valid page numbers to extract.');
        }

        const newPdf = await PDFDocument.create();
        const indices = pagesToExtract.map(p => p - 1);
        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        setResultBlob(createSafePdfBlob(pdfBytes));
        setResultType('pdf');
      } else if (splitMode === 'all') {
        const zip = new JSZip();
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          zip.file(`page-${i + 1}.pdf`, pdfBytes);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob(zipBlob);
        setResultType('zip');
      }
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error splitting PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultType === 'pdf' ? `split-${file.name}` : `split-${file.name.replace('.pdf', '')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Split PDF</h1>
        <p className="text-slate-500">Extract pages or split your PDF into multiple documents.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          label="Drag & drop a PDF file here to split"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Split Settings
              </h2>
              <button 
                onClick={() => { setFile(null); setResultBlob(null); setError(null); setSuccess(false); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change PDF
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'all'}
                    onChange={() => setSplitMode('all')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Split into individual pages</p>
                    <p className="text-xs text-slate-500">Every page will become a separate PDF file (ZIP output).</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'range'}
                    onChange={() => setSplitMode('range')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Split by range</p>
                    {splitMode === 'range' && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={pageCount}
                          value={rangeStart}
                          onChange={(e) => setRangeStart(Math.max(1, parseInt(e.target.value)))}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="number"
                          min={rangeStart}
                          max={pageCount}
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(Math.min(pageCount, parseInt(e.target.value)))}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'extract'}
                    onChange={() => setSplitMode('extract')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Extract specific pages</p>
                    {splitMode === 'extract' && (
                      <input
                        type="text"
                        placeholder="e.g. 1, 3, 5-7"
                        value={extractPages}
                        onChange={(e) => setExtractPages(e.target.value)}
                        className="mt-2 w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                      />
                    )}
                  </div>
                </label>
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
                      Processing PDF...
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}

              {success && resultBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Split Successful!</p>
                    <p className="text-xs">Result size: {formatBytes(resultBlob.size)}</p>
                  </div>
                </div>
              )}

              {!resultBlob ? (
                <button
                  onClick={processSplit}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Split PDF'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={downloadResult}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download {resultType === 'zip' ? 'ZIP' : 'PDF'}
                  </button>
                  <button
                    onClick={() => { setResultBlob(null); setSuccess(false); }}
                    className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Split Again
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
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 truncate max-w-full px-4">{file.name}</h3>
              <p className="text-slate-500 mt-2">{formatBytes(file.size)} • {pageCount} Pages</p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <h4 className="text-sm font-semibold text-indigo-900 mb-1">Split Summary</h4>
              <p className="text-xs text-indigo-700">
                {splitMode === 'all' && `Every page (${pageCount}) will be extracted as a separate PDF.`}
                {splitMode === 'range' && `Pages ${rangeStart} to ${rangeEnd} will be extracted into a single PDF.`}
                {splitMode === 'extract' && `Selected pages will be extracted into a single PDF.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
