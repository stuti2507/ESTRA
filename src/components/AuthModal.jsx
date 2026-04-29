import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthModal({ session, onClose, onStatus }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!supabase) {
      onStatus('Supabase is not configured.');
      return;
    }

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) return onStatus(error.message);
      if (data?.session) {
        onStatus('Signup successful. You are now logged in.');
        onClose();
        return;
      }
      setPendingEmail(email);
      onStatus('Account created. Confirm your email before login.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return onStatus(error.message);
    onStatus('Logged in successfully.');
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <form className="auth-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{mode === 'signup' ? 'Create account' : 'Login'}</h3>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{mode === 'signup' ? 'Sign Up' : 'Login'}</button>
        <button type="button" className="link-btn" onClick={() => setMode((m) => (m === 'signup' ? 'login' : 'signup'))}>
          {mode === 'signup' ? 'Already have an account? Login' : 'Need an account? Sign up'}
        </button>
        {pendingEmail && (
          <button
            type="button"
            className="link-btn"
            onClick={async () => {
              if (!supabase) return;
              const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail, options: { emailRedirectTo: window.location.origin } });
              onStatus(error ? error.message : `Confirmation email re-sent to ${pendingEmail}.`);
            }}
          >
            Resend confirmation email
          </button>
        )}
        {session && <small>Logged in as {session.user.email}</small>}
      </form>
    </div>
  );
}
