'use client';

import { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { formatBytes } from '@/lib/image-utils';
import { Download, ArrowRight, Settings2, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/jpeg');
  const [quality, setQuality] = useState<number>(90);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
    setConvertedBlob(null);
    setError(null);
    setSuccess(false);
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
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, targetFormat, quality / 100)
      );
      
      if (blob) {
        setConvertedBlob(blob);
        setSuccess(true);
      } else {
        throw new Error('Failed to create image blob');
      }
    } catch (err) {
      console.error(err);
      setError('Error converting image. The file might be corrupted or unsupported.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedBlob || !file) return;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = targetFormat.split('/')[1];
    a.download = `converted-${file.name.split('.')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Image Converter</h1>
        <p className="text-slate-500">Convert images between JPG, PNG, and WEBP formats instantly.</p>
      </div>

      {!file ? (
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'] }}
          maxFiles={1}
          label="Drag & drop an image here to convert"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Conversion Settings
              </h2>
              <button 
                onClick={() => { setFile(null); setConvertedBlob(null); setError(null); setSuccess(false); }}
                className="text-sm text-slate-500 hover:text-indigo-600"
              >
                Change Image
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['image/jpeg', 'image/png', 'image/webp'] as TargetFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
                        targetFormat === fmt
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {fmt.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {targetFormat !== 'image/png' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Quality</label>
                    <span className="text-sm text-slate-500">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
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
                  <span>Converting...</span>
                </div>
              )}

              {success && convertedBlob && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold">Conversion Successful!</p>
                </div>
              )}

              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : 'Convert Image'}
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
                  src={convertedBlob ? URL.createObjectURL(convertedBlob) : previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-[300px] object-contain rounded-lg shadow-sm"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 mb-1">Original ({file.type.split('/')[1].toUpperCase()})</p>
                <p>{formatBytes(file.size)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <p className="font-medium text-slate-900 mb-1">Converted ({targetFormat.split('/')[1].toUpperCase()})</p>
                <p>{convertedBlob ? formatBytes(convertedBlob.size) : '-'}</p>
              </div>
            </div>

            {convertedBlob && (
              <button
                onClick={downloadImage}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Converted Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
