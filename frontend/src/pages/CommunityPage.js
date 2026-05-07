import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className="star"
          style={{
            color: star <= (hovered || value) ? '#fbbf24' : 'rgba(255,255,255,0.15)',
            cursor: readonly ? 'default' : 'pointer',
          }}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange && onChange(star)}
        >★</span>
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, comment: '', prediction_label: 'Normal' });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = () => {
    reviewsAPI.getAll()
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await reviewsAPI.post(form);
      toast.success('Review submitted!');
      setForm({ rating: 5, comment: '', prediction_label: 'Normal' });
      loadReviews();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === s).length / reviews.length * 100) : 0,
  }));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="badge badge-violet" style={{ marginBottom: 12, display: 'inline-flex' }}>
          💬 Community
        </div>
        <h1 style={styles.pageTitle}>Community Reviews</h1>
        <p style={styles.pageSub}>Read user experiences and share your feedback on AI prediction accuracy.</p>
      </motion.div>

      <div style={styles.layout}>
        {/* Left: Write review + rating summary */}
        <div>
          {/* Rating summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={styles.summaryCard}
          >
            <h3 style={styles.summaryTitle}>Overall Rating</h3>
            <div style={styles.summaryRow}>
              <div style={styles.bigRating}>{avgRating}</div>
              <div>
                <StarRating value={Math.round(avgRating)} readonly />
                <div style={styles.reviewCount}>{reviews.length} reviews</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              {dist.map(({ star, count, pct }) => (
                <div key={star} style={styles.distRow}>
                  <span style={styles.distStar}>{star}★</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}
                    />
                  </div>
                  <span style={styles.distCount}>{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Write review */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
            style={{ marginTop: 20 }}
          >
            <h3 style={styles.formTitle}>Share Your Experience</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div>
                <div style={styles.fieldLabel}>Rating</div>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <div style={styles.fieldLabel}>Prediction Result</div>
                <select
                  className="input"
                  value={form.prediction_label}
                  onChange={e => setForm(f => ({ ...f, prediction_label: e.target.value }))}
                  style={{ background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Monkeypox">Monkeypox</option>
                </select>
              </div>
              <div>
                <div style={styles.fieldLabel}>Comment</div>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="How accurate was the prediction? Any feedback on the system?"
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? <><span className="spinner" />Submitting...</> : '→ Submit Review'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right: Reviews list */}
        <div>
          <div style={styles.sectionLabel}>
            {reviews.length} Community Reviews
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                  style={styles.reviewCard}
                >
                  <div style={styles.reviewHeader}>
                    <div style={styles.reviewAvatar}>
                      {r.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.reviewUser}>{r.username}</div>
                      <div style={styles.reviewDate}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                    <span className={`badge ${r.prediction_label === 'Monkeypox' ? 'badge-rose' : 'badge-emerald'}`}>
                      {r.prediction_label}
                    </span>
                  </div>
                  <StarRating value={r.rating} readonly />
                  <p style={styles.reviewComment}>{r.comment}</p>
                </motion.div>
              ))}
              {reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  No reviews yet. Be the first!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 8 },
  pageSub: { color: 'var(--text-secondary)', fontSize: 14, maxWidth: 600, lineHeight: 1.7, marginBottom: 28 },
  layout: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' },
  summaryCard: { padding: 24 },
  summaryTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 },
  summaryRow: { display: 'flex', alignItems: 'center', gap: 16 },
  bigRating: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  reviewCount: { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 },
  distRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  distStar: { fontSize: 11, color: 'var(--text-muted)', width: 20, textAlign: 'right', fontFamily: 'var(--font-mono)' },
  distCount: { fontSize: 11, color: 'var(--text-muted)', width: 20, textAlign: 'center', fontFamily: 'var(--font-mono)' },
  formTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginBottom: 7 },
  sectionLabel: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  reviewCard: { padding: 18 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)',
    flexShrink: 0,
  },
  reviewUser: { fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' },
  reviewDate: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  reviewComment: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10 },
};
