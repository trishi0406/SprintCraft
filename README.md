# SprintCraft 

SprintCraft is a real-time, interactive MERN-stack Kanban & Sprint Planning platform inspired by modern agile workflows. Built for high-velocity teams, it features zero-latency WebSocket synchronization, fluid drag-and-drop task management, Cloudinary-powered media attachments, and role-based access control (RBAC).

---

##  Key Features

-  Real-Time Collaboration**: Instant bi-directional board updates, card movements, and task status sync across all connected clients via Socket.io.
-  Interactive Drag-and-Drop Kanban**: Four-stage agile workflow (*To Do*, *In Progress*, *In Review*, *Done*) powered by `@hello-pangea/dnd`.
-  Live User Presence & Workspaces**: Dynamic workspace tracking displaying active team members and collaborators in real time.
-  Cloud Media Attachments**: Seamless asset upload pipeline utilizing Multer and Cloudinary for file and image management directly within tasks.
-  Secure Authentication & RBAC**: Stateless JWT session handling, bcrypt password hashing, and granular Role-Based Access Control (*Admin*, *Member*, *Viewer*).
-  Sleek Dark-Themed UI**: Modern, accessible UI styled with Tailwind CSS, Lucide icons, and responsive layouts.

---

##  Tech Stack

### Frontend (`/sprintcraft`)
- **Core**: React 19, Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Drag & Drop**: `@hello-pangea/dnd`
- **Real-Time Client**: `socket.io-client`

### Backend (`/server`)
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.io
- **Auth & Security**: JSON Web Tokens (JWT), bcryptjs
- **Media Storage**: Cloudinary, Multer

---

##  Project Structure

```text
project_sprint/
├── package.json              # Monorepo management scripts
├── .gitignore                # Global ignore rules
├── server/                   # Express & Socket.io Backend
│   ├── config/               # Database and Cloudinary configuration
│   ├── controllers/          # API route controllers (Auth, Board, Task, Workspace)
│   ├── middleware/           # JWT auth, RBAC, and file upload middleware
│   ├── models/               # Mongoose schemas (User, Workspace, Board, Task)
│   ├── routes/               # Express endpoints
│   ├── utils/                # RBAC and helper utilities
│   ├── socketServer.js       # Real-time WebSocket handlers
│   ├── server.js             # Server entry point
│   └── .env.example          # Backend environment variable template
└── sprintcraft/              # React & Vite Frontend
    ├── public/               # Public static assets
    ├── src/
    │   ├── components/       # UI elements, modals, board columns, task cards
    │   ├── context/          # Auth and Board state providers
    │   ├── layouts/          # Main application shells and navbars
    │   ├── lib/              # API clients, socket connections, normalizers
    │   ├── pages/            # Dashboard, Board, Analytics, Settings, Auth
    │   └── App.jsx           # Application routing and provider tree
    ├── vite.config.js        # Vite build & development proxy configuration
    └── package.json          # Frontend dependencies
```

---

##  Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: Local MongoDB instance or a MongoDB Atlas connection string
- **Cloudinary Account**: Cloud name, API key, and API secret

### 1. Clone the Repository

```bash
git clone https://github.com/trishi0406/SprintCraft.git
cd SprintCraft
```

### 2. Environment Setup

Create a `.env` file in the `server` directory (you can copy from `server/.env.example`):

```bash
cp server/.env.example server/.env
```

Fill in your configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sprintcraft
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install Dependencies

You can install dependencies for both frontend and backend using the root script:

```bash
npm run install:all
```

Or install them individually:

```bash
# Backend
cd server
npm install

# Frontend
cd ../sprintcraft
npm install
```

### 4. Running the Development Servers

From the root directory:

```bash
# Start backend server (Port 5000)
npm run dev:server

# In a separate terminal, start frontend client (Port 5173)
npm run dev:client
```

---

##  Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev:server` | Starts the Express & Socket.io backend with nodemon |
| `npm run dev:client` | Launches the Vite frontend development server |
| `npm run build:client` | Builds production frontend assets into `sprintcraft/dist` |
| `npm run start:server` | Starts backend server in production mode |
| `npm run install:all` | Installs dependencies for both server and client |

---

##  License

This project is open-source and available under the [MIT License](LICENSE).
