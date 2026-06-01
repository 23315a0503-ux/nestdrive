import apiClient from '../apiClient.js';

export const createFolderTool = {
  name: 'create_folder',
  description: 'Create a new folder in NestDrive. Optionally nest it inside an existing folder by name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the new folder to create' },
      parentFolderName: { type: 'string', description: 'Optional: name of the parent folder to nest inside' },
    },
    required: ['name'],
  },
};

export async function createFolderHandler({ name, parentFolderName }) {
  let parentId = null;

  if (parentFolderName) {
    const foldersRes = await apiClient.get('/api/folders', { params: { parentId: 'null' } });
    const allFolders = foldersRes.data.data;
    const parent = allFolders.find((f) => f.name.toLowerCase() === parentFolderName.toLowerCase());

    if (!parent) {
      const names = allFolders.map((f) => f.name).join(', ');
      return {
        content: [{
          type: 'text',
          text: `Parent folder "${parentFolderName}" not found. Available root folders: ${names || 'none'}. Use list_folders to see all folders.`,
        }],
      };
    }
    parentId = parent._id;
  }

  const res = await apiClient.post('/api/folders', { name, parentId });
  const folder = res.data.data;

  return {
    content: [{
      type: 'text',
      text: `✅ Folder "${folder.name}" created successfully (ID: ${folder._id})${parentFolderName ? ` inside "${parentFolderName}"` : ' at root level'}.`,
    }],
  };
}
