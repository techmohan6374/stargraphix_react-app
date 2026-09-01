import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function FigmaMiniStudio() {
  const [layers, setLayers] = useState([
    {
      id: 'bg-rect',
      name: 'Background Card',
      type: 'rect',
      x: 100,
      y: 80,
      width: 600,
      height: 440,
      rotation: 0,
      fillType: 'gradient-linear',
      fill: '#1E1B4B',
      gradientColor2: '#4338CA',
      gradientAngle: 135,
      stroke: '#6366F1',
      strokeWidth: 2,
      borderRadius: 24,
      opacity: 1,
      shadowBlur: 30,
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowOffsetX: 0,
      shadowOffsetY: 12,
      visible: true,
      locked: false,
    },
    {
      id: 'heading-text',
      name: 'Tamil Heading',
      type: 'text',
      text: 'ஸ்டார் கிராபிக்ஸ் டிஜிட்டல்',
      fontFamily: 'Noto Sans Tamil',
      fontSize: 36,
      fontWeight: '700',
      textAlign: 'center',
      x: 180,
      y: 160,
      width: 440,
      height: 60,
      rotation: 0,
      fillType: 'solid',
      fill: '#FFFFFF',
      opacity: 1,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowOffsetX: 2,
      shadowOffsetY: 4,
      visible: true,
      locked: false,
    },
    {
      id: 'sub-text',
      name: 'Sub Title Text',
      text: 'Premium Vector & Design Studio',
      fontFamily: 'Outfit',
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      x: 220,
      y: 230,
      width: 360,
      height: 40,
      rotation: 0,
      fillType: 'solid',
      fill: '#F472B6',
      opacity: 1,
      shadowBlur: 0,
      visible: true,
      locked: false,
    },
    {
      id: 'badge-circle',
      name: 'PowerClip Badge Frame',
      type: 'circle',
      x: 350,
      y: 310,
      width: 100,
      height: 100,
      rotation: 0,
      fillType: 'solid',
      fill: '#EC4899',
      stroke: '#FFFFFF',
      strokeWidth: 4,
      opacity: 1,
      shadowBlur: 15,
      shadowColor: 'rgba(236, 72, 153, 0.5)',
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      visible: true,
      locked: false,
    }
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState('heading-text');
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'rect', 'circle', 'triangle', 'text'
  const [exportScale, setExportScale] = useState(2); // 1x, 2x, 4x Ultra-HD
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Available Tamil & Modern Web Fonts
  const fontFamilies = [
    { label: 'Noto Sans Tamil (தமிழ்)', family: 'Noto Sans Tamil' },
    { label: 'Catamaran Tamil (தமிழ்)', family: 'Catamaran' },
    { label: 'Baloo Thambi 2 (தமிழ்)', family: 'Baloo Thambi 2' },
    { label: 'Mukta Malar (தமிழ்)', family: 'Mukta Malar' },
    { label: 'Outfit (Modern)', family: 'Outfit' },
    { label: 'Poppins (Sans)', family: 'Poppins' },
    { label: 'Inter (Clean)', family: 'Inter' },
    { label: 'Impact (Display)', family: 'Impact' },
    { label: 'Georgia (Serif)', family: 'Georgia' },
  ];

  // Font Size Preset Table
  const fontSizeTable = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Render Canvas Logic
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fixed 800x600 canvas resolution
    canvas.width = 800;
    canvas.height = 600;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background check pattern for transparency
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Group layers for PowerClip Masking logic
    const topLevelLayers = layers.filter((l) => !l.powerClipParentId);

    topLevelLayers.forEach((layer) => {
      if (!layer.visible) return;
      drawLayer(ctx, layer);

      // Check if any other layer is clipped inside this layer (PowerClip)
      const clippedChildren = layers.filter((c) => c.powerClipParentId === layer.id && c.visible);
      if (clippedChildren.length > 0) {
        ctx.save();
        // Create clipping region from parent shape path
        createShapePath(ctx, layer);
        ctx.clip();

        // Draw clipped children
        clippedChildren.forEach((child) => {
          drawLayer(ctx, child);
        });

        ctx.restore();
      }
    });

    // Draw Selection Handles for active layer
    if (selectedLayer && selectedLayer.visible) {
      drawSelectionBox(ctx, selectedLayer);
    }
  };

  // Shape Path Creator Helper
  const createShapePath = (ctx, layer) => {
    ctx.beginPath();
    const { x, y, width, height, type } = layer;

    if (type === 'circle') {
      const radius = Math.min(width, height) / 2;
      ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
    } else if (type === 'triangle') {
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
    } else {
      // Rectangle / default
      const r = layer.borderRadius || 0;
      if (r > 0) {
        ctx.roundRect(x, y, width, height, r);
      } else {
        ctx.rect(x, y, width, height);
      }
    }
  };

  // Individual Layer Drawer
  const drawLayer = (ctx, layer) => {
    ctx.save();
    ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

    // Center coordinates for rotation
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;

    ctx.translate(cx, cy);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    ctx.translate(-cx, -cy);

    // Apply Drop Shadow
    if (layer.shadowBlur) {
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.3)';
      ctx.shadowOffsetX = layer.shadowOffsetX || 0;
      ctx.shadowOffsetY = layer.shadowOffsetY || 4;
    }

    // Fill Style (Solid vs Gradient)
    if (layer.fillType === 'gradient-linear') {
      const angleRad = ((layer.gradientAngle || 0) * Math.PI) / 180;
      const x2 = layer.x + Math.cos(angleRad) * layer.width;
      const y2 = layer.y + Math.sin(angleRad) * layer.height;
      const grad = ctx.createLinearGradient(layer.x, layer.y, x2, y2);
      grad.addColorStop(0, layer.fill || '#1E1B4B');
      grad.addColorStop(1, layer.gradientColor2 || '#4338CA');
      ctx.fillStyle = grad;
    } else if (layer.fillType === 'gradient-radial') {
      const radius = Math.max(layer.width, layer.height) / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, layer.fill || '#1E1B4B');
      grad.addColorStop(1, layer.gradientColor2 || '#4338CA');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = layer.fill || '#4338CA';
    }

    ctx.strokeStyle = layer.stroke || 'transparent';
    ctx.lineWidth = layer.strokeWidth || 0;

    // Render Shape Types
    if (layer.type === 'rect' || !layer.type) {
      createShapePath(ctx, layer);
      ctx.fill();
      if (layer.strokeWidth > 0) ctx.stroke();
    } else if (layer.type === 'circle') {
      createShapePath(ctx, layer);
      ctx.fill();
      if (layer.strokeWidth > 0) ctx.stroke();
    } else if (layer.type === 'triangle') {
      createShapePath(ctx, layer);
      ctx.fill();
      if (layer.strokeWidth > 0) ctx.stroke();
    } else if (layer.type === 'text') {
      ctx.font = `${layer.fontWeight || '700'} ${layer.fontSize || 24}px "${layer.fontFamily || 'Outfit'}", sans-serif`;
      ctx.textAlign = layer.textAlign || 'left';
      ctx.textBaseline = 'top';

      let tx = layer.x;
      if (layer.textAlign === 'center') tx = layer.x + layer.width / 2;
      else if (layer.textAlign === 'right') tx = layer.x + layer.width;

      ctx.fillText(layer.text || 'Text', tx, layer.y);
      if (layer.strokeWidth > 0) {
        ctx.strokeText(layer.text || 'Text', tx, layer.y);
      }
    } else if (layer.type === 'image' && layer.src) {
      const img = new Image();
      img.src = layer.src;
      if (img.complete) {
        ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      }
    }

    ctx.restore();
  };

  // Draw Selection Handles Bounding Box
  const drawSelectionBox = (ctx, layer) => {
    ctx.save();
    const { x, y, width, height } = layer;

    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.setLineDash([]);

    // 4 Corner Resize Handles
    const handles = [
      { x: x - 8, y: y - 8 },
      { x: x + width, y: y - 8 },
      { x: x - 8, y: y + height },
      { x: x + width, y: y + height },
    ];

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;

    handles.forEach((h) => {
      ctx.fillRect(h.x, h.y, 8, 8);
      ctx.strokeRect(h.x, h.y, 8, 8);
    });

    ctx.restore();
  };

  useEffect(() => {
    renderCanvas();
  }, [layers, selectedLayerId]);

  // Tool Actions
  const addShape = (type) => {
    const newId = `layer-${Date.now()}`;
    let newLayer = {
      id: newId,
      name: `${type.toUpperCase()} ${layers.length + 1}`,
      type,
      x: 250 + (layers.length * 15) % 200,
      y: 180 + (layers.length * 15) % 150,
      width: type === 'text' ? 300 : 120,
      height: type === 'text' ? 50 : 120,
      rotation: 0,
      fillType: 'solid',
      fill: type === 'rect' ? '#3B82F6' : type === 'circle' ? '#10B981' : type === 'triangle' ? '#F59E0B' : '#FFFFFF',
      opacity: 1,
      visible: true,
      locked: false,
    };

    if (type === 'text') {
      newLayer.text = 'புதிய உரை (New Text)';
      newLayer.fontFamily = 'Noto Sans Tamil';
      newLayer.fontSize = 28;
      newLayer.fontWeight = '700';
    }

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newId);
    setActiveTool('select');
    toast.success(`Added ${type} layer!`);
  };

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const newId = `img-${Date.now()}`;
        const aspect = img.width / img.height;
        const width = 200;
        const height = width / aspect;

        const newLayer = {
          id: newId,
          name: `Image ${file.name.substring(0, 10)}`,
          type: 'image',
          src: reader.result,
          x: 300,
          y: 200,
          width,
          height,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
        };

        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newId);
        toast.success('Image imported to canvas!');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Mouse Dragging & Selection
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check hit test from top layer to bottom
    const hit = [...layers].reverse().find((layer) => {
      if (!layer.visible || layer.locked) return false;
      return (
        mouseX >= layer.x &&
        mouseX <= layer.x + layer.width &&
        mouseY >= layer.y &&
        mouseY <= layer.y + layer.height
      );
    });

    if (hit) {
      setSelectedLayerId(hit.id);
      setIsDragging(true);
      setDragStart({ x: mouseX - hit.x, y: mouseY - hit.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedLayer || selectedLayer.locked) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const newX = Math.round(mouseX - dragStart.x);
    const newY = Math.round(mouseY - dragStart.y);

    setLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, x: newX, y: newY } : l))
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Update selected layer property
  const updateSelectedLayer = (key, value) => {
    if (!selectedLayerId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, [key]: value } : l))
    );
  };

  // Layer Reordering
  const moveLayer = (direction) => {
    if (!selectedLayerId) return;
    const idx = layers.findIndex((l) => l.id === selectedLayerId);
    if (idx === -1) return;

    const newLayers = [...layers];
    if (direction === 'up' && idx < newLayers.length - 1) {
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx + 1];
      newLayers[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx - 1];
      newLayers[idx - 1] = temp;
    }

    setLayers(newLayers);
  };

  // Delete Layer
  const deleteSelectedLayer = () => {
    if (!selectedLayerId) return;
    setLayers((prev) => prev.filter((l) => l.id !== selectedLayerId));
    setSelectedLayerId(null);
    toast.success('Layer deleted!');
  };

  // Ultra-HD High Resolution Export (1x, 2x, 4x)
  const exportCanvas = (format = 'image/png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    const scale = exportScale;
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;

    const ctx = exportCanvas.getContext('2d');
    ctx.scale(scale, scale);

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all layers without selection border
    const topLevelLayers = layers.filter((l) => !l.powerClipParentId);
    topLevelLayers.forEach((layer) => {
      if (!layer.visible) return;
      drawLayer(ctx, layer);

      const clippedChildren = layers.filter((c) => c.powerClipParentId === layer.id && c.visible);
      if (clippedChildren.length > 0) {
        ctx.save();
        createShapePath(ctx, layer);
        ctx.clip();
        clippedChildren.forEach((child) => drawLayer(ctx, child));
        ctx.restore();
      }
    });

    const extension = format === 'image/jpeg' ? 'jpg' : 'png';
    const dataUrl = exportCanvas.toDataURL(format, 0.95);
    const link = document.createElement('a');
    link.download = `stargraphix_figma_studio_${exportScale}x_${Date.now()}.${extension}`;
    link.href = dataUrl;
    link.click();
    toast.success(`Exported Ultra-HD (${exportScale}x Resolution) ${extension.toUpperCase()}!`);
  };

  return (
    <div className="flex flex-col h-[750px] border border-gray-200 rounded-3xl bg-gray-900 text-white font-outfit overflow-hidden shadow-2xl">
      
      {/* 1. TOP ICON-ONLY TOOLBAR (Figma Style - NO TEXT LABELS AS REQUESTED) */}
      <div className="h-14 bg-gray-950 border-b border-gray-800 px-4 flex items-center justify-between z-20">
        
        {/* Vector Shape Creation Tools (Icon-only) */}
        <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'select' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Select & Move Pointer Tool"
          >
            <Icon name="MousePointer" size={18} />
          </button>

          <button
            onClick={() => addShape('rect')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Add Rectangle Shape"
          >
            <Icon name="Square" size={18} />
          </button>

          <button
            onClick={() => addShape('circle')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Add Circle Shape"
          >
            <Icon name="Circle" size={18} />
          </button>

          <button
            onClick={() => addShape('triangle')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Add Triangle Shape"
          >
            <Icon name="Triangle" size={18} />
          </button>

          <button
            onClick={() => addShape('text')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Add Text Layer (Tamil/English)"
          >
            <Icon name="Type" size={18} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Import Image or SVG Graphic"
          >
            <Icon name="Upload" size={18} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>

        {/* Layer Manipulation Action Icons */}
        <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => moveLayer('up')}
            disabled={!selectedLayerId}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
            title="Bring Layer Forward"
          >
            <Icon name="ChevronUp" size={18} />
          </button>

          <button
            onClick={() => moveLayer('down')}
            disabled={!selectedLayerId}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
            title="Send Layer Backward"
          >
            <Icon name="ChevronDown" size={18} />
          </button>

          <button
            onClick={deleteSelectedLayer}
            disabled={!selectedLayerId}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 disabled:opacity-30"
            title="Delete Selected Layer"
          >
            <Icon name="Trash" size={18} />
          </button>
        </div>

        {/* High Resolution Export Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            {[1, 2, 4].map((scale) => (
              <button
                key={scale}
                onClick={() => setExportScale(scale)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  exportScale === scale ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
                title={`Export Resolution Scale ${scale}x (${scale * 72} DPI)`}
              >
                {scale}x
              </button>
            ))}
          </div>

          <button
            onClick={() => exportCanvas('image/png')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl flex items-center justify-center transition-all shadow-md"
            title="Export Ultra-HD Image File"
          >
            <Icon name="Download" size={18} />
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTENT AREA (LEFT LAYERS, CENTER CANVAS, RIGHT INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. LEFT SIDEBAR: LAYERS PANEL */}
        <div className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col select-none">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Icon name="Layers" size={14} className="text-indigo-400" /> Layers
            </span>
            <span className="text-[10px] font-mono">{layers.length}</span>
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-1">
            {[...layers].reverse().map((layer) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                  selectedLayerId === layer.id
                    ? 'bg-indigo-600/90 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Icon
                    name={
                      layer.type === 'rect'
                        ? 'Square'
                        : layer.type === 'circle'
                        ? 'Circle'
                        : layer.type === 'triangle'
                        ? 'Triangle'
                        : layer.type === 'text'
                        ? 'Type'
                        : 'Image'
                    }
                    size={14}
                    className="flex-shrink-0 text-gray-400"
                  />
                  <span className="truncate">{layer.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  {layer.powerClipParentId && (
                    <span className="w-2 h-2 rounded-full bg-pink-500" title="Clipped inside PowerClip parent"></span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSelectedLayer('visible', !layer.visible);
                    }}
                    className="text-gray-400 hover:text-white p-0.5"
                    title="Toggle Layer Visibility"
                  >
                    <Icon name="Eye" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CENTER CANVAS WORKSPACE */}
        <div className="flex-1 bg-gray-900 p-6 flex items-center justify-center overflow-auto relative select-none">
          <div className="border border-gray-800 rounded-2xl shadow-2xl overflow-hidden bg-white inline-block">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="cursor-crosshair block"
              style={{ width: '800px', height: '600px' }}
            />
          </div>
        </div>

        {/* 4. RIGHT SIDEBAR: PROPERTIES INSPECTOR & TAMIL FONT TABLE */}
        <div className="w-72 bg-gray-950 border-l border-gray-800 overflow-auto p-4 space-y-5 select-none text-left">
          {selectedLayer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Properties Inspector
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{selectedLayer.type}</span>
              </div>

              {/* Layer Title Rename */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Layer Name</label>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={(e) => updateSelectedLayer('name', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Position & Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">X Position</label>
                  <input
                    type="number"
                    value={selectedLayer.x}
                    onChange={(e) => updateSelectedLayer('x', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={selectedLayer.y}
                    onChange={(e) => updateSelectedLayer('y', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Width</label>
                  <input
                    type="number"
                    value={selectedLayer.width}
                    onChange={(e) => updateSelectedLayer('width', parseInt(e.target.value) || 10)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Height</label>
                  <input
                    type="number"
                    value={selectedLayer.height}
                    onChange={(e) => updateSelectedLayer('height', parseInt(e.target.value) || 10)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Fill Style & Color Gradients */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Fill & Gradient</label>
                
                <div className="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
                  {['solid', 'gradient-linear', 'gradient-radial'].map((ft) => (
                    <button
                      key={ft}
                      onClick={() => updateSelectedLayer('fillType', ft)}
                      className={`py-1 text-[9px] font-bold rounded-lg uppercase ${
                        selectedLayer.fillType === ft ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      {ft === 'solid' ? 'Solid' : ft === 'gradient-linear' ? 'Linear' : 'Radial'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedLayer.fill || '#4338CA'}
                    onChange={(e) => updateSelectedLayer('fill', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-300">{selectedLayer.fill}</span>

                  {selectedLayer.fillType !== 'solid' && (
                    <>
                      <span className="text-xs text-gray-500">to</span>
                      <input
                        type="color"
                        value={selectedLayer.gradientColor2 || '#EC4899'}
                        onChange={(e) => updateSelectedLayer('gradientColor2', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Text Layer Controls & Tamil Font Selector */}
              {selectedLayer.type === 'text' && (
                <div className="space-y-3 pt-2 border-t border-gray-800">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase block">
                    Typography & Tamil Fonts
                  </label>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Text Content</label>
                    <textarea
                      value={selectedLayer.text || ''}
                      onChange={(e) => updateSelectedLayer('text', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500 font-outfit"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Font Family</label>
                    <select
                      value={selectedLayer.fontFamily || 'Noto Sans Tamil'}
                      onChange={(e) => updateSelectedLayer('fontFamily', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {fontFamilies.map((f) => (
                        <option key={f.family} value={f.family}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size Preset Table */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Font Size Table</label>
                      <span className="text-xs font-mono text-indigo-400">{selectedLayer.fontSize}px</span>
                    </div>
                    <div className="flex flex-wrap gap-1 bg-gray-900 p-1.5 rounded-xl border border-gray-800">
                      {fontSizeTable.map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSelectedLayer('fontSize', size)}
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-all ${
                            selectedLayer.fontSize === size ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PowerClip Masking Container Control */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="text-[10px] font-bold text-pink-400 uppercase block">
                  PowerClip Container Mask
                </label>
                <select
                  value={selectedLayer.powerClipParentId || ''}
                  onChange={(e) => updateSelectedLayer('powerClipParentId', e.target.value || null)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                >
                  <option value="">None (Top Layer)</option>
                  {layers
                    .filter((l) => l.id !== selectedLayer.id && l.type !== 'text')
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        Clip inside: {l.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Drop Shadow Controls */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Drop Shadow</label>
                  <span className="text-xs font-mono text-gray-400">{selectedLayer.shadowBlur || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={selectedLayer.shadowBlur || 0}
                  onChange={(e) => updateSelectedLayer('shadowBlur', parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-gray-800 cursor-pointer rounded"
                />
              </div>

            </div>
          ) : (
            <div className="text-center text-gray-500 py-20 text-xs">
              Select any shape or layer on the canvas to inspect and modify properties.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
