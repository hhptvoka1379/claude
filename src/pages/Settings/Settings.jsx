import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { exportAll, importAll, clearAll } from '../../data/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Settings.css';

export default function Settings() {
  const { settings, updateSettings, subjects, updateSubject } = useApp();
  const fileInputRef = useRef(null);
  const [showReset, setShowReset] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);

  function handleExportJSON() {
    const data = exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maturita_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export saved as ${a.download}`);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (window.confirm('This will replace all current data. Continue?')) {
          importAll(data);
          toast.success('Data imported successfully. Reloading...');
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    clearAll();
    toast.success('All data cleared. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Font Scaling */}
      <Card className="settings-section">
        <h3>Font Size</h3>
        <p className="text-sm text-muted" style={{ marginBottom: '12px' }}>
          Adjust the base font size across the entire app
        </p>
        <div className="settings-slider-row">
          <span className="text-sm">80%</span>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={settings.font_scale}
            onChange={e => updateSettings({ font_scale: parseFloat(e.target.value) })}
            className="settings-slider"
          />
          <span className="text-sm">140%</span>
          <span className="mono text-sm" style={{ marginLeft: '12px', minWidth: '40px' }}>
            {Math.round(settings.font_scale * 100)}%
          </span>
        </div>
      </Card>

      {/* Exam Date */}
      <Card className="settings-section">
        <h3>Exam Date</h3>
        <Input
          type="date"
          value={settings.exam_date}
          onChange={e => updateSettings({ exam_date: e.target.value })}
          style={{ maxWidth: '200px' }}
        />
      </Card>

      {/* Gamification Toggle */}
      <Card className="settings-section">
        <h3>Gamification</h3>
        <Toggle
          id="gamification"
          label="Enable Pagine, streaks, badges, and collectibles"
          checked={settings.gamification_enabled}
          onChange={v => updateSettings({ gamification_enabled: v })}
        />
      </Card>

      {/* Subject Management */}
      <Card className="settings-section">
        <h3>Subject Management</h3>
        <p className="text-sm text-muted" style={{ marginBottom: '12px' }}>
          Adjust target grades and weights for each subject
        </p>
        <div className="subject-settings-grid">
          {subjects.map(subject => (
            <div key={subject.id} className="subject-setting-row">
              <span className="subject-setting-dot" style={{ background: subject.colour }} />
              <span className="subject-setting-name">{subject.name}</span>
              <div className="subject-setting-field">
                <label className="text-xs text-muted">Target</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={subject.target_grade}
                  onChange={e => updateSubject(subject.id, { target_grade: parseFloat(e.target.value) || 7 })}
                  className="form-input"
                  style={{ width: '70px' }}
                />
              </div>
              <div className="subject-setting-field">
                <label className="text-xs text-muted">Weight</label>
                <input
                  type="number"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={subject.weight}
                  onChange={e => updateSubject(subject.id, { weight: parseFloat(e.target.value) || 1 })}
                  className="form-input"
                  style={{ width: '70px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export / Import */}
      <Card className="settings-section">
        <h3>Data Management</h3>
        <div className="settings-buttons">
          <Button onClick={handleExportJSON}>Export JSON Backup</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import JSON Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </Card>

      {/* Reset */}
      <Card className="settings-section settings-section--danger">
        <h3>Danger Zone</h3>
        <p className="text-sm text-muted" style={{ marginBottom: '12px' }}>
          This will permanently delete all data. Export a backup first.
        </p>
        <Button variant="danger" onClick={() => setShowReset(true)}>Reset All Data</Button>
      </Card>

      <ConfirmDialog
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={handleReset}
        title="Reset All Data?"
        message="This will permanently delete all subjects, exercises, essays, sessions, journal entries, and settings. This cannot be undone."
        confirmLabel="Yes, delete everything"
        danger
      />
    </div>
  );
}
