'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes, compressImageToSize } from '@/lib/image-utils';
import { Download, ArrowRight, Settings2, ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [targetKB, setTargetKB] = useState<number>(100);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      setTargetKB(Math.max(10, Math.round(file.size / 1024 / 2)));
    }
  }, [file]);

  const handleDrop = (acceptedFiles: File[]) => {
    const imageFile = acceptedFiles[0];
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setFile(imageFile);
    setCompressedBlob(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setCompressedBlob(null);
    setError(null);
    setSuccess(false);

    try {
      const blob = await compressImageToSize(file, targetKB, setProgress);
      setCompressedBlob(blob);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError('Error compressing image. Please try another file.');
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
        <p className="text-slate-500">Reduce image file size to your exact target KB dynamically.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'image/*': [] }}
          maxFiles={1}
          label="Drag & drop an image here to compress"
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
                    disabled={isProcessing || success}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium disabled:bg-slate-50"
                  />
                  <span className="text-slate-500 font-medium">KB</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Original size: {formatBytes(file.size)}</p>
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
                      Compressing...
                    </span>
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

              {!success ? (
                <button
                  onClick={processImage}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Compress Image'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold">Compression Complete!</p>
                  </div>
                  <button
                    onClick={downloadImage}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
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
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Preview
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 mb-6 text-center">
              {compressedBlob ? (
                <img 
                  src={URL.createObjectURL(compressedBlob)} 
                  alt="Compressed Preview" 
                  className="max-w-full max-h-[300px] rounded-lg shadow-sm"
                />
              ) : (
                <div className="space-y-4 opacity-50">
                  <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500">Ready to compress</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 mb-1 text-xs uppercase tracking-wider">Original</p>
                <p>{formatBytes(file.size)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <p className="font-medium text-slate-900 mb-1 text-xs uppercase tracking-wider">Compressed</p>
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
