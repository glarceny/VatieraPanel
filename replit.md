# Overview

VatieraPanel is a comprehensive server management panel application built with a modern full-stack architecture. It provides users with the ability to manage game servers (primarily Minecraft) through a web interface, offering features like server creation, console access, file management, resource monitoring, and Wings node management. The application follows a clean separation between frontend (React) and backend (Express.js) with real-time communication capabilities through WebSockets.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight, hook-based routing
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS variables for theming and dark/light mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: Passport.js with local strategy and session-based auth using scrypt for password hashing
- **Real-time Communication**: WebSocket server for live server logs and status updates
- **Session Storage**: In-memory session store with express-session
- **API Design**: RESTful endpoints with consistent error handling middleware

## Data Layer
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL with Neon serverless database provider
- **Schema**: Comprehensive schema including users, servers, nodes, locations, eggs, and server logs
- **Migrations**: Drizzle Kit for database migrations and schema evolution

## Authentication & Authorization
- **Strategy**: Session-based authentication with secure password hashing
- **Password Security**: Scrypt algorithm with salt for password hashing
- **Session Management**: Express-session with configurable session store
- **Route Protection**: Client-side protected routes with authentication checks

## Real-time Features
- **WebSocket Integration**: Bidirectional communication for server console logs and status updates
- **Live Updates**: Real-time server monitoring and log streaming
- **Connection Management**: Client connection tracking and subscription handling

## Development & Build
- **Development Server**: Vite dev server with HMR and React Fast Refresh
- **Production Build**: ESBuild for server bundling, Vite for client optimization
- **Type Checking**: Comprehensive TypeScript configuration with strict mode
- **Error Handling**: Runtime error overlay for development debugging

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Connection**: WebSocket-based connection with @neondatabase/serverless driver

## Authentication
- **Passport.js**: Authentication middleware with local strategy support
- **Express Session**: Session management with configurable store options

## UI & Styling
- **Radix UI**: Headless UI primitives for accessible components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Replit Integration**: Vite plugins for Replit-specific development features
- **ESBuild**: Fast JavaScript bundler for server-side code
- **Drizzle Kit**: Database schema management and migration tools

## Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time features
- **TanStack Query**: Advanced data fetching with caching and background updates

## Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **Hookform Resolvers**: Integration between React Hook Form and Zod