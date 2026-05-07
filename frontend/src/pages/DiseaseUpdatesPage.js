import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { updatesAPI } from '../services/api';

const SEVERITY_COLORS = {
  critical: { badge: 'badge-rose', dot: '#fb7185' },
  high: { badge: 'badge-amber', dot: '#fbbf24' },
  medium: { badge: 'badge-cyan', dot: '#38bdf8' },
  low: { badge: 'badge-emerald', dot: '#34d399' },
};

const CATEGORIES = ['All', 'Monkeypox', 'Chickenpox', 'Smallpox', 'Treatment'];

export default function DiseaseUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    updatesAPI.getAll()
      .then(r => setUpdates(r.data))
      .catch(() => setUpdates([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? updates : updates.filter(u => u.category === filter);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="badge badge-amber" style={{ marginBottom: 12, display: 'inline-flex' }}>
          📡 Live Feed
        </div>
        <h1 style={styles.pageTitle}>Disease Updates</h1>
        <p style={styles.pageSub}>Real-time global viral disease alerts and research updates from WHO, CDC, and health organizations.</p>
      </motion.div>

      {/* Alert banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.alertBanner}
      >
        <span style={{ fontSize: 18 }}>🚨</span>
        <div>
          <div style={styles.alertTitle}>Health Advisory Active</div>
          <div style={styles.alertSub}>Elevated monkeypox activity reported in multiple regions. Stay informed and take precautions.</div>
        </div>
        <span className="badge badge-rose">CRITICAL</span>
      </motion.div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            style={{
              ...styles.filterBtn,
              ...(filter === cat ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((u, i) => {
            const sev = SEVERITY_COLORS[u.severity] || SEVERITY_COLORS.low;
            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card"
                style={styles.updateCard}
                whileHover={{ y: -4, borderColor: 'rgba(56,189,248,0.3)' }}
              >
                <div style={styles.cardHeader}>
                  <span style={{ fontSize: 28 }}>{u.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={styles.cardSource}>{u.source}</div>
                    <div style={styles.cardDate}>{new Date(u.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <span className={`badge ${sev.badge}`}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: sev.dot, marginRight: 4 }} />
                    {u.severity}
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{u.title}</h3>
                <p style={styles.cardSummary}>{u.summary}</p>

                <div style={styles.cardFooter}>
                  <span className="badge badge-violet">{u.category}</span>
                  <div style={styles.cardActions}>
                    <button style={styles.actionBtn}>Share ↗</button>
                    <button style={styles.actionBtn}>Details →</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info panels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={styles.infoGrid}
      >
        {[
          {
            title: '🦠 Monkeypox (Mpox)',
            color: '#fb7185',
            points: [
              'Caused by Monkeypox virus (MPXV)',
              'Two clades: Congo Basin (Clade I) & West African (Clade II)',
              'Spread through close skin-to-skin contact',
              'Incubation period: 5–21 days',
              'WHO declared global health emergency in 2022',
            ],
          },
          {
            title: '🐔 Chickenpox (Varicella)',
            color: '#fbbf24',
            points: [
              'Caused by Varicella-zoster virus (VZV)',
              'Highly contagious respiratory illness',
              'Presents with itchy blister-like rash',
              'Vaccine available since 1995 (95% effective)',
              'Can reactivate as shingles in adults',
            ],
          },
          {
            title: '⚰️ Smallpox History',
            color: '#a78bfa',
            points: [
              'Caused by Variola virus – now eradicated',
              'Killed ~300 million in the 20th century',
              'Declared eradicated by WHO in 1980',
              'Last natural case: 1977 in Somalia',
              'Vaccination protects ~85% against monkeypox',
            ],
          },
        ].map(({ title, color, points }) => (
          <div key={title} className="card" style={{ ...styles.infoCard, borderColor: `${color}20` }}>
            <h3 style={{ ...styles.infoTitle, color }}>{title}</h3>
            <ul style={styles.infoList}>
              {points.map(p => (
                <li key={p} style={styles.infoItem}>
                  <span style={{ color, marginRight: 8 }}>▸</span>{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 },
  pageSub: { color: 'var(--text-secondary)', fontSize: 14, maxWidth: 600, lineHeight: 1.7, marginBottom: 24 },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: 'rgba(251,113,133,0.08)',
    border: '1px solid rgba(251,113,133,0.25)',
    borderRadius: 14,
    marginBottom: 24,
  },
  alertTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fb7185', marginBottom: 3 },
  alertSub: { fontSize: 12, color: 'var(--text-secondary)' },
  filterRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: {
    padding: '7px 16px',
    borderRadius: 20,
    border: '1px solid rgba(56,189,248,0.15)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: 'rgba(56,189,248,0.12)',
    borderColor: 'rgba(56,189,248,0.4)',
    color: 'var(--cyan)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  updateCard: { display: 'flex', flexDirection: 'column', gap: 12 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12 },
  cardSource: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  cardDate: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  cardTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.4 },
  cardSummary: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' },
  cardActions: { display: 'flex', gap: 8 },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'var(--font-body)',
    transition: 'color 0.2s',
    padding: '2px 4px',
  },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  infoCard: { padding: 24 },
  infoTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 },
  infoList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 },
  infoItem: { fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', lineHeight: 1.5 },
};
