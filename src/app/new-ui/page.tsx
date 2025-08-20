import { AppShell } from '@/layout/AppShell';

function Home() {
  return (
    <div>
      <h2>Welcome to the New UI</h2>
      <p>This is the redesigned interface with:</p>
      <ul>
        <li>AppShell layout with Sidebar navigation</li>
        <li>TopBar with search and theme controls</li>
        <li>Dockable Chat panel with improved UX</li>
        <li>Message bubbles, quick suggestions, and typing indicators</li>
      </ul>
      <p>Select a lesson or open the chat to get started.</p>
    </div>
  );
}

export default function NewUIPage() {
  return (
    <AppShell>
      <Home />
    </AppShell>
  );
}