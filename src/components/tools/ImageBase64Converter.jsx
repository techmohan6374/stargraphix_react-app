import { useState, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function ImageBase64Converter() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        setUploadedImage({
          name: file.name,
          size: (file.size / 1024).toFixed(2),
          type: file.type,
          width: img.width,
          height: img.height,
          base64: base64String,
        });
        toast.success('Image analyzed!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon name="Image" size={24} className="text-primary-600" /> Image to Base64 & Analyzer
        </h2>
        <p className="text-xs text-gray-400 mt-1">Convert layouts and assets to inline code blocks easily</p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          isDragging ? 'border-primary-600 bg-primary-50/20' : 'border-gray-250 hover:border-primary-600 bg-gray-50/50 hover:bg-white'
        }`}
      >
        <Icon name="Image" size={40} className={`mb-3 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
        <p className="text-xs font-bold text-gray-700">Drag & Drop Image Here or Click to Browse</p>
        <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPEG, SVG, WebP (Max 2MB)</p>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {uploadedImage && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 border border-gray-150 rounded-2xl bg-white animate-fade-in">
          <div className="md:col-span-3 flex items-center justify-center bg-gray-50 rounded-xl p-2 border border-gray-155">
            <img src={uploadedImage.base64} alt={uploadedImage.name} className="max-h-36 max-w-full rounded shadow-sm object-contain" />
          </div>

          <div className="md:col-span-9 space-y-3.5 text-xs text-gray-600">
            <div>
              <h4 className="font-bold text-gray-800 text-sm truncate">{uploadedImage.name}</h4>
              <div className="flex flex-wrap gap-2.5 mt-1 text-[10px] font-semibold text-gray-500">
                <span>Size: {uploadedImage.size} KB</span>
                <span>•</span>
                <span>Format: {uploadedImage.type}</span>
                <span>•</span>
                <span>Dimensions: {uploadedImage.width} x {uploadedImage.height} px</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uploadedImage.base64);
                  toast.success('Copied Base64 string!');
                }}
                className="btn-primary py-2 text-[10px] rounded-lg shadow-sm hover:shadow-none"
              >
                Copy Base64 Data
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`<img src="${uploadedImage.base64}" alt="${uploadedImage.name}" />`);
                  toast.success('Copied HTML Image Tag!');
                }}
                className="border border-gray-200 bg-white hover:bg-gray-50 py-2 rounded-lg font-bold text-[10px] text-gray-700 transition-all text-center"
              >
                Copy HTML Tag
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`background-image: url('${uploadedImage.base64}');`);
                  toast.success('Copied CSS Rule!');
                }}
                className="border border-gray-200 bg-white hover:bg-gray-50 py-2 rounded-lg font-bold text-[10px] text-gray-700 transition-all text-center"
              >
                Copy CSS Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
