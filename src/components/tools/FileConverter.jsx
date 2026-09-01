import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function FileConverter() {
  const [activeTab, setActiveTab] = useState('image-to-image'); // 'image-to-image', 'image-to-pdf', 'video-to-audio'
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [pdfMargin, setPdfMargin] = useState('fit'); // 'fit', 'a4'

  const fileInputRef = useRef(null);

  // Tab configurations
  const tabs = [
    { id: 'image-to-image', label: 'Images to Images', icon: 'Image', desc: 'Convert between PNG, JPG, WebP, and BMP' },
    { id: 'image-to-pdf', label: 'Images to PDF', icon: 'FileText', desc: 'Combine multiple images into a PDF document' },
    { id: 'video-to-audio', label: 'Video to Audio', icon: 'Zap', desc: 'Extract WAV audio track from MP4/WebM/MOV' },
  ];

  // Image output options
  const imageFormats = [
    { label: 'JPG / JPEG (.jpg)', mime: 'image/jpeg', ext: 'jpg' },
    { label: 'PNG (.png)', mime: 'image/png', ext: 'png' },
    { label: 'WebP (.webp)', mime: 'image/webp', ext: 'webp' },
    { label: 'BMP (.bmp)', mime: 'image/bmp', ext: 'bmp' },
  ];

  // Handle File Upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (!uploadedFiles.length) return;

    // Filter based on active tab
    let validFiles = [];
    if (activeTab === 'image-to-image' || activeTab === 'image-to-pdf') {
      validFiles = uploadedFiles.filter((f) => f.type.startsWith('image/'));
      if (validFiles.length < uploadedFiles.length) {
        toast.error('Some non-image files were skipped.');
      }
    } else if (activeTab === 'video-to-audio') {
      validFiles = uploadedFiles.filter((f) => f.type.startsWith('video/'));
      if (validFiles.length < uploadedFiles.length) {
        toast.error('Please upload valid video files (MP4, WebM, MOV).');
      }
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setConvertedFiles([]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) {
      handleFileUpload({ target: { files: dropped } });
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setConvertedFiles([]);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    setProgress(0);
  };

  // Format File Size
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 1. CONVERT IMAGES TO IMAGES
  const convertImagesToImages = async () => {
    if (!files.length) return;
    setIsConverting(true);
    setProgress(0);
    const results = [];

    const selectedOpt = imageFormats.find((f) => f.mime === targetFormat) || imageFormats[0];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Fill white background for JPG conversion if image has transparency
        if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const convertedBlob = await new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            targetFormat,
            quality
          );
        });

        const newName = file.name.substring(0, file.name.lastIndexOf('.')) + `.${selectedOpt.ext}`;
        const url = URL.createObjectURL(convertedBlob);

        results.push({
          originalName: file.name,
          name: newName,
          size: convertedBlob.size,
          url,
          blob: convertedBlob,
          type: selectedOpt.mime
        });
      } catch (err) {
        console.error(`Failed to convert ${file.name}:`, err);
        toast.error(`Failed to convert ${file.name}`);
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setConvertedFiles(results);
    setIsConverting(false);
    toast.success(`Converted ${results.length} image(s) to ${selectedOpt.ext.toUpperCase()}!`);
  };

  // 2. CONVERT IMAGES TO PDF
  const convertImagesToPdf = async () => {
    if (!files.length) return;
    setIsConverting(true);
    setProgress(0);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);

        if (i > 0) {
          doc.addPage();
        }

        // Calculate aspect ratio fit to page
        let imgWidth = img.width;
        let imgHeight = img.height;

        if (pdfMargin === 'a4') {
          const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
          imgWidth = imgWidth * ratio;
          imgHeight = imgHeight * ratio;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          doc.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
        } else {
          // Fit whole image
          doc.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const resultName = files.length === 1 
        ? files[0].name.substring(0, files[0].name.lastIndexOf('.')) + '.pdf'
        : `combined_images_${Date.now()}.pdf`;

      setConvertedFiles([{
        originalName: `${files.length} images combined`,
        name: resultName,
        size: pdfBlob.size,
        url: pdfUrl,
        blob: pdfBlob,
        type: 'application/pdf'
      }]);

      toast.success('Generated PDF from images!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF document');
    } finally {
      setIsConverting(false);
    }
  };

  // 3. CONVERT VIDEO TO AUDIO (WAV Extraction via Web Audio API)
  const convertVideoToAudio = async () => {
    if (!files.length) return;
    setIsConverting(true);
    setProgress(10);
    const results = [];

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      toast.error('Web Audio API is not supported in your browser.');
      setIsConverting(false);
      return;
    }

    const audioCtx = new AudioContextClass();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.arrayBuffer();
        setProgress(40);
        
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        setProgress(70);

        const wavBlob = audioBufferToWav(audioBuffer);
        const wavUrl = URL.createObjectURL(wavBlob);
        const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.wav';

        results.push({
          originalName: file.name,
          name: newName,
          size: wavBlob.size,
          url: wavUrl,
          blob: wavBlob,
          type: 'audio/wav',
          duration: Math.round(audioBuffer.duration)
        });
      } catch (err) {
        console.error(`Failed to extract audio from ${file.name}:`, err);
        toast.error(`Could not extract audio from ${file.name}`);
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setConvertedFiles(results);
    setIsConverting(false);
    toast.success(`Extracted audio from ${results.length} video(s)!`);
  };

  // AudioBuffer to WAV encoder
  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    let interleaved;
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      interleaved = new Float32Array(left.length + right.length);
      for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
        interleaved[dst] = left[src];
        interleaved[dst + 1] = right[src];
      }
    } else {
      interleaved = buffer.getChannelData(0);
    }

    const dataLength = interleaved.length * (bitDepth / 8);
    const bufferHeader = new ArrayBuffer(44 + dataLength);
    const view = new DataView(bufferHeader);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Helper promises
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Single download trigger
  const handleDownloadSingle = (converted) => {
    const a = document.createElement('a');
    a.href = converted.url;
    a.download = converted.name;
    a.click();
  };

  return (
    <div className="space-y-6 text-left font-outfit">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            <Icon name="Cpu" size={22} />
          </span>
          Universal File Converter
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Fast client-side file converter: convert images between formats, merge photos into PDF, or extract audio from videos.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              clearAll();
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeTab === tab.id
                ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon name={tab.icon} size={18} />
              </span>
              <span className={`text-sm font-bold ${activeTab === tab.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                {tab.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-tight">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-250 hover:border-indigo-600 rounded-3xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-indigo-50/20 flex flex-col items-center justify-center min-h-[180px] group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-indigo-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform mb-2">
          <Icon name="Upload" size={24} />
        </div>
        <p className="text-sm font-bold text-gray-700">
          {activeTab === 'video-to-audio' ? 'Upload Video File(s)' : 'Upload Image File(s)'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {activeTab === 'video-to-audio'
            ? 'Supports MP4, WebM, MOV, AVI videos'
            : 'Supports PNG, JPG, WebP, BMP images'}
        </p>
        <button className="btn-primary mt-3 text-xs py-2 px-4 pointer-events-none">
          Browse Files
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept={activeTab === 'video-to-audio' ? 'video/*' : 'image/*'}
          className="hidden"
        />
      </div>

      {/* File List & Format Options */}
      {files.length > 0 && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Output Format Controls */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex flex-wrap items-center justify-between gap-4">
            
            {activeTab === 'image-to-image' && (
              <>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Target Format:
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:border-indigo-600 outline-none shadow-xs"
                  >
                    {imageFormats.map((fmt) => (
                      <option key={fmt.mime} value={fmt.mime}>
                        {fmt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-600">Quality:</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-24 accent-indigo-600 h-1 bg-gray-250 cursor-pointer rounded"
                    />
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                )}
              </>
            )}

            {activeTab === 'image-to-pdf' && (
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Page Layout:
                </label>
                <select
                  value={pdfMargin}
                  onChange={(e) => setPdfMargin(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:border-indigo-600 outline-none shadow-xs"
                >
                  <option value="fit">Full Page Stretch Fit</option>
                  <option value="a4">Proportional A4 Centered Fit</option>
                </select>
              </div>
            )}

            {activeTab === 'video-to-audio' && (
              <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <Icon name="Zap" size={14} /> Output Audio Format: WAV Uncompressed 16-bit
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 bg-white"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Uploaded Files Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Selected Files ({files.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(idx)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Remove file"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar during conversion */}
          {isConverting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-indigo-700">
                <span>Converting files...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Conversion Trigger */}
          <button
            onClick={() => {
              if (activeTab === 'image-to-image') convertImagesToImages();
              else if (activeTab === 'image-to-pdf') convertImagesToPdf();
              else if (activeTab === 'video-to-audio') convertVideoToAudio();
            }}
            disabled={isConverting}
            className="w-full btn-primary py-3.5 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md"
          >
            {isConverting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Icon name="Refresh" size={16} /> Convert {files.length} File(s) Now
              </>
            )}
          </button>
        </div>
      )}

      {/* Converted Output Files Panel */}
      {convertedFiles.length > 0 && (
        <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-3xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <Icon name="CheckCircle" size={16} className="text-emerald-600" />
              Conversion Complete ({convertedFiles.length} File(s))
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {convertedFiles.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="overflow-hidden space-y-0.5">
                  <p className="text-xs font-bold text-gray-800 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Format: <span className="font-mono text-emerald-700 uppercase font-bold">{item.type}</span> • Size: {formatBytes(item.size)}
                    {item.duration ? ` • Duration: ${item.duration}s` : ''}
                  </p>

                  {/* Audio Preview Player for Video-to-Audio */}
                  {item.type.startsWith('audio/') && (
                    <audio controls src={item.url} className="w-full mt-2 h-8" />
                  )}
                </div>

                <button
                  onClick={() => handleDownloadSingle(item)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <Icon name="Download" size={14} /> Download File
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
