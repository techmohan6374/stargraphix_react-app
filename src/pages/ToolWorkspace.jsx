import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';

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

export const TOOLS_LIST = [
  { id: 'qr', name: 'QR Code Generator', icon: 'QrCode' },
  { id: 'barcode', name: 'Barcode Generator', icon: 'Barcode' },
  { id: 'gradient', name: 'Background Gradient', icon: 'Gradient' },
  { id: 'passport', name: 'Passport Photo Maker', icon: 'Camera' },
  { id: 'palette', name: 'AI Color Palette', icon: 'Layers' },
  { id: 'ratio', name: 'Aspect Ratio Calculator', icon: 'Grid' },
  { id: 'copywriter', name: 'AI Brand Copywriter', icon: 'FileText' },
  { id: 'base64', name: 'Image to Base64 Encoder', icon: 'Image' },
  { id: 'remove-bg', name: 'Remove Background AI', icon: 'Camera' },
  { id: 'flipbook', name: '3D PDF Flipbook', icon: 'Layers' },
  { id: 'invoice', name: 'Invoice Maker', icon: 'FileText' },
];

export default function ToolWorkspace() {
  const { toolId } = useParams();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Enforce Google Auth login check
  useEffect(() => {
    if (!isLoggedIn || !user) {
      toast.error('Please sign in with Google Auth to access AI & Creative Tools!', {
        duration: 4000,
      });
      navigate('/userlogin');
    }
  }, [isLoggedIn, user, navigate]);

  const tool = TOOLS_LIST.find((t) => t.id === toolId);

  const renderToolComponent = () => {
    switch (toolId) {
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
        return (
          <div className="text-center py-16">
            <Icon name="AlertCircle" size={48} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-bold text-gray-800">Tool Not Found</h2>
            <p className="text-xs text-gray-400 mt-1 mb-4">The tool you requested doesn't exist.</p>
            <Link to="/free-tools" className="btn-primary py-2 px-4 text-xs font-bold">
              Back to Tools Hub
            </Link>
          </div>
        );
    }
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-outfit">
      {/* Workspace Top Header Bar - NO main site header/announcement bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <Link
          to="/free-tools"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-primary-600 transition-colors uppercase tracking-wider bg-gray-100 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 px-4 py-2.5 rounded-xl shadow-xs"
        >
          <Icon name="ChevronLeft" size={16} /> Back to Tools Hub
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Active AI Tool:</span>
          <span className="text-xs sm:text-sm font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 flex items-center gap-1.5">
            <Icon name={tool?.icon || 'Cpu'} size={14} className="text-primary-600" />
            {tool?.name || 'Creative Tool'}
          </span>
        </div>
      </header>

      {/* Main Tool Content Container */}
      <main className="flex-1 container-custom py-6 sm:py-8">
        <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-card">
          {renderToolComponent()}
        </div>
      </main>
    </div>
  );
}
