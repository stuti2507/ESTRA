import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import AuthModal from './components/AuthModal';

export default function App() {
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready.');

  useEffect(() => {
    if (!supabase) {
      setStatusMessage('Supabase is not configured. Running in demo mode.');
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const userRole = session?.user?.user_metadata?.role || 'public';

  if (workspaceOpen && session) {
    return (
      <Workspace
        session={session}
        userRole={userRole}
        onExit={() => setWorkspaceOpen(false)}
        onLogout={async () => {
          if (supabase) await supabase.auth.signOut();
          setSession(null);
          setWorkspaceOpen(false);
        }}
      />
    );
  }

  return (
    <>
      <LandingPage
        session={session}
        userRole={userRole}
        statusMessage={statusMessage}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenWorkspace={() => setWorkspaceOpen(true)}
      />
      {authOpen && (
        <AuthModal
          session={session}
          onClose={() => setAuthOpen(false)}
          onStatus={setStatusMessage}
        />
      )}
    </>
  );
}
