
# 🌐 VatieraPanel

**VatieraPanel** is a modern, modular hosting control panel inspired by **Pterodactyl Panel**. Designed to simplify server management, monitoring, and running applications, VatieraPanel provides a powerful and scalable architecture for developers, admins, and server owners.  

> ⚠️ Note: This project is currently in **early development**. Features will expand over time.

---

## 📁 Project Structure

vatierapanel/ ├─ panel/        # Web Panel (frontend & backend API) ├─ wings/        # Agent/daemon for each server └─ eggs/         # Server templates (Docker image & initial settings)

---

## ⚙️ Technologies

| Component | Technology / Stack | Description |
|-----------|-----------------|-------------|
| **Panel (Frontend)** | React + TailwindCSS | Modern UI, responsive dashboard, mobile-friendly |
| **Panel (Backend)** | Node.js + Express | REST API + WebSocket for realtime communication |
| **Database** | PostgreSQL + Redis | Main database + caching / queue system |
| **Wings (Agent)** | Go/TypeScript | Runs Docker containers, monitors resources, executes commands |
| **Eggs** | JSON/YAML templates | Server templates: Minecraft, Node.js, PHP, SA-MP, FiveM |

---

## 🎯 Features (Early Stage)

- 🔐 **Login/Register** (JWT-based, simple auth)  
- 🖥 **Dashboard** to view multiple servers  
- ⚡ **Real-time console** (WebSocket, instant server logs)  
- 🗂 **Project structure ready** for expansion  

> Advanced features such as File Manager, Billing System, Scheduler, and Egg Loader will be added in later phases.

---

## 🛠 Roadmap

### Phase 1 – Panel Foundation
- Backend setup (Node.js + PostgreSQL)  
- Frontend setup (React + TailwindCSS)  
- Authentication system + basic dashboard  

### Phase 2 – Wings (Agent)
- Run server agent  
- Connect agent to Panel  
- Run Docker containers (start/stop/restart)  

### Phase 3 – Core Panel Features
- File manager (upload, download, edit)  
- Console log real-time  
- Resource monitoring: CPU, RAM, Disk  

### Phase 4 – Egg System
- Standard template format (JSON/YAML)  
- Loader for Docker images & environment variables  
- Support for multiple server types (Minecraft, Node.js, etc.)  

### Phase 5 – Advanced
- Scheduler: automatic backup & restart  
- Billing system & subscription management  
- Subuser / permissions system  
- Public API for automation  

---

## 🌟 Additional Highlights

- 🎨 **Premium UI**: Clean, modern, responsive, mobile-first  
- ⚡ **Realtime Updates**: WebSocket-based communication  
- 🔒 **Secure**: JWT auth + optional 2FA in future versions  
- 📈 **Monitoring**: Live CPU, RAM, Disk usage graphs  
- 🧩 **Modular Design**: Easily add new Eggs / server templates  
- 🌐 **Global Ready**: Multi-server, multi-user support  
