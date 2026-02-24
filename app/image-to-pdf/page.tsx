'use client';

import { useState } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes, compressImageToSize } from '@/lib/image-utils';
import { Download, ArrowRight, Settings2, FileImage, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetKB, setTargetKB] = useState<number>(1000); // 1MB default
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setPdfBlob(null);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);
      const targetImageBytes = targetKB * 1024 * 0.95; // 5% buffer for PDF overhead

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const proportion = file.size / totalOriginalSize;
        const fileTargetKB = Math.max(10, (targetImageBytes * proportion) / 1024);

        const compressedBlob = await compressImageToSize(file, fileTargetKB, (p) => {
          setProgress(((i * 100) + p) / files.length);
        });

        const imgUrl = URL.createObjectURL(compressedBlob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });

        if (i > 0) pdf.addPage();

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgRatio = img.width / img.height;
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

        // Read blob as base64
        const reader = new FileReader();
        const base64data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });

        pdf.addImage(base64data, 'JPEG', x, y, renderWidth, renderHeight);
        URL.revokeObjectURL(imgUrl);
      }

      const pdfOutput = pdf.output('blob');
      setPdfBlob(pdfOutput);
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert('Error creating PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Image to PDF</h1>
        <p className="text-slate-500">Merge multiple images into a single PDF with exact file size control.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Dropzone
            onDrop={handleDrop}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            label="Drag & drop images here to add to PDF"
          />

          {files.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Selected Images ({files.length})</h3>
                <span className="text-sm text-slate-500">Total: {formatBytes(totalSize)}</span>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {files.map((file, idx) => (
                  <li key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden shrink-0">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">PDF Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target PDF Size (KB)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    value={targetKB}
                    onChange={(e) => setTargetKB(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                  />
                  <span className="text-slate-500 font-medium">KB</span>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Generating PDF...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {pdfBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-sm text-emerald-800 font-medium mb-1">PDF Generated Successfully!</p>
                  <p className="text-xs text-emerald-600">Final size: {formatBytes(pdfBlob.size)}</p>
                </div>
              )}

              {!pdfBlob ? (
                <button
                  onClick={processPdf}
                  disabled={isProcessing || files.length === 0}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Generate PDF'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={downloadPdf}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => { setPdfBlob(null); setFiles([]); setProgress(0); }}
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
