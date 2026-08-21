import { useState } from 'react';
import Icon from '../icons/Icons';

export default function ImageMagnifier({
  src,
  alt = '',
  zoomLevel = 2.5,
  magnifierHeight = 160,
  magnifierWidth = 160,
  className = '',
}) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

  const handleMouseEnter = (e) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setSize([width, height]);
    setShowMagnifier(true);
  };

  const handleMouseMove = (e) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // Calculate cursor position relative to the image
    const xPos = e.pageX - left - window.scrollX;
    const yPos = e.pageY - top - window.scrollY;
    setXY([xPos, yPos]);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      className={`relative overflow-hidden cursor-crosshair group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-80 md:h-96 object-cover select-none transition-transform duration-300"
      />

      {/* Hover Magnifier Guide Tag */}
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-0 transition-opacity pointer-events-none z-10">
        <Icon name="Search" size={12} className="text-gold-400" />
        <span>Hover to magnify</span>
      </div>

      {/* Magnifier Lens Glass */}
      {showMagnifier && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            // Position lens centered over cursor
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            opacity: '1',
            border: '3px solid white',
            borderRadius: '50%',
            backgroundColor: 'white',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',

            // Calculate zoomed background size & position
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
            backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
            backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 0 15px rgba(0,0,0,0.1)',
            zIndex: 30,
          }}
        />
      )}
    </div>
  );
}
