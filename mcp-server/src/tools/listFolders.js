import apiClient from '../apiClient.js';

export const listFoldersTool = {
  name: 'list_folders',
  description: 'List folders in NestDrive. Optionally list children of a specific folder by name.',
  inputSchema: {
    type: 'object',
    properties: {
      parentFolderName: { type: 'string', description: 'Optional: name of parent folder to list children of. Omit for root folders.' },
    },
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function listFoldersHandler({ parentFolderName } = {}) {
  let parentId = 'null';

  if (parentFolderName) {
    const rootRes = await apiClient.get('/api/folders', { params: { parentId: 'null' } });
    const rootFolders = rootRes.data.data;
    const parent = rootFolders.find((f) => f.name.toLowerCase() === parentFolderName.toLowerCase());

    if (!parent) {
      const names = rootFolders.map((f) => f.name).join(', ');
      return {
        content: [{
          type: 'text',
          text: `Folder "${parentFolderName}" not found at root level. Root folders: ${names || 'none'}.`,
        }],
      };
    }
    parentId = parent._id;
  }

  const res = await apiClient.get('/api/folders', { params: { parentId } });
  const folders = res.data.data;

  if (folders.length === 0) {
    return {
      content: [{
        type: 'text',
        text: parentFolderName
          ? `No subfolders found in "${parentFolderName}".`
          : 'No folders found. Create one with create_folder.',
      }],
    };
  }

  const lines = folders.map((f) =>
    `• ${f.name} | Size: ${formatBytes(f.totalSize)} | ${f.childFolderCount} subfolder(s), ${f.imageCount} image(s) | Level ${f.depth} | ID: ${f._id}`
  );

  return {
    content: [{
      type: 'text',
      text: `Folders${parentFolderName ? ` in "${parentFolderName}"` : ' (root)'}:\n\n${lines.join('\n')}`,
    }],
  };
}
