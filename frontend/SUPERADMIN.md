# SuperAdmin Panel Documentation

## Overview

The SuperAdmin panel is a comprehensive administrative interface for managing the entire TalkDeskly system. It provides tools for managing users, companies, system monitoring, and global configuration.

## Features

### Core Features

- **Dashboard**: System overview with key metrics and statistics
- **User Management**: Create, read, update, and delete system users across all companies
- **Company Management**: Manage all companies in the system
- **System Health**: Monitor system performance and health metrics
- **Global Settings**: Configure system-wide settings

### UI Features

- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Theme Support**: Light, dark, and system theme modes with smooth transitions
- **Role-based Access**: Only users with 'admin' role can access the panel
- **Real-time Updates**: Live data updates for system metrics
- **Search & Pagination**: Efficient data browsing with search capabilities

## Theme System

The SuperAdmin panel includes a comprehensive theme system with the following features:

### Available Themes

- **Light Mode**: Clean, bright interface optimized for daylight use
- **Dark Mode**: Dark interface optimized for low-light conditions
- **System Mode**: Automatically follows the user's system preference

### Theme Toggle

- Located in the top header area (both desktop sidebar and mobile menu)
- Dropdown menu with visual indicators for current selection
- Smooth transitions between themes
- Persistent theme selection (stored in localStorage)

### Theme Implementation

- Uses CSS variables for consistent theming
- Tailwind CSS dark mode classes for component styling
- Smooth transitions during theme switches
- Respects system preferences when using "System" mode

## Access Control

### Authentication Requirements

- User must be logged in with a valid session
- User role must be set to 'admin' (configurable in auth middleware)
- Automatic redirect to portal if access is denied

### Route Protection

All SuperAdmin routes are protected with:

- Authentication middleware
- Role-based authorization
- Automatic redirects for unauthorized access

## Navigation

### Desktop Navigation

- Fixed sidebar with comprehensive navigation menu
- Each item includes icon, title, and description
- Visual indicators for active/current page
- Theme toggle in the sidebar header

### Mobile Navigation

- Responsive header with hamburger menu
- Slide-out navigation panel
- Theme toggle in mobile header
- Touch-friendly interface

## API Integration

### Endpoint Structure

All SuperAdmin endpoints are prefixed with `/api/superadmin/` and include:

**Dashboard & Statistics**

- `GET /api/superadmin/stats` - System overview statistics

**User Management**

- `GET /api/superadmin/users` - List all users (with pagination/search)
- `GET /api/superadmin/users/:id` - Get specific user
- `POST /api/superadmin/users` - Create new user
- `PUT /api/superadmin/users/:id` - Update user
- `DELETE /api/superadmin/users/:id` - Delete user

**Company Management**

- `GET /api/superadmin/companies` - List all companies (with pagination/search)
- `GET /api/superadmin/companies/:id` - Get specific company
- `POST /api/superadmin/companies` - Create new company
- `PUT /api/superadmin/companies/:id` - Update company
- `DELETE /api/superadmin/companies/:id` - Delete company
- `GET /api/superadmin/companies/:id/users` - Get company users

## Components

### Core Components

- **SuperAdminLayout**: Main layout wrapper with theme provider and navigation
- **ThemeToggle**: Theme selection dropdown component
- **UserRoleBadge**: Reusable role display component with icons and consistent styling
- **UserForm**: Form component for creating/editing users
- **CompanyForm**: Form component for creating/editing companies

### Pages

- **Dashboard**: System overview and statistics
- **Users**: User management interface
- **Companies**: Company management interface
- **System Health**: System monitoring and health metrics
- **Settings**: Global system configuration

## Usage Instructions

### Accessing the SuperAdmin Panel

1. Log in as a user with 'admin' role
2. Navigate to `/superadmin` in your browser
3. You'll be automatically redirected if you don't have access

### Switching Themes

1. Look for the theme toggle button in the header/sidebar
2. Click to open the theme selection dropdown
3. Choose from Light, Dark, or System options
4. Your selection will be saved automatically

### Managing Users

1. Navigate to the Users section
2. Use the search bar to find specific users
3. Click "Create User" to add new users
4. Click on any user row to view/edit details
5. Use the actions menu for additional operations

### Managing Companies

1. Navigate to the Companies section
2. View all companies with pagination controls
3. Create new companies with the "Create Company" button
4. Click on company entries to view associated users
5. Edit or delete companies as needed

## Development Notes

### File Structure

```
frontend/src/
├── context/
│   └── theme-context.tsx          # Theme provider and hook
├── components/superadmin/
│   ├── theme-toggle.tsx          # Theme selection component
│   ├── user-form.tsx             # User management form
│   └── company-form.tsx          # Company management form
├── pages/(superadmin)/
│   ├── layout.tsx                # Main layout with theme support
│   ├── dashboard/page.tsx        # Dashboard page with dark mode
│   ├── users/page.tsx            # User management
│   ├── companies/page.tsx        # Company management
│   └── system/page.tsx           # System health monitoring
└── lib/api/services/
    └── superadmin.ts             # API service layer
```

### Theme Implementation Details

- Theme state managed via React Context (`ThemeProvider`)
- CSS transitions applied during theme changes
- Tailwind CSS classes used for dark mode styling
- localStorage persistence for theme preference
- System preference detection and monitoring

### Styling Conventions

- Use semantic color classes (e.g., `text-gray-900 dark:text-white`)
- Apply hover states for both light and dark modes
- Ensure sufficient contrast in both themes
- Use consistent spacing and sizing across themes

## Security Considerations

### Access Control

- Role-based authorization at multiple levels
- Server-side validation of all operations
- Secure API endpoints with proper authentication
- Input validation and sanitization

### Data Protection

- Sensitive operations require additional confirmation
- Audit logging for all administrative actions
- Rate limiting on API endpoints
- Secure data transmission

### Best Practices

- Regular security audits of admin functions
- Principle of least privilege for user roles
- Secure session management
- Protection against common web vulnerabilities
