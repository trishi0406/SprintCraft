# ⚡ SprintCraft — Modern Agile Sprint & Kanban Management Platform

SprintCraft is a high-performance, dynamic agile sprint planning and Kanban management application built with **React**, **Vite**, and **Tailwind CSS**. It features rich interactive drag-and-drop boards, customizable multi-theme engines (including Dark and Light modes), real-time global search, sprint metrics analytics, task detail modals, and LocalStorage state persistence.

---

## ✨ Features

- 🎨 **Dynamic Multi-Theme System**:
  - **5 Dark Themes**: Midnight Slate, Cyber Obsidian, Emerald Matrix, Oceanic Abyss, Sunset Amber
  - **2 Light Themes**: Pure White, Nordic Breeze
  - Instant **Sun / Moon** Light & Dark mode quick toggle
- 📋 **Interactive Kanban Board**:
  - Smooth HTML5 Drag-and-Drop task reordering & column movement
  - Priority filter badges (High, Medium, Low) and tag filters
  - Dynamic inline column creation and customization
- 📊 **Analytics & Sprint Dashboard**:
  - Real-time velocity tracking, burndown metrics, and task distribution charts
  - Recent team activity feeds and workspace statistics
- 💬 **Task Detail & Comments**:
  - Interactive subtask checkboxes with dynamic progress bars
  - Real-time task comment posting and assignee management
  - Task creation wizard and detailed edit forms
- 💾 **LocalStorage Persistence**:
  - Automatic saving of all boards, tasks, columns, comments, theme preferences, and member actions

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/trishi0406/SprintCraft.git
   cd SprintCraft
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router DOM
- **Drag and Drop**: `@hello-pangea/dnd`
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **State Management**: React Context API + LocalStorage

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
