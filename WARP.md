# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Drop2Smart** is an AI-powered rainwater harvesting assessment platform built as a React single-page application. The application helps users analyze their rooftop's rainwater potential by uploading images and providing building details, then generates comprehensive assessment reports with recommendations for water harvesting systems.

**Key Features:**
- AI-powered rooftop image analysis 
- Rainwater potential calculations based on roof area, slope, and local rainfall data
- Compliance scoring and regulatory insights
- Cost savings and environmental impact projections
- System recommendations for tanks, filtration, and recharge structures
- Dark/light theme support with system preference detection

## Common Development Commands

All commands should be run from the `Frontend/` directory:

```bash
# Install dependencies
npm install

# Start development server (usually runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Development Workflow Commands

```bash
# Check for linting errors before committing
npm run lint

# Build and test production bundle
npm run build && npm run preview
```

## Architecture Overview

### Tech Stack
- **Framework:** React 19+ with Vite build tool
- **Routing:** React Router v7 for client-side routing
- **Styling:** Tailwind CSS with custom design system
- **State Management:** React Context API for theme management
- **Build Tool:** Vite with ESLint integration

### Project Structure

```
Frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── context/       # React Context providers
│   ├── main.jsx       # Application entry point
│   ├── App.jsx        # Root component with routing
│   └── index.css      # Global styles and Tailwind components
├── public/            # Static assets
└── [config files]     # Vite, Tailwind, ESLint configurations
```

### Core Application Flow

1. **Landing Page (`pages/Landing.jsx`)** - Marketing page with animated hero section, features overview, and call-to-action
2. **Assessment Form (`pages/Assessment.jsx`)** - Multi-section form for roof image upload and building details collection
3. **Results Dashboard (`pages/Results.jsx`)** - Tabbed interface showing analysis results, recommendations, and monitoring data

### Key Architectural Patterns

**Context-Based Theme Management:**
- `ThemeContext.jsx` provides global dark/light theme state
- Persists user preference in localStorage
- Respects system color scheme preferences
- Applied via Tailwind's `dark:` modifier classes

**Glass Morphism Design System:**
- Custom Tailwind components for consistent styling
- `.glass` and `.card-glass` utility classes for backdrop blur effects
- Gradient-based primary/secondary button styles
- Custom color palette with primary (teal) and secondary (cyan) variants

**Form State Management:**
- Local component state for form inputs
- File upload with drag-and-drop support
- Client-side validation with loading states
- Navigation state management for passing data between routes

**Responsive Component Architecture:**
- Mobile-first responsive design patterns
- Grid-based layouts with Tailwind breakpoints
- Animated components using CSS-in-JS style props
- Reusable component composition (e.g., `StepCard` in `HowItWorks`)

## Design System Guidelines

### Custom Tailwind Classes
- `.btn-primary`: Gradient primary button with hover effects
- `.btn-secondary`: Glass morphism secondary button
- `.card-glass`: Glass effect card with shadow and hover animations  
- `.text-gradient`: Gradient text using primary/secondary colors
- `.water-ripple`: Animation class for background water effects
- `.floating`: Float animation for decorative elements

### Color Scheme
- **Primary:** Teal shades (50-900) for main CTAs and accents
- **Secondary:** Cyan shades (50-900) for complementary elements
- **Background:** Gradient backgrounds that adapt to light/dark themes

### Animation Patterns
- Typed text effect on landing page hero
- Staggered slide-up animations for content sections
- Floating elements and water ripple effects for thematic consistency
- Smooth transitions for theme switching and hover states

## Development Guidelines

### Component Structure
- Use functional components with hooks
- Implement proper prop validation and default values
- Follow the existing naming convention: PascalCase for components, camelCase for functions
- Keep components focused on single responsibility

### State Management
- Use React Context for global state (theme, user preferences)
- Keep component-level state for form inputs and UI interactions
- Pass data between routes using React Router's state mechanism

### Styling Approach
- Prefer Tailwind utility classes over custom CSS
- Use the established glass morphism design patterns
- Implement responsive design with mobile-first approach
- Follow the existing animation and transition patterns

### File Organization
- Components go in `/components` if reusable across pages
- Page-level components go in `/pages`
- Context providers go in `/context`
- Keep related utilities close to their usage

## Testing and Quality

### Linting Configuration
- ESLint configured with React hooks and React refresh rules
- Custom rule for unused variables (ignores uppercase constants)
- Extends recommended JavaScript and React configurations

### Browser Compatibility
- Modern browser support (ES2020+)
- Responsive design tested across device sizes
- Dark mode support with system preference detection

## Deployment Notes

### Build Process
- Vite handles modern bundling and optimization
- Assets are optimized and fingerprinted for caching
- CSS is processed through PostCSS and Autoprefixer

### Environment Considerations  
- No backend dependencies - purely client-side application
- Static hosting compatible (Netlify, Vercel, etc.)
- All calculations currently done client-side (future API integration points identified)

## Future Development Considerations

### API Integration Points
- Image upload and AI analysis endpoints
- Weather data integration for rainfall calculations  
- User authentication and data persistence
- Real-time monitoring data feeds

### Performance Optimization
- Code splitting opportunities for large components
- Image optimization for uploaded roof photos
- Lazy loading for non-critical animations and effects

### Accessibility Improvements
- ARIA labels for complex interactive elements
- Keyboard navigation support for all functionality
- Color contrast verification for custom color schemes