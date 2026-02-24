'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes } from '@/lib/image-utils';
import { Download, ArrowRight, Settings2, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [mode, setMode] = useState<'dimensions' | 'percentage'>('dimensions');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(50);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [originalRatio, setOriginalRatio] = useState<number>(1);
  
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setOriginalRatio(img.width / img.height);
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleDrop = (acceptedFiles: File[]) => {
    const imageFile = acceptedFiles[0];
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setFile(imageFile);
    setResizedBlob(null);
    setError(null);
    setSuccess(false);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainRatio && originalRatio) {
      setHeight(Math.round(val / originalRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainRatio && originalRatio) {
      setWidth(Math.round(val * originalRatio));
    }
  };

  const processImage = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      const canvas = document.createElement('canvas');
      let targetWidth = width;
      let targetHeight = height;

      if (mode === 'percentage') {
        targetWidth = Math.round(img.width * (percentage / 100));
        targetHeight = Math.round(img.height * (percentage / 100));
      }

      if (targetWidth <= 0 || targetHeight <= 0) {
        throw new Error('Invalid dimensions. Width and height must be greater than 0.');
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, file.type, 0.9)
      );
      
      if (blob) {
        setResizedBlob(blob);
        setSuccess(true);
      } else {
        throw new Error('Failed to create image blob');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error resizing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedBlob || !file) return;
    const url = URL.createObjectURL(resizedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resized-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Image Resizer</h1>
        <p className="text-slate-500">Resize images by dimensions or percentage while maintaining aspect ratio.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'] }}
          maxFiles={1}
          label="Drag & drop an image here to resize"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Resize Settings
              </h2>
              <button 
                onClick={() => { setFile(null); setResizedBlob(null); setError(null); setSuccess(false); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change Image
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'dimensions' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setMode('dimensions')}
                >
                  Dimensions
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'percentage' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setMode('percentage')}
                >
                  Percentage
                </button>
              </div>

              {mode === 'dimensions' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintainRatio}
                      onChange={(e) => setMaintainRatio(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600">Maintain aspect ratio</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Scale ({percentage}%)</label>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={percentage}
                      onChange={(e) => setPercentage(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Resizing...</span>
                </div>
              )}

              {success && resizedBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold">Resize Successful!</p>
                </div>
              )}

              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : 'Resize Image'}
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
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={resizedBlob ? URL.createObjectURL(resizedBlob) : previewUrl} 
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
                <p className="font-medium text-slate-900 mb-1">Resized</p>
                <p>{resizedBlob ? formatBytes(resizedBlob.size) : '-'}</p>
              </div>
            </div>

            {resizedBlob && (
              <button
                onClick={downloadImage}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Resized Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
