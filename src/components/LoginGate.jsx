import { useState } from 'react';

export default function LoginGate({ onLogin }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    onLogin(email.trim().toLowerCase());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-slate-800">ESTRA Research Workspace</h2>
        <p className="mb-6 text-sm text-slate-600">Use your email to join the shared collaborative environment.</p>
        <label className="mb-2 block text-xs uppercase tracking-wide text-slate-500">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="researcher@institution.org"
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
        >
          Enter Platform
        </button>
      </form>
    </div>
  );
}
