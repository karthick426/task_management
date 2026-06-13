# FlowSync AI Task Management

FlowSync AI is a React + Vite productivity workspace with a Kanban board, calendar scheduling, analytics, activity tracking, mock local storage mode, and optional Firebase cloud sync.

## Features

- Kanban task board with drag-and-drop status changes
- Completed progress bar, filters, sorting, and mobile column picker
- Task details drawer with comments and inline editing
- Calendar scheduling with drag-and-drop due dates
- Dashboard metrics, activity timeline, and assignee workload
- Analytics views for completion, priorities, and project breakdowns
- Theme switching for dark, light, and cyberpunk modes
- Local mock mode when Firebase credentials are not configured

## Setup

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Firebase Configuration

Create a `.env` file using `.env.example` as a guide:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

When these values are missing, the app automatically uses local mock storage. Mock data is saved in the browser under `flowsync_*` local storage keys.

## Data Collections

The Firebase mode expects:

- `projects`
- `tasks`
- `activities`

Task comments are stored inside each task document in the `comments` array.

## Notes

- Settings profile and password actions are wired to Firebase when cloud mode is active and to mock users in local mode.
- The dashboard and notification bell use real task/activity data.
- The build may warn about a large bundle; page-level lazy loading is the next step if bundle size becomes important.
