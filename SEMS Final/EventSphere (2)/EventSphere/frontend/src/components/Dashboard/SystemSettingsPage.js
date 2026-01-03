import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const [systemSettings, setSystemSettings] = useState(() => JSON.parse(localStorage.getItem('systemSettings')) || {});
  const [logoPreview, setLogoPreview] = useState(systemSettings.logo || '');
  const [coverPreview, setCoverPreview] = useState(systemSettings.defaultCover || '');

  useEffect(() => {
    setSystemSettings(JSON.parse(localStorage.getItem('systemSettings')) || {});
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const form = e.target;
    const emailTemplate = form.emailTemplate.value;
    const notificationMsg = form.notificationMsg.value;
    const websiteName = form.websiteName.value;
    const defaultLanguage = form.defaultLanguage.value;
    const timezone = form.timezone.value;
    const dateFormat = form.dateFormat.value;
    const maintenanceMode = form.maintenanceMode.checked;
    let logo = systemSettings.logo || '';
    let defaultCover = systemSettings.defaultCover || '';
    if (form.logo.files[0]) {
      logo = URL.createObjectURL(form.logo.files[0]);
      setLogoPreview(logo);
    }
    if (form.defaultCover.files[0]) {
      defaultCover = URL.createObjectURL(form.defaultCover.files[0]);
      setCoverPreview(defaultCover);
    }
    const newSettings = {
      emailTemplate,
      notificationMsg,
      websiteName,
      defaultLanguage,
      timezone,
      dateFormat,
      maintenanceMode,
      logo,
      defaultCover
    };
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
    setSystemSettings(newSettings);
    alert('Settings updated!');
    navigate('/dashboard');
  };

  return (
    <div className="system-settings-page">
      <div className="system-settings-header">
        <h2>General System Settings</h2>
        <button className="delete-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
      <form onSubmit={handleSaveSettings} className="modal-form system-settings-form">
        <label>Website Name
          <input name="websiteName" defaultValue={systemSettings.websiteName || ''} required />
        </label>
        <label>Logo
          <input name="logo" type="file" accept="image/*" onChange={e => setLogoPreview(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : logoPreview)} />
          {logoPreview && <img src={logoPreview} alt="Logo" className="settings-logo-preview" />}
        </label>
        <label>Default Event Cover Image
          <input name="defaultCover" type="file" accept="image/*" onChange={e => setCoverPreview(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : coverPreview)} />
          {coverPreview && <img src={coverPreview} alt="Default Cover" className="settings-cover-preview" />}
        </label>
        <label className="maintenance-toggle">
          <input name="maintenanceMode" type="checkbox" defaultChecked={systemSettings.maintenanceMode || false} />
          Maintenance Mode (System temporarily band karne ka option)
        </label>
        <label>Default Language
          <select name="defaultLanguage" defaultValue={systemSettings.defaultLanguage || 'English'}>
            <option value="English">English</option>
            <option value="Urdu">Urdu</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>Timezone
          <select name="timezone" defaultValue={systemSettings.timezone || 'Asia/Karachi'}>
            <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <label>Date Format
          <select name="dateFormat" defaultValue={systemSettings.dateFormat || 'YYYY-MM-DD'}>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </label>
        <label>Email Template
          <textarea name="emailTemplate" rows={3} defaultValue={systemSettings.emailTemplate || ''} />
        </label>
        <label>Notification Message
          <textarea name="notificationMsg" rows={2} defaultValue={systemSettings.notificationMsg || ''} />
        </label>
        <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
          <button type="submit" className="approve-btn">Save</button>
          <button type="button" className="delete-btn" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage; 