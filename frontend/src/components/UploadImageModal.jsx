import { useState, useEffect, useRef } from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '../api/images.js';
import { formatSize } from '../utils/formatSize.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function UploadImageModal({ folderId, onUploaded, onClose }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileError('');

    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Only JPG, PNG, WEBP, and GIF files are allowed');
      return;
    }
    if (f.size > MAX_SIZE) {
      setFileError('File size must be less than 10MB');
      return;
    }

    setFile(f);
    if (!name) {
      // Auto-fill name from filename
      setName(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) { toast.error('Image name is required'); return; }
    if (!file) { toast.error('Please select an image'); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('folderId', folderId);
    formData.append('image', file);

    try {
      await uploadImage(formData);
      toast.success(`"${name.trim()}" uploaded successfully`);
      onUploaded();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors?.[0]?.message || err.response?.data?.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-slate-800">Upload Image</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image file</label>
            <div
              className={`border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
                fileError ? 'border-red-300' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => document.getElementById('file-input').click()}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                    <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded">
                      {file.name} · {formatSize(file.size)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">Click to select image (JPG, PNG, WEBP, GIF · max 10MB)</span>
                </div>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
          </div>

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My image"
              className="w-full px-3 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

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
              disabled={loading || !file || !!fileError || !name.trim()}
              className="flex-1 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
