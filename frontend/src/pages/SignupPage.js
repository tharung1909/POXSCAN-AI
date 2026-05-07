import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.card}
        className="glass-bright"
      >
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

        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.sub}>Join the medical AI network</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { key: 'username', label: 'Username', type: 'text', placeholder: 'Dr. Smith' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'doctor@hospital.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                className="input"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
              />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
            {loading ? <><span className="spinner" />Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
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
    marginBottom: 28,
    gap: 8,
  },
  logoCircle: { animation: 'float 3s ease-in-out infinite' },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: '0.12em',
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
  sub: { color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' },
  footer: { marginTop: 24, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' },
  link: { color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 },
};
