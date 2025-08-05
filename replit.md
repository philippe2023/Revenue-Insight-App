# HotelCast - AI-Powered Hotel Management & Forecasting Platform

## Overview

HotelCast is a comprehensive hotel management platform that combines AI-powered forecasting, event planning, and team collaboration features. The application helps hotel revenue managers make data-driven decisions by providing intelligent forecasting tools, event impact analysis, and real-time performance analytics. It replaces traditional Excel-based workflows with a modern web-based solution that includes user authentication, role-based access control, and collaborative features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with session-based authentication
- **Authentication**: Session-based email/password authentication with secure password hashing
- **Middleware**: CORS handling, JSON parsing, error handling, and file upload middleware (multer)

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Shared TypeScript schema definitions between client and server
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

### Database Schema Design
The application uses a comprehensive schema including:
- Users table with role-based access (user, admin, manager)
- Hotels table with detailed property information and status tracking
- Events table for local event discovery and impact analysis with city-based hotel linking
- Forecasts table for revenue predictions with confidence levels
- Hotel actuals for performance tracking
- Tasks table for team collaboration and assignment management
- Comments system for threaded discussions
- Activity logging for audit trails
- Hotel assignments for team member property allocation

### Event Management System
- **City-based Linking**: Events and hotels are bidirectionally linked by city location
- **Excel Integration**: Full Excel upload/download functionality using multer and xlsx packages
- **Event Search**: Automated event discovery and manual event creation capabilities
- **CRUD Operations**: Complete create, read, update, delete operations for events
- **Template System**: Excel template download for bulk event data management
- **Data Validation**: Comprehensive validation and error handling for event imports

### Authentication and Authorization
- **Authentication Method**: Session-based email/password authentication with secure password hashing
- **Session Management**: Server-side sessions stored in PostgreSQL using connect-pg-simple
- **Authorization**: Role-based access control with user, admin, and manager roles
- **Security**: HTTP-only cookies, scrypt password hashing, secure session configuration
- **Features**: User registration, login, logout, protected routes, authentication middleware

### API Architecture
- **Structure**: RESTful endpoints organized by resource type
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Zod schema validation for request bodies
- **Response Format**: Consistent JSON responses with error messaging

## External Dependencies

### Third-party Services
- **Database**: Neon serverless PostgreSQL for data persistence
- **Authentication**: Custom session-based authentication with secure password hashing
- **CDN**: Google Fonts for Inter font family

### Key Libraries and Frameworks
- **UI Components**: Radix UI primitives for accessible component foundations
- **Charts**: Recharts for data visualization and analytics
- **Date Handling**: date-fns for date manipulation and formatting
- **Form Validation**: Zod for runtime type checking and validation
- **HTTP Client**: Native fetch with custom query client wrapper
- **Styling**: Tailwind CSS with class-variance-authority for component variants

### Development Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: TypeScript across the entire stack
- **Code Quality**: ESLint configuration for consistent code style

### Runtime Dependencies
- **Process Management**: tsx for TypeScript execution in development
- **Bundle**: esbuild for production server bundling
- **WebSocket**: ws library for database connection handling
- **Session Store**: connect-pg-simple for PostgreSQL session storage