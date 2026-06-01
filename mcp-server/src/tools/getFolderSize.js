import apiClient from '../apiClient.js';

export const getFolderSizeTool = {
  name: 'get_folder_size',
  description: 'Get the total size and image count of a folder including all nested subfolders.',
  inputSchema: {
    type: 'object',
    properties: {
      folderName: { type: 'string', description: 'Name of the folder to get size for' },
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

export async function getFolderSizeHandler({ folderName }) {
  const rootRes = await apiClient.get('/api/folders', { params: { parentId: 'null' } });
  const rootFolders = rootRes.data.data;
  const folder = rootFolders.find((f) => f.name.toLowerCase() === folderName.toLowerCase());

  if (!folder) {
    const names = rootFolders.map((f) => f.name).join(', ');
    return {
      content: [{
        type: 'text',
        text: `Folder "${folderName}" not found. Root folders: ${names || 'none'}.`,
      }],
    };
  }

  return {
    content: [{
      type: 'text',
      text: `📁 "${folder.name}"\n• Total size: ${formatBytes(folder.totalSize)}\n• Images: ${folder.imageCount}\n• Subfolders: ${folder.childFolderCount}\n• Depth level: ${folder.depth}`,
    }],
  };
}
