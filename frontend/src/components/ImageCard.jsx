import { Trash2, ZoomIn } from 'lucide-react';
import { formatSize } from '../utils/formatSize.js';

export default function ImageCard({ image, onDelete, onView }) {
  return (
    <div
      className="group relative bg-white border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-150"
      onClick={() => onView(image)}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        <img
          src={image.cloudinaryUrl}
          alt={image.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(image); }}
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded bg-white/90 hover:bg-red-50 text-red-500 shadow-sm transition-opacity"
        title="Delete"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-medium text-slate-800 truncate">{image.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{formatSize(image.size)}</p>
      </div>
    </div>
  );
}
