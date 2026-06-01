import apiClient from '../apiClient.js';

export const listImagesTool = {
  name: 'list_images',
  description: 'List all images inside a specific folder in NestDrive.',
  inputSchema: {
    type: 'object',
    properties: {
      folderName: { type: 'string', description: 'Name of the folder to list images from' },
    },
    required: ['folderName'],
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function listImagesHandler({ folderName }) {
  const rootRes = await apiClient.get('/api/folders', { params: { parentId: 'null' } });
  const rootFolders = rootRes.data.data;
  let folder = rootFolders.find((f) => f.name.toLowerCase() === folderName.toLowerCase());

  if (!folder) {
    const names = rootFolders.map((f) => f.name).join(', ');
    return {
      content: [{
        type: 'text',
        text: `Folder "${folderName}" not found. Root folders: ${names || 'none'}. Use list_folders to explore subfolders.`,
      }],
    };
  }

  const imagesRes = await apiClient.get('/api/images', { params: { folderId: folder._id } });
  const images = imagesRes.data.data;

  if (images.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `No images found in "${folderName}".`,
      }],
    };
  }

  const lines = images.map((img) =>
    `• ${img.name} | ${formatBytes(img.size)} | ${img.mimeType} | ${img.cloudinaryUrl}`
  );

  return {
    content: [{
      type: 'text',
      text: `Images in "${folderName}" (${images.length} total):\n\n${lines.join('\n')}`,
    }],
  };
}
