# Keep Moving Forward

Keep Moving Forward is a React + TypeScript workout tracking application designed for an HCI-focused course project.
The app explores how interface design can improve speed, clarity, and motivation when users log workouts.

The project includes two different logging experiences:
- A fast, one-tap logging flow (our primary design)
- A traditional multi-input tracker (used as a comparison/control condition)

Study data from both experiences is stored locally and can be exported for analysis.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

## Project Goals

- Make daily workout tracking quick and low-friction
- Encourage consistency with streaks and progress feedback
- Compare modern streamlined UX vs traditional form-based UX
- Collect usability-study data for performance analysis

## How To Run

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd soen-357-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open in browser

Open the local URL shown in your terminal (typically `http://localhost:5173`).

## How The App Works

### First Launch

Users are guided through a short onboarding flow (`/welcome`) to explain the app concept.
When onboarding is completed, the app stores this state in local storage and redirects to the main dashboard.

### Daily Logging (Primary Interface)

On the dashboard (`/`), users can log workouts with a single action.
This view also shows consistency and motivation feedback (such as streak-related progress) to reinforce repeat use.

### Workout History

The history page (`/history`) shows previously logged entries grouped by day and supports CSV export.
This gives users a simple way to review activity and extract records.

### Traditional Tracker (Comparison Interface)

The compare page (`/compare`) provides a more traditional, multi-field input flow.
This interface is used as the control condition for usability comparison with the one-tap design.

### Study Data View

The study data page (`/study-data`) aggregates metrics from both interfaces, such as:
- session duration
- interaction counts (for the traditional tracker)
- timestamps and interface type

Facilitators can export the collected data to CSV for analysis.

## Available Scripts

- `npm run dev`: Runs the app in development mode with hot reload
- `npm run build`: Type-checks and creates an optimized production build
- `npm run preview`: Serves the production build locally for verification
- `npm run lint`: Runs ESLint checks on the project

## Main Routes

- `/welcome`: Onboarding screens for first-time users
- `/`: Dashboard with one-tap workout logging
- `/history`: Logged workout history and CSV export
- `/compare`: Traditional tracker interface for study comparison
- `/settings`: Reset options for workout data
- `/study-data`: Facilitator view of collected study metrics

## Data & Storage Notes

- The app currently stores workout and study data in browser local storage.
- Onboarding completion is also persisted locally.
- Clearing browser storage or using a different browser profile will reset saved data.

## Team Members

- Kenny Luo-Li — 40237402
- Yassine Hajou — 40284609
- Hawad Ahmad — 40276935
- Jeremy Oroc — 40276001
- Ahmed Eskaf — 40235587
