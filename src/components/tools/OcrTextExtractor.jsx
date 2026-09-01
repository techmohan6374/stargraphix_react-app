import { useState, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

const OCR_API_KEY = 'K88801900488957';

export default function OcrTextExtractor() {
  const [currentFile, setCurrentFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const fakeProgressTimer = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }
    setCurrentFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setExtractedText('');
    setProgress(0);
    setStatusText('');
    setCopied(false);
    toast.success('Image loaded! Click "Extract Text" to scan.');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setCurrentFile(null);
    setPreviewUrl('');
    setExtractedText('');
    setProgress(0);
    setStatusText('');
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const animateProgress = (start) => {
    if (fakeProgressTimer.current) {
      clearInterval(fakeProgressTimer.current);
      fakeProgressTimer.current = null;
    }
    if (!start) return;
    let pct = 0;
    setProgress(0);
    fakeProgressTimer.current = setInterval(() => {
      pct = Math.min(pct + Math.random() * 12, 90);
      setProgress(Math.round(pct));
    }, 200);
  };

  const handleExtractText = async () => {
    if (!currentFile) {
      toast.error('Please upload an image first.');
      return;
    }

    setExtracting(true);
    setStatusText('Analyzing image & reading text...');
    animateProgress(true);

    try {
      const formData = new FormData();
      formData.append('apikey', OCR_API_KEY);
      formData.append('file', currentFile);
      formData.append('language', 'eng');
      formData.append('OCREngine', '2');
      formData.append('scale', 'true');
      formData.append('detectOrientation', 'true');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage ? data.ErrorMessage.join(', ') : 'OCR failed on processing');
      }

      const text = (data.ParsedResults || [])
        .map((r) => r.ParsedText)
        .join('\n')
        .trim();

      if (!text) {
        toast.error('No readable text found in this image.');
        setExtractedText('No text detected in the uploaded image.');
      } else {
        setExtractedText(text);
        toast.success('Text extracted successfully!');
      }

      setProgress(100);
      setStatusText('Extraction Complete');
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error(err.message || 'Could not read text from image.');
      setStatusText('Error extracting text');
    } finally {
      animateProgress(false);
      setExtracting(false);
    }
  };

  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = extractedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    toast.success('Copied text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const element = document.createElement('a');
    const file = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `extracted_text_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded text file!');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-outfit">
      {/* Tool Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon name="FileText" size={24} className="text-primary-600" /> Image Text Extractor (OCR)
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Upload any image with printed or typed text to instantly extract, edit, and copy the text.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          isDragging
            ? 'border-primary-600 bg-primary-50/20 scale-[1.01]'
            : 'border-gray-250 hover:border-primary-600 bg-gray-50/50 hover:bg-white'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
          <Icon name="Image" size={24} />
        </div>
        <p className="text-sm font-bold text-gray-800">Drag & Drop Image Here or Click to Browse</p>
        <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, JPEG, WEBP, BMP (Max 5MB)</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Loaded Image & Controls */}
      {previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 border border-gray-150 rounded-2xl bg-white shadow-xs animate-fade-in">
          {/* Image Thumbnail */}
          <div className="md:col-span-4 flex flex-col items-center justify-center bg-gray-900 rounded-xl p-3 border border-gray-200 relative min-h-[200px]">
            <img src={previewUrl} alt="OCR Target" className="max-h-56 max-w-full rounded shadow-md object-contain" />
            <span className="mt-2 text-[11px] font-semibold text-gray-300 truncate max-w-[200px]">
              {currentFile?.name} ({(currentFile?.size / 1024).toFixed(1)} KB)
            </span>
          </div>

          {/* Extractor Controls & Output */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExtractText}
                    disabled={extracting}
                    className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 font-bold shadow-md hover:shadow-none"
                  >
                    {extracting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Extracting Text...
                      </>
                    ) : (
                      <>
                        <Icon name="Zap" size={15} /> Extract Text (OCR)
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={extracting}
                    className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Icon name="Trash" size={14} /> Clear
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {(extracting || progress > 0) && (
                <div className="space-y-1.5 mb-4 animate-fade-in">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>{statusText || 'Processing...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Extracted Text Output</label>
                  <span className="text-xs text-gray-400 font-medium">
                    {extractedText.length} {extractedText.length === 1 ? 'character' : 'characters'}
                  </span>
                </div>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here after clicking 'Extract Text'..."
                  rows={6}
                  className="w-full input-field font-mono text-xs text-gray-800 leading-relaxed bg-gray-50/50 resize-y p-3.5 border border-gray-200 focus:border-primary-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Action Buttons for Extracted Text */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleCopyText}
                disabled={!extractedText}
                className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                  copied
                    ? 'bg-green-600 text-white'
                    : extractedText
                    ? 'bg-gray-900 hover:bg-black text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon name={copied ? 'Check' : 'FileText'} size={15} />
                {copied ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>

              <button
                onClick={handleDownloadTxt}
                disabled={!extractedText}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-gray-200 transition-all ${
                  extractedText
                    ? 'bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon name="Download" size={15} /> Download .TXT File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
