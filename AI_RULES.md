# AI Rules for Captain's Boat Tracker

## Tech Stack Overview

- **Next.js 16** with App Router for the React framework and routing
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for styling and responsive design
- **Supabase** for authentication, database, and real-time features
- **Shadcn/ui** for pre-built UI components with Radix UI primitives
- **React Hook Form** with Zod for form validation and management
- **Lucide React** for consistent iconography throughout the app
- **React Hot Toast** for user notifications and feedback
- **Leaflet** with React Leaflet for interactive maps and GPS visualization
- **Next PWA** for Progressive Web App capabilities and offline functionality

## Library Usage Rules

### UI Components
- **ALWAYS** use components from `@/components/ui/` (shadcn/ui) for basic UI elements
- **NEVER** create custom button, input, card, alert, or label components - use the shadcn/ui versions
- **USE** Lucide React icons exclusively for all iconography
- **PREFER** existing shadcn/ui components over custom implementations

### Forms & Validation
- **ALWAYS** use React Hook Form for form management
- **ALWAYS** use Zod schemas for validation with `@hookform/resolvers/zod`
- **NEVER** use controlled inputs without React Hook Form
- **USE** the existing Input, Label, and select components from shadcn/ui

### Authentication & Data
- **ALWAYS** use the `useAuth` hook for authentication operations
- **ALWAYS** use Supabase client for database operations
- **NEVER** implement custom authentication logic
- **USE** the provided TypeScript types from `@/types/database.ts`

### Styling & Layout
- **ALWAYS** use Tailwind CSS classes for styling
- **NEVER** write custom CSS files or inline styles
- **USE** the `cn()` utility function from `@/lib/utils.ts` for conditional classes
- **PREFER** responsive design patterns with Tailwind's responsive prefixes

### Maps & Location
- **ALWAYS** use the `useGPS` hook for GPS functionality
- **USE** Leaflet with React Leaflet for map components
- **NEVER** implement custom GPS tracking without the useGPS hook
- **USE** the utility functions from `@/lib/utils.ts` for distance and bearing calculations

### State Management
- **USE** React hooks (useState, useEffect) for local component state
- **USE** the AuthContext for global authentication state
- **NEVER** use external state management libraries like Redux or Zustand
- **PREFER** lifting state up when sharing between components

### File Structure
- **ALWAYS** place pages in `src/app/` following Next.js App Router conventions
- **ALWAYS** place components in `src/components/`
- **ALWAYS** place hooks in `src/hooks/`
- **ALWAYS** place types in `src/types/`
- **NEVER** create components directly in page files - always extract to components folder

### Error Handling
- **NEVER** use try/catch blocks unless specifically requested
- **LET** errors bubble up to the error boundary or user interface
- **USE** Alert components from shadcn/ui for displaying error messages
- **PROVIDE** clear, user-friendly error messages

### Performance & Optimization
- **USE** React.memo for components that re-render unnecessarily
- **IMPLEMENT** proper loading states with the loading prop from useAuth
- **USE** the provided utility functions for debouncing and throttling
- **AVOID** unnecessary re-renders by proper dependency arrays in useEffect

### Mobile-First Development
- **ALWAYS** design for mobile first, then enhance for larger screens
- **USE** Tailwind's responsive prefixes (md:, lg:, xl:)
- **ENSURE** touch targets are at least 44px for mobile usability
- **TEST** layouts on mobile viewport sizes during development

### Code Quality
- **ALWAYS** use TypeScript for all new files
- **FOLLOW** the existing code style and naming conventions
- **KEEP** components under 100 lines when possible
- **WRITE** descriptive component and function names
- **AVOID** magic numbers and strings - use constants or enums

### PWA & Offline Features
- **USE** the Next PWA configuration for offline capabilities
- **IMPLEMENT** proper offline data handling with localStorage
- **ENSURE** the app works without network connectivity
- **USE** service worker strategies for caching static assets

## Component Creation Rules

1. **Create a new file for every component** - no matter how small
2. **Never add new components to existing files** - always create separate files
3. **Use proper TypeScript props interfaces** for all components
4. **Export components as default** and types as named exports when needed
5. **Include proper JSDoc comments** for complex components
6. **Use the shadcn/ui components as building blocks** - don't reinvent the wheel

## Database & API Rules

1. **Always use the provided TypeScript types** from `src/types/database.ts`
2. **Never make direct API calls** - use the Supabase client
3. **Use the useAuth hook** for all authentication-related operations
4. **Implement proper error handling** for all database operations
5. **Use real-time subscriptions** when live updates are needed
6. **Never expose sensitive data** in the client-side code

## Testing & Quality Assurance

1. **Always test on mobile devices** before considering features complete
2. **Verify GPS functionality** works in different browser environments
3. **Test offline capabilities** by disabling network connectivity
4. **Ensure all forms validate properly** with meaningful error messages
5. **Check responsive behavior** across different screen sizes
6. **Verify authentication flows** work correctly in all scenarios