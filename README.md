# Todo PWA

A minimal, production-ready Progressive Web App (PWA) that demonstrates full offline mode for a Todo list using React + TypeScript + Vite + IndexedDB.

## Features

- ✅ **Offline-First**: Works completely offline with IndexedDB storage
- ✅ **Background Sync**: Automatically syncs changes when back online
- ✅ **Installable**: Can be installed as a native app
- ✅ **Update Notifications**: Notifies when new versions are available
- ✅ **Connection Awareness**: Shows online/offline status
- ✅ **Clean Architecture**: Organized with pages, services, hooks, and context

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite (build tool)
- React Router
- Tailwind CSS

### PWA Features

- vite-plugin-pwa
- IndexedDB (idb)
- Workbox
- Service Worker

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd todo
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Configuration

The app uses environment variables for API configuration:

- `.env.development`: `VITE_API_BASE_URL=http://localhost:3000`
- `.env.production`: `VITE_API_BASE_URL=https://api.example.com`

## PWA Features

### Offline Functionality

- All todo data is stored locally in IndexedDB
- App works completely offline
- Changes are queued and synced when back online

### Background Sync

- Uses Service Worker sync events
- Falls back to online event listeners
- Automatically retries failed sync operations

### Install Prompt

- Shows install button when PWA is installable
- Works on desktop and mobile browsers
- Creates native app-like experience

### Update Notifications

- Detects when new service worker is available
- Shows update toast with reload option
- Seamless app updates

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── TodoList.tsx    # Todo list display
│   ├── TodoForm.tsx    # Add/edit todo form
│   ├── OfflineBadge.tsx # Online/offline indicator
│   ├── InstallButton.tsx # PWA install button
│   └── UpdateToast.tsx # Update notification
├── context/            # React context providers
│   └── PWAContext.tsx  # PWA state management
├── hooks/              # Custom React hooks
│   ├── useTodos.ts     # Todo CRUD operations
│   ├── useOnlineStatus.ts # Network status
│   └── usePWA.ts       # PWA functionality
├── pages/              # Page components
│   ├── Home.tsx        # Main todo page
│   └── About.tsx       # About page
├── services/           # Business logic
│   ├── api.ts          # Simulated API client
│   ├── db.ts           # IndexedDB operations
│   ├── sync.ts         # Background sync logic
│   └── pwa.ts          # PWA registration
└── routes.tsx          # React Router setup
```

## API Simulation

The app includes a simulated API service that:

- Uses environment-based URLs
- Simulates network latency and failures
- Returns mock data structured like real NestJS endpoints
- Fails gracefully when offline

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Deploy with default settings
4. PWA features work automatically

### Other Platforms

The app is a standard static site and can be deployed to any static hosting service.

## Browser Support

- Chrome/Edge: Full PWA support
- Firefox: Full PWA support
- Safari: Full PWA support (iOS 11.3+)
- Background sync: Chrome/Edge only (with fallback)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### PWA Testing

The development server includes PWA features for testing:

- Service worker registration
- Manifest generation
- Install prompts
- Update notifications

## License

MIT License
