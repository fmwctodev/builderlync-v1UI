# BuilderLync - Unified Platform

A comprehensive construction management platform that combines multiple specialized modules into a single, cohesive application.

## Modules

### 1. ABC Supply
Supply chain management and contractor portal functionality.

### 2. CRM
Customer relationship management system for tracking leads, customers, and sales pipeline.

### 3. Marketing
Marketing automation and campaign management tools.

### 4. Project Management
Project tracking, task management, and team collaboration features.

### 5. Edge View
Advanced analytics and reporting dashboard with business intelligence.

### 6. Roof Runner
Specialized roofing project management and tracking system.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Development

### Project Structure
```
src/
├── modules/           # Individual module implementations
│   ├── abc-supply/
│   ├── crm/
│   ├── marketing/
│   ├── project-management/
│   ├── edge-view/
│   └── roof-runner/
├── shared/           # Shared components and utilities
│   ├── components/
│   ├── types/
│   ├── utils/
│   └── context/
└── App.tsx          # Main application component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (for modules that require it)
- **Icons**: Lucide React

## Contributing

Each module can be developed independently while maintaining the unified structure. When adding new features:

1. Keep module-specific code within the respective module directory
2. Use shared components and utilities when possible
3. Follow the established routing patterns
4. Maintain consistent styling with Tailwind CSS

## License

Private - All rights reserved
