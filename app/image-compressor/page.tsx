'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes, compressImageToSize } from '@/lib/image-utils';
import { Download, ArrowRight, Settings2, Image as ImageIcon } from 'lucide-react';

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [targetKB, setTargetKB] = useState<number>(500);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTargetKB(Math.max(10, Math.round(file.size / 1024 / 2))); // Default to half size
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const blob = await compressImageToSize(file, targetKB, setProgress);
      setCompressedBlob(blob);
    } catch (err) {
      console.error(err);
      alert('Error compressing image');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Image Compressor</h1>
        <p className="text-slate-500">Compress images to an exact target KB size without losing unnecessary quality.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={(files) => setFile(files[0])}
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          maxFiles={1}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Compression Settings
              </h2>
              <button 
                onClick={() => { setFile(null); setCompressedBlob(null); setProgress(0); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change Image
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Size (KB)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={targetKB}
                    onChange={(e) => setTargetKB(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium"
                  />
                  <span className="text-slate-500 font-medium">KB</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Original size: {formatBytes(file.size)}
                </p>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Compressing...</span>
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

              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : 'Compress Image'}
                {!isProcessing && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Preview
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6 overflow-hidden">
              {previewUrl && (
                <img 
                  src={compressedBlob ? URL.createObjectURL(compressedBlob) : previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-[300px] object-contain rounded-lg shadow-sm"
                />
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

            {compressedBlob && (
              <button
                onClick={downloadImage}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Compressed Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
