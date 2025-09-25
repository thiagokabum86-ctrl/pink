# Overview

This is a full-stack e-commerce web application built for selling perfumes and cosmetics. The project implements a modern product catalog with detailed product pages, shopping features, and a responsive mobile-first design. It's structured as a monorepo with separate client and server directories, using React for the frontend and Express.js for the backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive design system using Radix UI primitives with shadcn/ui components for consistent, accessible user interface
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Build Tool**: Vite for fast development and optimized production builds
- **Mobile-First Design**: Responsive layout optimized for mobile commerce experience

## Backend Architecture
- **Framework**: Express.js with TypeScript for robust server-side development
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development and easy database integration
- **API Design**: RESTful API structure with `/api` prefix for clear separation
- **Development Server**: Integrated Vite middleware for seamless full-stack development
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Data Layer
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL configured through Neon serverless platform for scalable cloud database
- **Schema**: Well-defined product and user entities with proper relationships and constraints
- **Migrations**: Drizzle Kit for database migrations and schema evolution
- **Validation**: Zod schemas integrated with Drizzle for runtime type validation

## Project Structure
- **Monorepo Layout**: Clean separation between client, server, and shared code
- **Shared Types**: Common TypeScript types and schemas accessible to both frontend and backend
- **Component Organization**: Modular React components with clear separation of concerns
- **Asset Management**: Integrated asset handling through Vite configuration

## Development Workflow
- **Type Safety**: Full TypeScript coverage across the entire stack
- **Hot Reload**: Vite HMR for instant development feedback
- **Path Mapping**: Convenient import aliases for cleaner code organization
- **Linting**: Consistent code formatting and quality standards

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting platform for scalable data storage
- **Drizzle ORM**: Modern TypeScript ORM for database operations
- **Connect PG Simple**: PostgreSQL session store for user session management

## UI & Design System
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Consistent icon library for user interface elements
- **Class Variance Authority**: Type-safe component variant management

## Development Tools
- **Replit Integration**: Specialized Vite plugins for Replit development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing for Tailwind and other transformations

## Utility Libraries
- **Date-fns**: Modern date utility library for formatting and manipulation
- **Nanoid**: Secure URL-friendly unique ID generator
- **CLSX**: Conditional className utility for dynamic styling