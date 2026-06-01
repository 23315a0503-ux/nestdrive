import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
dotenv.config();

import { createFolderTool, createFolderHandler } from './tools/createFolder.js';
import { listFoldersTool, listFoldersHandler } from './tools/listFolders.js';
import { listImagesTool, listImagesHandler } from './tools/listImages.js';
import { getFolderSizeTool, getFolderSizeHandler } from './tools/getFolderSize.js';

const server = new Server(
  { name: 'nestdrive', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [createFolderTool, listFoldersTool, listImagesTool, getFolderSizeTool],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_folder':
        return await createFolderHandler(args);
      case 'list_folders':
        return await listFoldersHandler(args);
      case 'list_images':
        return await listImagesHandler(args);
      case 'get_folder_size':
        return await getFolderSizeHandler(args);
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('NestDrive MCP server running on stdio');
