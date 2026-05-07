import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    userAPI.getPredictions()
      .then(r => setPredictions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile({ username });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.pageTitle}>Settings</h1>
        <p style={styles.pageSub}>Manage your profile, predictions, and account preferences.</p>
      </motion.div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['profile', 'predictions', 'account'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'profile' ? '👤 Profile' : tab === 'predictions' ? '🔬 My Predictions' : '⚙ Account'}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={styles.profileCard} className="card">
            <div style={styles.avatarLarge}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.profileName}>{user?.username}</div>
              <div style={styles.profileEmail}>{user?.email}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <span className="badge badge-violet">{user?.role || 'user'}</span>
                <span className="badge badge-cyan">{user?.predictions_count || 0} predictions</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={styles.cardTitle}>Edit Profile</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, marginTop: 16 }}>
              <div>
                <label style={styles.fieldLabel}>Username</label>
                <input
                  className="input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label style={styles.fieldLabel}>Email</label>
                <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <button className="btn btn-primary" style={{ width: 'fit-content' }} disabled={saving}>
                {saving ? <><span className="spinner" />Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={styles.cardTitle}>Prediction History</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Your AI analysis records</p>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : predictions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔬</div>
              <div style={styles.emptyTitle}>No predictions yet</div>
              <button className="btn btn-primary" onClick={() => navigate('/predict')} style={{ marginTop: 16 }}>
                Run First Prediction
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {predictions.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                  style={styles.predCard}
                >
                  <div style={styles.predLeft}>
                    <div style={styles.predIcon}>
                      {p.final_prediction === 'Monkeypox' ? '⚠️' : '✅'}
                    </div>
                    <div>
                      <div style={styles.predLabel}>
                        <span style={{ color: p.final_prediction === 'Monkeypox' ? '#fb7185' : '#34d399' }}>
                          {p.final_prediction}
                        </span>
                      </div>
                      <div style={styles.predDate}>{new Date(p.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={styles.predModels}>
                    <span className="badge badge-cyan">VGG: {p.vgg_confidence}</span>
                    <span className="badge badge-violet">ResNet: {p.resnet_confidence}</span>
                    <span className="badge badge-emerald">Shuffle: {p.shuffle_confidence}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={styles.cardTitle}>Account Information</h3>
            <div style={styles.infoRows}>
              {[
                { label: 'User ID', value: user?.id },
                { label: 'Role', value: user?.role },
                { label: 'Predictions Made', value: user?.predictions_count || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={styles.infoRow}>
                  <span style={styles.infoLabel}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderColor: 'rgba(251,113,133,0.2)' }}>
            <h3 style={{ ...styles.cardTitle, color: '#fb7185' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '12px 0 20px' }}>
              Logging out will clear your session. Your data will remain saved in the database.
            </p>
            <button className="btn btn-danger" onClick={handleLogout}>
              ↪ Logout
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 },
  pageSub: { color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' },
  tab: {
    padding: '8px 18px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(56,189,248,0.12)',
    color: 'var(--cyan)',
  },
  profileCard: { display: 'flex', alignItems: 'center', gap: 20, padding: 24 },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 800,
    color: '#060b18',
    fontFamily: 'var(--font-display)',
    flexShrink: 0,
  },
  profileName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' },
  profileEmail: { color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 },
  cardTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' },
  fieldLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginBottom: 7 },
  emptyState: { textAlign: 'center', padding: 60 },
  emptyTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-secondary)' },
  predCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', flexWrap: 'wrap', gap: 12 },
  predLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  predIcon: { fontSize: 22 },
  predLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 },
  predDate: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  predModels: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  infoRows: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' },
  infoLabel: { fontSize: 13, color: 'var(--text-secondary)' },
};
