import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background grid */}
      <div style={styles.grid} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.card}
        className="glass-bright"
      >
        {/* Logo */}
        <div style={styles.logoBlock}>
          <div style={styles.logoCircle}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="19" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
              <circle cx="20" cy="20" r="8" fill="#38bdf8" opacity="0.15" />
              <circle cx="20" cy="20" r="4" fill="#38bdf8" />
              <circle cx="10" cy="14" r="2.5" fill="#2dd4bf" opacity="0.8" />
              <circle cx="30" cy="14" r="2.5" fill="#2dd4bf" opacity="0.8" />
              <circle cx="10" cy="26" r="2.5" fill="#2dd4bf" opacity="0.6" />
              <circle cx="30" cy="26" r="2.5" fill="#2dd4bf" opacity="0.6" />
            </svg>
          </div>
          <h1 style={styles.title} className="gradient-text">POXSCAN AI</h1>
          <p style={styles.subtitle}>Monkeypox Detection Platform</p>
        </div>

        <h2 style={styles.heading}>Sign in</h2>
        <p style={styles.sub}>Enter your credentials to access the platform</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              className="input"
              type="email"
              placeholder="doctor@hospital.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
            {loading ? <><span className="spinner" />Authenticating...</> : 'Sign In →'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Create one</Link>
        </p>

        {/* Demo hint */}
        <div style={styles.demo}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            Demo: admin@poxscan.ai / admin123
          </span>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    zIndex: 0,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: '40px 40px',
    borderRadius: 24,
    position: 'relative',
    zIndex: 1,
  },
  logoBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoCircle: {
    animation: 'float 3s ease-in-out infinite',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: '0.12em',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 22,
    color: 'var(--text-primary)',
    marginBottom: 6,
  },
  sub: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    marginBottom: 28,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' },
  footer: {
    marginTop: 24,
    fontSize: 13,
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  link: {
    color: 'var(--cyan)',
    textDecoration: 'none',
    fontWeight: 600,
  },
  demo: {
    marginTop: 16,
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(56,189,248,0.04)',
    borderRadius: 8,
    border: '1px dashed rgba(56,189,248,0.15)',
  },
};
