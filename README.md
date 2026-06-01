# NestDrive

A Google Drive-inspired nested folder and image manager with JWT auth, Cloudinary storage, and MCP server support.

## Live URLs

- **Frontend**: https://nestdrive.vercel.app *(update after deploy)*
- **Backend API**: https://nestdrive-api.railway.app *(update after deploy)*

## Demo Credentials

```
Email:    demo@nestdrive.com
Password: Demo@1234
```

## Features

- JWT-based authentication (signup/login/me)
- Infinitely deep nested folder creation
- Recursive folder size calculation across all depths
- User-scoped data isolation (users see only their own data)
- Cloudinary image storage (JPG, PNG, WEBP, GIF — max 10MB)
- Breadcrumb navigation, lightbox image viewer
- MCP server for Claude Desktop integration (bonus)

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free M0 tier)
- Cloudinary account (free tier)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_* in .env
npm start
# Seed demo data:
npm run demo
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

### MCP Server (optional)

See [mcp-server/README.md](./mcp-server/README.md).

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `FRONTEND_URL` | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## Deployment

### Backend → Railway
1. Push backend folder to GitHub
2. Create new Railway project from repo
3. Set all env vars in Railway dashboard
4. `railway.json` handles the rest

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` to your Railway backend URL
4. `vercel.json` handles SPA routing rewrites

## Tech Stack

**Backend**: Node.js 18, Express, MongoDB + Mongoose 8, JWT, bcryptjs, Multer, Cloudinary SDK  
**Frontend**: React 18, Vite, React Router v6, Axios, Tailwind CSS v3, lucide-react, react-hot-toast  
**MCP**: @modelcontextprotocol/sdk, stdio transport
