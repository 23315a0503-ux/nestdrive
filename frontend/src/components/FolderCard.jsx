import { useState, useRef } from 'react';
import { Folder, Trash2, Pencil, Check, X } from 'lucide-react';
import { formatSize } from '../utils/formatSize.js';

export default function FolderCard({ folder, onNavigate, onDelete, onRename }) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const inputRef = useRef(null);

  const startRename = (e) => {
    e.stopPropagation();
    setRenaming(true);
    setNewName(folder.name);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const submitRename = (e) => {
    e?.stopPropagation();
    if (newName.trim() && newName.trim() !== folder.name) {
      onRename(folder, newName.trim());
    }
    setRenaming(false);
  };

  const cancelRename = (e) => {
    e?.stopPropagation();
    setNewName(folder.name);
    setRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitRename();
    if (e.key === 'Escape') cancelRename();
  };

  const depthLabel = folder.depth === 0 ? 'Root' : `Level ${folder.depth}`;

  return (
    <div
      className="group relative bg-white border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-150"
      onDoubleClick={() => !renaming && onNavigate(folder)}
    >
      {/* Depth badge */}
      <span className="absolute top-2 right-2 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
        {depthLabel}
      </span>

      {/* Action buttons */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button
          onClick={startRename}
          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500"
          title="Rename"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
          className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-500"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Folder icon */}
      <div className="mb-3">
        <Folder className="w-10 h-10" style={{ fill: '#FCD34D', color: '#F59E0B' }} />
      </div>

      {/* Name */}
      {renaming ? (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm font-medium border border-primary rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
          />
          <button onClick={submitRename} className="p-0.5 text-green-600 hover:text-green-700">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancelRename} className="p-0.5 text-red-500 hover:text-red-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-800 truncate pr-16">{folder.name}</p>
      )}

      {/* Meta */}
      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <span>{formatSize(folder.totalSize)}</span>
        {(folder.childFolderCount > 0 || folder.imageCount > 0) && (
          <>
            <span>·</span>
            {folder.childFolderCount > 0 && <span>{folder.childFolderCount} folder{folder.childFolderCount !== 1 ? 's' : ''}</span>}
            {folder.imageCount > 0 && <span>{folder.imageCount} image{folder.imageCount !== 1 ? 's' : ''}</span>}
          </>
        )}
      </div>
    </div>
  );
}
