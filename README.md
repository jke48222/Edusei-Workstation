# The Edusei Workstation

An immersive 3D portfolio website built with React Three Fiber, featuring a retro CRT terminal interface and cinematic camera transitions.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How to Use

1. **Terminal View**: The default view shows a working CLI interface on a CRT monitor
2. **Navigate Projects**: Click on projects in the terminal list or type commands:
   - `help` - Show available commands
   - `list` - List all projects
   - `run [project].exe` - Open a specific project
   - `about` - Show profile info
   - `clear` - Clear terminal
3. **Explore Objects**: Click on 3D objects on the desk to view project details
4. **Return**: Click "Back to Terminal" or press ESC to return to the main view

## Project Structure

```
src/
├── App.tsx              # Main app combining Canvas + Overlay
├── store.ts             # Zustand state management
├── data.ts              # Project data and profile info
├── index.css            # Tailwind + custom CRT effects
├── main.tsx             # React entry point
└── components/
    ├── CameraRig.tsx    # Camera transitions with maath easing
    ├── Experience.tsx   # R3F Canvas and 3D scene
    └── Overlay.tsx      # Terminal UI and project cards
```

## Tech Stack

- **Framework**: React + Vite + TypeScript
- **3D**: @react-three/fiber, @react-three/drei
- **Animation**: framer-motion (UI), maath (camera)
- **State**: zustand
- **Styling**: Tailwind CSS

## Customization

### Adding New Projects

Edit `src/data.ts` and add a new entry to `projectsData`:

```typescript
{
  id: 'new-project', // Must match ViewState type
  executable: 'new_project.exe',
  title: 'New Project',
  tagline: 'Brief description',
  period: 'Jan 2024 - Present',
  location: 'Location',
  objectLabel: '3D Object Label',
  accentColor: '#ff0000',
  description: ['Bullet point 1', 'Bullet point 2'],
  techStack: ['Tech1', 'Tech2'],
}
```

Then add the new view state to `src/store.ts` and create a corresponding 3D object in `Experience.tsx`.

### Camera Positions

Modify camera positions in `src/components/CameraRig.tsx`:

```typescript
const cameraConfigs: Record<ViewState, CameraConfig> = {
  monitor: {
    position: new Vector3(0, 1.8, 2.5),
    target: new Vector3(0, 1.2, 0),
  },
  // ... add more views
};
```

## 3D Model Attributions

This project uses the following 3D models under Creative Commons Attribution licenses:

| Model | Creator | License |
|-------|---------|---------|
| [Meta Quest 3](https://skfb.ly/oNCEG) | Elin | [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |
| [Capital One](https://skfb.ly/px9vD) | Laurance Animations | [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |

Additional models (Robot Car, Sleeping Dog, Satellite) are included in `/public/models/`.

---

Jalen Edusei's engineering portfolio
