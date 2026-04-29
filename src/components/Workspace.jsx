import { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import FlagshipProjectPanel from './FlagshipProjectPanel';
import GeopoliticsTrackerPanel from './GeopoliticsTrackerPanel';
import InsightsSignalsPanel from './InsightsSignalsPanel';

export default function Workspace({ session, userRole, onExit, onLogout }) {
  const [activeSection, setActiveSection] = useState('flagship');
  const [statusMessage, setStatusMessage] = useState('Workspace ready.');
  const [filterStatus, setFilterStatus] = useState('All');

  const [flagshipProject, setFlagshipProject] = useState([
    { id: 1, section_name: 'Overview', content: '', updated_by: '', is_public: false, is_posted: false },
    { id: 2, section_name: 'Cost', content: '', updated_by: '', is_public: false, is_posted: false },
    { id: 3, section_name: 'Prevention', content: '', updated_by: '', is_public: false, is_posted: false },
    { id: 4, section_name: 'Implementation', content: '', updated_by: '', is_public: false, is_posted: false },
  ]);
  const [geopoliticsTracker, setGeopoliticsTracker] = useState([]);
  const [insightsSignals, setInsightsSignals] = useState([]);

  const workspaceView = useMemo(() => {
    if (activeSection === 'geopolitics') {
      return <GeopoliticsTrackerPanel data={geopoliticsTracker} setData={setGeopoliticsTracker} onSaveRow={() => setStatusMessage('Tracker row saved.')} onAddRow={() => setStatusMessage('Tracker row added.')} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />;
    }
    if (activeSection === 'insights') {
      return <InsightsSignalsPanel data={insightsSignals} setData={setInsightsSignals} onSaveItem={() => setStatusMessage('Insight entry saved.')} onCreate={() => setStatusMessage('Insight entry created.')} />;
    }
    return <FlagshipProjectPanel data={flagshipProject} setData={setFlagshipProject} onSave={() => setStatusMessage('Flagship section saved.')} currentUser={session?.user?.email || ''} />;
  }, [activeSection, filterStatus, flagshipProject, geopoliticsTracker, insightsSignals, session]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={activeSection} onChange={setActiveSection} userEmail={session?.user?.email || 'Unknown'} onLogout={onLogout} />
      <main className="flex-1 p-8">
        <div className="mb-5 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">{statusMessage} · Role: {userRole}</div>
        <div className="mb-4 flex gap-2"><button className="btn-solid" onClick={onExit}>Back to Landing</button></div>
        {workspaceView}
      </main>
    </div>
  );
}
