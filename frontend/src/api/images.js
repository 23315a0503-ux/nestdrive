import api from './axios.js';

export const getImages = (folderId) =>
  api.get('/api/images', { params: { folderId } });

export const uploadImage = (formData) =>
  api.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteImage = (id) => api.delete(`/api/images/${id}`);
