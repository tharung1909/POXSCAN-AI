import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { statsAPI, updatesAPI } from '../services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

function StatCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="card"
      style={{ ...styles.statCard, borderColor: `${color}30` }}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}20` }}
    >
      <div style={{ ...styles.statIcon, background: `${color}18`, color }}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value ?? '—'}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    statsAPI.get().then(r => setStats(r.data)).catch(() => {});
    updatesAPI.getAll().then(r => setUpdates(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.heroBanner}
      >
        <div style={styles.heroBannerBg} />
        <div style={styles.heroBannerContent}>
          <div>
            <div style={styles.heroBadge} className="badge badge-cyan">
              ● AI-Powered Detection
            </div>
            <h1 style={styles.heroTitle}>
              Welcome back, <span className="gradient-text">{user?.username}</span>
            </h1>
            <p style={styles.heroSub}>
              POXSCAN AI uses deep learning to detect monkeypox from skin lesion images with up to 91% accuracy. Upload an image to get instant multi-model analysis with Grad-CAM explainability.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/predict')}>
                ◎ Run Prediction
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/updates')}>
                View Disease Updates →
              </button>
            </div>
          </div>
          <div style={styles.heroVisual}>
            <div style={styles.dnaRing}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="#38bdf8" strokeWidth="0.5" fill="none" strokeDasharray="4 8" />
                <circle cx="80" cy="80" r="55" stroke="#2dd4bf" strokeWidth="0.5" fill="none" strokeDasharray="2 6" />
                <circle cx="80" cy="80" r="40" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.4" />
                <circle cx="80" cy="80" r="18" fill="#38bdf8" opacity="0.1" />
                <circle cx="80" cy="80" r="8" fill="#38bdf8" opacity="0.8" />
                {[0,60,120,180,240,300].map((deg, i) => {
                  const r = 55, rad = (deg * Math.PI) / 180;
                  const x = 80 + r * Math.cos(rad), y = 80 + r * Math.sin(rad);
                  return <circle key={i} cx={x} cy={y} r="4" fill="#2dd4bf" opacity="0.7" />;
                })}
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <StatCard icon="🔬" label="Total Predictions" value={stats?.total_predictions ?? 0} color="#38bdf8" delay={0} />
        <StatCard icon="🦠" label="Monkeypox Cases" value={stats?.monkeypox_cases ?? 0} color="#fb7185" delay={1} />
        <StatCard icon="✅" label="Normal Cases" value={stats?.normal_cases ?? 0} color="#34d399" delay={2} />
        <StatCard icon="👥" label="Active Users" value={stats?.total_users ?? 0} color="#a78bfa" delay={3} />
      </div>

      {/* Main content grid */}
      <div style={styles.mainGrid}>
        {/* Awareness */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
          style={styles.awarenessCard}
        >
          <h2 style={styles.sectionTitle}>🦠 About Monkeypox</h2>
          <div style={styles.symptomGrid}>
            {[
              { icon: '🌡️', title: 'Fever', desc: 'High fever often first sign, typically 38–40°C' },
              { icon: '📍', title: 'Skin Rash', desc: 'Progresses from flat lesions to raised bumps and blisters' },
              { icon: '🔵', title: 'Lymph Nodes', desc: 'Swollen lymph nodes — key differentiator from smallpox' },
              { icon: '💪', title: 'Muscle Aches', desc: 'Body pain, chills, exhaustion in early stages' },
              { icon: '🎯', title: 'Lesions', desc: 'Deep-seated, well-defined lesions on face, palms, soles' },
              { icon: '⏱️', title: 'Duration', desc: '2–4 weeks illness duration; usually self-limiting' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={styles.symptomItem}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <div>
                  <div style={styles.symptomTitle}>{title}</div>
                  <div style={styles.symptomDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.preventionBox}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 12, color: 'var(--emerald)' }}>
              🛡️ Prevention Tips
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Avoid skin-to-skin contact with infected persons', 'Practice frequent handwashing', 'Use PPE in healthcare settings', 'Get vaccinated if eligible', 'Avoid handling wild animals', 'Isolate if symptomatic'].map(tip => (
                <span key={tip} style={styles.tipChip}>{tip}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Updates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📡 Latest Updates</h2>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/updates')}>
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {updates.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="card"
                style={styles.updateCard}
              >
                <div style={styles.updateHeader}>
                  <span style={{ fontSize: 20 }}>{u.icon}</span>
                  <span className={`badge ${u.severity === 'critical' ? 'badge-rose' : u.severity === 'high' ? 'badge-amber' : 'badge-emerald'}`}>
                    {u.severity}
                  </span>
                </div>
                <div style={styles.updateTitle}>{u.title}</div>
                <div style={styles.updateSummary}>{u.summary.substring(0, 100)}...</div>
                <div style={styles.updateMeta}>
                  <span className="badge badge-violet">{u.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {new Date(u.date).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="card"
            style={{ marginTop: 16 }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 14, color: 'var(--text-secondary)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '◎', label: 'Upload & Analyze Image', path: '/predict', color: '#38bdf8' },
                { icon: '💬', label: 'View Community Reviews', path: '/community', color: '#a78bfa' },
                { icon: '📊', label: 'Disease Updates', path: '/updates', color: '#2dd4bf' },
              ].map(({ icon, label, path, color }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{ ...styles.quickAction, color }}
                >
                  <span>{icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  heroBanner: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    border: '1px solid rgba(56,189,248,0.15)',
  },
  heroBannerBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(45,212,191,0.05) 50%, rgba(167,139,250,0.06) 100%)',
    zIndex: 0,
  },
  heroBannerContent: {
    position: 'relative',
    zIndex: 1,
    padding: '40px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  heroBadge: { marginBottom: 12, display: 'inline-flex' },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 28,
    lineHeight: 1.2,
    marginBottom: 12,
  },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: 14,
    maxWidth: 520,
    lineHeight: 1.7,
  },
  heroVisual: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dnaRing: { animation: 'rotate 20s linear infinite' },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 26,
    color: 'var(--text-primary)',
  },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 17,
    color: 'var(--text-primary)',
    marginBottom: 20,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  awarenessCard: { padding: 28 },
  symptomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20,
  },
  symptomItem: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: '10px 12px',
    background: 'rgba(56,189,248,0.04)',
    borderRadius: 10,
    border: '1px solid rgba(56,189,248,0.08)',
  },
  symptomTitle: {
    fontWeight: 600,
    fontSize: 13,
    color: 'var(--text-primary)',
    marginBottom: 2,
  },
  symptomDesc: { fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 },
  preventionBox: {
    padding: 16,
    background: 'rgba(52,211,153,0.04)',
    border: '1px solid rgba(52,211,153,0.15)',
    borderRadius: 12,
  },
  tipChip: {
    background: 'rgba(52,211,153,0.08)',
    color: '#34d399',
    border: '1px solid rgba(52,211,153,0.2)',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 11,
  },
  updateCard: {
    padding: 16,
  },
  updateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 14,
    color: 'var(--text-primary)',
    marginBottom: 6,
  },
  updateSummary: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  updateMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s',
  },
};
