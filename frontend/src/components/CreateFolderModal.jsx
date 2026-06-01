import { useState, useEffect, useRef } from 'react';
import { X, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createFolder } from '../api/folders.js';

export default function CreateFolderModal({ parentId, onCreated, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Folder name is required');
      return;
    }
    setLoading(true);
    try {
      await createFolder({ name: name.trim(), parentId: parentId || null });
      toast.success(`Folder "${name.trim()}" created`);
      onCreated();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to create folder';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-slate-800">New Folder</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            maxLength={255}
            className="w-full px-3 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm mb-4"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
