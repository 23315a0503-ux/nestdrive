import { HardDrive, FolderPlus, Upload, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useFolders } from '../context/FolderContext.jsx';

export default function Navbar({ onCreateFolder, onUploadImage }) {
  const { user, logout } = useAuth();
  const { navigate: folderNavigate } = useFolders();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    nav('/login');
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <button
          onClick={() => folderNavigate(null)}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-slate-800 hidden sm:block">NestDrive</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onCreateFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:block">New Folder</span>
          </button>

          {onUploadImage && (
            <button
              onClick={onUploadImage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:block">Upload</span>
            </button>
          )}

          <div className="h-6 w-px bg-border mx-1" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">{user?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
