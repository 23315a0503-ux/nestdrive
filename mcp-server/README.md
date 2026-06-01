# NestDrive MCP Server

Exposes NestDrive folder and image actions to Claude Desktop via the Model Context Protocol.

## Tools

| Tool | Description |
|------|-------------|
| `create_folder` | Create a new folder, optionally nested inside another |
| `list_folders` | List root folders or children of a named folder |
| `list_images` | List all images in a named folder |
| `get_folder_size` | Get total size + counts for a folder (recursive) |

## Setup

```bash
cd mcp-server
npm install
cp .env.example .env
# Edit .env with your API_BASE_URL and USER_JWT_TOKEN
```

Get your JWT token by logging in:
```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nestdrive.com","password":"Demo@1234"}'
# Copy the token from the response
```

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "nestdrive": {
      "command": "node",
      "args": ["/absolute/path/to/nestdrive/mcp-server/src/index.js"],
      "env": {
        "API_BASE_URL": "https://your-backend.railway.app",
        "USER_JWT_TOKEN": "your-jwt-token-here"
      }
    }
  }
}
```

Restart Claude Desktop after editing the config.
