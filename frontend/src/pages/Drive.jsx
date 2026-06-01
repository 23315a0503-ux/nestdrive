import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useFolders } from '../context/FolderContext.jsx';
import { deleteFolder, renameFolder } from '../api/folders.js';
import { deleteImage } from '../api/images.js';
import Navbar from '../components/Navbar.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import FolderGrid from '../components/FolderGrid.jsx';
import ImageGrid from '../components/ImageGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CreateFolderModal from '../components/CreateFolderModal.jsx';
import UploadImageModal from '../components/UploadImageModal.jsx';

export default function Drive() {
  const { currentFolderId, folders, images, loading, navigate, refresh, setFolders, setImages } = useFolders();
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    navigate(null);
  }, []);

  const handleDeleteFolder = async (folder) => {
    const toastId = toast.loading(`Deleting "${folder.name}"...`);
    try {
      await deleteFolder(folder._id);
      setFolders((prev) => prev.filter((f) => f._id !== folder._id));
      toast.success(`Folder "${folder.name}" deleted`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete folder', { id: toastId });
    }
  };

  const handleRenameFolder = async (folder, newName) => {
    try {
      await renameFolder(folder._id, newName);
      setFolders((prev) => prev.map((f) => (f._id === folder._id ? { ...f, name: newName } : f)));
      toast.success('Folder renamed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename folder');
    }
  };

  const handleDeleteImage = async (image) => {
    const toastId = toast.loading(`Deleting "${image.name}"...`);
    try {
      await deleteImage(image._id);
      setImages((prev) => prev.filter((i) => i._id !== image._id));
      toast.success(`Image "${image.name}" deleted`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image', { id: toastId });
    }
  };

  const handleFolderCreated = () => {
    setShowCreateFolder(false);
    refresh();
  };

  const handleImageUploaded = () => {
    setShowUploadImage(false);
    refresh();
  };

  const isEmpty = !loading && folders.length === 0 && images.length === 0;

  return (
    <div className="min-h-screen bg-sidebar flex flex-col">
      <Navbar
        onCreateFolder={() => setShowCreateFolder(true)}
        onUploadImage={currentFolderId ? () => setShowUploadImage(true) : null}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Breadcrumb />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            folderId={currentFolderId}
            onCreateFolder={() => setShowCreateFolder(true)}
            onUploadImage={currentFolderId ? () => setShowUploadImage(true) : null}
          />
        ) : (
          <div className="space-y-8">
            {folders.length > 0 && (
              <FolderGrid
                folders={folders}
                onNavigate={(f) => navigate(f._id)}
                onDelete={handleDeleteFolder}
                onRename={handleRenameFolder}
              />
            )}
            {images.length > 0 && (
              <ImageGrid
                images={images}
                onDelete={handleDeleteImage}
                onView={(img) => setLightboxImage(img)}
              />
            )}
          </div>
        )}
      </div>

      {showCreateFolder && (
        <CreateFolderModal
          parentId={currentFolderId}
          onCreated={handleFolderCreated}
          onClose={() => setShowCreateFolder(false)}
        />
      )}

      {showUploadImage && currentFolderId && (
        <UploadImageModal
          folderId={currentFolderId}
          onUploaded={handleImageUploaded}
          onClose={() => setShowUploadImage(false)}
        />
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 text-sm"
            >
              ✕ Close
            </button>
            <img
              src={lightboxImage.cloudinaryUrl}
              alt={lightboxImage.name}
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <p className="text-white text-center mt-2 text-sm">{lightboxImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
