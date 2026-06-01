import { FolderPlus, Upload } from 'lucide-react';

export default function EmptyState({ folderId, onCreateFolder, onUploadImage }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Animated floating SVG illustration */}
      <div
        className="mb-8"
        style={{ animation: 'floatUpDown 3s ease-in-out infinite' }}
      >
        <style>{`
          @keyframes floatUpDown {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes pulseSlow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
        `}</style>
        <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="90" cy="150" rx="50" ry="8" fill="#CBD5E1" style={{ animation: 'pulseSlow 3s ease-in-out infinite' }} />
          {/* Main folder body */}
          <rect x="20" y="55" width="140" height="85" rx="10" fill="#FCD34D" />
          {/* Folder tab */}
          <path d="M20 55 L20 45 Q20 40 25 40 L68 40 Q73 40 76 45 L82 55 Z" fill="#F59E0B" />
          {/* Folder shading */}
          <rect x="20" y="95" width="140" height="45" rx="0" fill="#F59E0B" opacity="0.3" />
          <rect x="20" y="130" width="140" height="10" rx="0" fill="#F59E0B" opacity="0.15" style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} />
          {/* Plus icon inside */}
          <circle cx="90" cy="95" r="22" fill="white" opacity="0.8" />
          <line x1="90" y1="85" x2="90" y2="105" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="95" x2="100" y2="95" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
          {/* Small decorative stars */}
          <circle cx="155" cy="45" r="3" fill="#FCD34D" opacity="0.8" />
          <circle cx="30" cy="35" r="2" fill="#93C5FD" opacity="0.8" />
          <circle cx="165" cy="75" r="2" fill="#93C5FD" opacity="0.6" />
          <circle cx="15" cy="90" r="2.5" fill="#FCD34D" opacity="0.6" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {folderId ? 'This folder is empty' : 'Your drive is empty'}
      </h3>
      <p className="text-slate-400 text-sm text-center max-w-xs mb-8">
        {folderId
          ? 'Create a subfolder or upload images to get started.'
          : 'Create your first folder to organize your files.'}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>
        {onUploadImage && (
          <button
            onClick={onUploadImage}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        )}
      </div>
    </div>
  );
}
