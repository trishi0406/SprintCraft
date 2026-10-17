# SprintCraft

## About SprintCraft
SprintCraft is a feature-rich project management tool inspired by Trello and Jira.  
It empowers teams to organize tasks across agile workflows, collaborate in real time with zero-latency WebSocket synchronization, manage file attachments via cloud storage, and maintain role-based access control.

## Key Features
- Real-Time Collaboration: Instant bi-directional board updates, card movements, and task syncs powered by Socket.io.  
- Live User Presence: Workspace tracking showing active team members online in real time.  
- Interactive Kanban Boards: Four-column agile workflow (To Do, In Progress, In Review, Done) featuring smooth drag-and-drop card reordering using @hello-pangea/dnd.  
- Cloud File Attachments: Seamless file upload pipeline utilizing Multer and Cloudinary for image and document attachments directly inside tasks.  
- Secure Authentication: Stateless JWT session handling, bcryptjs password encryption, and Role-Based Access Control (RBAC) workspace permissions.  

## Project Architecture (Decoupled Monorepo)

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, @hello-pangea/dnd, Axios, socket.io-client  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose ODM, Socket.io, JWT, Multer  
- **Storage & CDN:** Cloudinary  

## Getting Started

### Prerequisites
- Node.js (v18 or higher)  
- MongoDB (Local instance or MongoDB Atlas cloud URI)  


