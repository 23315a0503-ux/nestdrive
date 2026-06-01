import api from './axios.js';

export const getFolders = (parentId) =>
  api.get('/api/folders', { params: { parentId: parentId ?? 'null' } });

export const createFolder = (data) => api.post('/api/folders', data);

export const getFolderAncestors = (id) => api.get(`/api/folders/${id}/ancestors`);

export const renameFolder = (id, name) => api.put(`/api/folders/${id}`, { name });

export const deleteFolder = (id) => api.delete(`/api/folders/${id}`);
