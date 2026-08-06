import { useState } from 'react';
import Icon from '../components/icons/Icons';

// Import standalone tool components
import QrCodeGenerator from '../components/tools/QrCodeGenerator';
import ColorPaletteGenerator from '../components/tools/ColorPaletteGenerator';
import AspectRatioCalculator from '../components/tools/AspectRatioCalculator';
import BrandCopywriter from '../components/tools/BrandCopywriter';
import ImageBase64Converter from '../components/tools/ImageBase64Converter';
import BarcodeGenerator from '../components/tools/BarcodeGenerator';
import GradientGenerator from '../components/tools/GradientGenerator';
import PassportPhotoMaker from '../components/tools/PassportPhotoMaker';
import RemoveBackgroundAI from '../components/tools/RemoveBackgroundAI';
import FlipbookPdfViewer from '../components/tools/FlipbookPdfViewer';
import InvoiceMaker from '../components/tools/InvoiceMaker';

export default function FreeTools() {
  const [activeTool, setActiveTool] = useState(null); // null, qr, palette, ratio, copywriter, base64, barcode, gradient, passport

  // Tool definitions with metadata
  const tools = [
    {
      id: 'qr',
      name: 'QR Code Generator',
      desc: 'Generate custom QR codes with adjustable quiet zones, background colors, and centered brand logo overlays.',
      icon: 'QrCode',
      badge: 'Active',
      gradient: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'barcode',
      name: 'Barcode Generator',
      desc: 'Create print-ready vector and raster barcodes (CODE128, EAN) for retail products and labels. Download SVG or PNG.',
      icon: 'Barcode',
      badge: 'New',
      gradient: 'from-gray-700 to-gray-900',
    },
    {
      id: 'gradient',
      name: 'Background Gradient',
      desc: 'Design beautiful linear and radial CSS gradients. Add custom color stops, rotate angles, and download vector SVGs or PNGs.',
      icon: 'Gradient',
      badge: 'New',
      gradient: 'from-pink-600 to-rose-600',
    },
    {
      id: 'passport',
      name: 'Passport Photo Maker',
      desc: 'Upload portraits to align, crop, and recolor backgrounds. Export individual images or printable tiled sheet layouts.',
      icon: 'Camera',
      badge: 'New',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'palette',
      name: 'AI Color Palette',
      desc: 'Type any mood or design theme keyword (e.g. vintage neon, soft pastel) to generate a matching HEX color palette.',
      icon: 'Layers',
      badge: 'Active',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'ratio',
      name: 'Aspect Ratio Calculator',
      desc: 'Solve simple math ratios for pixel scaling or print scaling. Perfect for cropping flyers and layouts.',
      icon: 'Grid',
      badge: 'Active',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'copywriter',
      name: 'AI Brand Copywriter',
      desc: 'Simulate high-impact copywriting taglines, flyer catchphrases, and social captions based on tone and industry.',
      icon: 'FileText',
      badge: 'Active',
      gradient: 'from-purple-600 to-violet-600',
    },
    {
      id: 'base64',
      name: 'Image to Base64 Encoder',
      desc: 'Drag and drop design assets to check dimensions, file size, and encode them into HTML tags or Base64 string codes.',
      icon: 'Image',
      badge: 'Active',
      gradient: 'from-red-600 to-orange-600',
    },
    {
      id: 'remove-bg',
      name: 'Remove Background AI',
      desc: 'Isolate subjects and erase image backdrops with smart chroma-keying and manual precision brush overlays.',
      icon: 'Camera',
      badge: 'New',
      gradient: 'from-rose-500 to-red-600',
    },
    {
      id: 'flipbook',
      name: '3D PDF Flipbook',
      desc: 'Upload multi-page brochures or catalogs to view them as an interactive, realistic 3D folding page-flip book.',
      icon: 'Layers',
      badge: 'New',
      gradient: 'from-indigo-500 to-blue-600',
    },
    {
      id: 'invoice',
      name: 'Invoice Maker',
      desc: 'Design customized corporate invoice sheets with dynamic line items, auto subtotal calculation, and high-fidelity PDF download.',
      icon: 'FileText',
      badge: 'New',
      gradient: 'from-emerald-600 to-teal-600',
    },
  ];

  // Render the selected tool component
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'qr':
        return <QrCodeGenerator />;
      case 'barcode':
        return <BarcodeGenerator />;
      case 'gradient':
        return <GradientGenerator />;
      case 'passport':
        return <PassportPhotoMaker />;
      case 'palette':
        return <ColorPaletteGenerator />;
      case 'ratio':
        return <AspectRatioCalculator />;
      case 'copywriter':
        return <BrandCopywriter />;
      case 'base64':
        return <ImageBase64Converter />;
      case 'remove-bg':
        return <RemoveBackgroundAI />;
      case 'flipbook':
        return <FlipbookPdfViewer />;
      case 'invoice':
        return <InvoiceMaker />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 font-outfit">
      <div className="container-custom">
        {activeTool === null ? (
          // GRID DASHBOARD VIEW
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-100">
                <Icon name="Cpu" size={14} className="text-indigo-600 animate-pulse" /> Free Creative Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-3">
                Free <span className="text-gradient">AI & Creative</span> Tools
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Click any tool card below to open its dedicated workspace. Fast, free generators built for Salem design & coding teams.
              </p>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className="group bg-white rounded-2xl border border-gray-150 p-6 text-left shadow-card hover:shadow-card-hover hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    {/* Icon Circle with Gradient */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${tool.gradient} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      <Icon name={tool.icon} size={20} />
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-800 text-base group-hover:text-primary-600 transition-colors">
                        {tool.name}
                      </h3>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        tool.badge === 'New' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                      }`}>
                        {tool.badge}
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-1 text-[10px] font-bold text-primary-600 group-hover:text-primary-700 transition-colors uppercase tracking-wider mt-2">
                    Open Tool <Icon name="ArrowRight" size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // ACTIVE TOOL VIEW (WORKSPACE)
          <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb / Back button */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150">
              <button
                onClick={() => setActiveTool(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-wider bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:shadow"
              >
                <Icon name="ChevronLeft" size={14} /> Back to Tools Hub
              </button>
              <div className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <span>Free Tools Hub</span>
                <Icon name="ChevronRight" size={10} />
                <span className="text-primary-600 font-bold">
                  {tools.find((t) => t.id === activeTool)?.name}
                </span>
              </div>
            </div>

            {/* Mounted Workspace Component */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
              {renderActiveTool()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
