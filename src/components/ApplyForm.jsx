import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ApplyForm({ onStatus, onLocalSubmit }) {
  const [form, setForm] = useState({ full_name: '', email: '', role: '', institution: '', expertise: '', linkedin_url: '', statement: '', cv_url: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, status: 'pending', created_at: new Date().toISOString() };
    if (supabase) {
      const { error } = await supabase.from('applications').insert(payload);
      if (error) return onStatus(error.message);
    }
    onLocalSubmit(payload);
    onStatus('Application submitted. Admin review pending.');
    setForm({ full_name: '', email: '', role: '', institution: '', expertise: '', linkedin_url: '', statement: '', cv_url: '' });
  };

  return (
    <form className="publish-form" onSubmit={handleSubmit}>
      <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
      <input placeholder="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} required />
      <input placeholder="Institution" value={form.institution} onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))} required />
      <input placeholder="Area of Expertise" value={form.expertise} onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))} required />
      <input placeholder="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm((p) => ({ ...p, linkedin_url: e.target.value }))} required />
      <textarea rows={3} placeholder="Statement of Interest" value={form.statement} onChange={(e) => setForm((p) => ({ ...p, statement: e.target.value }))} required />
      <input placeholder="Optional CV upload URL" value={form.cv_url} onChange={(e) => setForm((p) => ({ ...p, cv_url: e.target.value }))} />
      <button className="btn-solid" type="submit">Submit Application</button>
    </form>
  );
}
