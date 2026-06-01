import { createContext, useContext, useState, useCallback } from 'react';
import { getFolders, getFolderAncestors } from '../api/folders.js';
import { getImages } from '../api/images.js';

const FolderContext = createContext(null);

export function FolderProvider({ children }) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useCallback(async (folderId) => {
    setLoading(true);
    try {
      setCurrentFolderId(folderId);

      const [foldersRes, imagesRes] = await Promise.all([
        getFolders(folderId),
        folderId ? getImages(folderId) : Promise.resolve({ data: { data: [] } }),
      ]);

      setFolders(foldersRes.data.data);
      setImages(folderId ? imagesRes.data.data : []);

      if (folderId) {
        const ancestorsRes = await getFolderAncestors(folderId);
        setBreadcrumb(ancestorsRes.data.data);
      } else {
        setBreadcrumb([]);
      }
    } catch (err) {
      console.error('Navigation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await navigate(currentFolderId);
  }, [navigate, currentFolderId]);

  return (
    <FolderContext.Provider
      value={{
        currentFolderId,
        folders,
        images,
        breadcrumb,
        loading,
        navigate,
        refresh,
        setFolders,
        setImages,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
}

export const useFolders = () => {
  const ctx = useContext(FolderContext);
  if (!ctx) throw new Error('useFolders must be used within FolderProvider');
  return ctx;
};
