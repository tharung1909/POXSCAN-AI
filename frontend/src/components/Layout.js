import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/predict',   icon: '◎', label: 'Prediction' },
  { path: '/updates',   icon: '⊡', label: 'Disease Updates' },
  { path: '/community', icon: '◈', label: 'Community' },
  { path: '/settings',  icon: '⊙', label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle, isDark } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarW = collapsed ? 70 : 244;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:99 }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        style={{
          position: 'fixed', left:0, top:0, bottom:0,
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          zIndex: 100, overflow: 'hidden',
        }}
      >
        {/* Logo row */}
        <div style={{
          display:'flex', alignItems:'center', gap:11,
          padding: collapsed ? '22px 16px' : '22px 18px 18px',
          borderBottom: '1px solid var(--border)',
          minHeight: 72,
        }}>
          <div className="anim-float" style={{ flexShrink:0 }}>
            <svg width="30" height="30" viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="14" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
              <circle cx="15" cy="15" r="6"  fill="var(--accent)" opacity="0.15"/>
              <circle cx="15" cy="15" r="3"  fill="var(--accent)"/>
              <circle cx="7"  cy="11" r="2.2" fill="var(--accent-2)" opacity="0.75"/>
              <circle cx="23" cy="11" r="2.2" fill="var(--accent-2)" opacity="0.75"/>
              <circle cx="7"  cy="19" r="2.2" fill="var(--accent-2)" opacity="0.5"/>
              <circle cx="23" cy="19" r="2.2" fill="var(--accent-2)" opacity="0.5"/>
            </svg>
          </div>
          {!collapsed && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{
                fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15,
                letterSpacing:'0.1em',
                background:'linear-gradient(120deg, var(--accent), var(--accent-2))',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>
                POXSCAN
              </div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em', marginTop:1 }}>
                AI PLATFORM
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:11, padding:4, flexShrink:0 }}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:3 }}>
          {NAV.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : ''}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:11,
                padding: collapsed ? '10px 16px' : '10px 13px',
                borderRadius:9,
                color: isActive ? 'var(--sidebar-active-color)' : 'var(--text-3)',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                borderLeft: isActive ? `2px solid var(--accent)` : '2px solid transparent',
                textDecoration:'none',
                fontFamily:'Syne,sans-serif', fontWeight:500, fontSize:13,
                transition:'all 0.18s',
              })}
            >
              <span style={{ fontSize:15, flexShrink:0, width:18, textAlign:'center' }}>{icon}</span>
              {!collapsed && <span style={{ whiteSpace:'nowrap', overflow:'hidden' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User chip */}
        <div style={{
          margin:'8px 10px',
          padding: collapsed ? '10px 8px' : '12px 13px',
          background:'var(--sidebar-hover)',
          borderRadius:10,
          border:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:10,
        }}>
          <div style={{
            width:32, height:32, borderRadius:'50%',
            background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:800, color:'var(--text-inv)',
            fontFamily:'Syne,sans-serif', flexShrink:0,
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user?.username}
                </div>
                <div style={{ fontSize:9, color:'var(--text-3)', textTransform:'uppercase', fontFamily:'Space Mono,monospace', letterSpacing:'0.1em', marginTop:1 }}>
                  {user?.role || 'user'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, flexShrink:0, padding:2 }}
              >
                ↪
              </button>
            </>
          )}
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', marginLeft: sidebarW, minHeight:'100vh', transition:'margin-left 0.28s ease' }}>

        {/* Topbar */}
        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 28px', height:60,
          background:'var(--topbar-bg)',
          backdropFilter:'blur(20px)',
          borderBottom:'1px solid var(--border)',
          position:'sticky', top:0, zIndex:50,
        }}>
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ display:'none', background:'none', border:'none', color:'var(--text-1)', fontSize:20, cursor:'pointer' }}
          >☰</button>

          {/* Breadcrumb label */}
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            POXSCAN AI / {window.location.pathname.replace('/','').toUpperCase() || 'DASHBOARD'}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Live badge */}
            <span className="badge badge-cyan">
              <span style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:'var(--accent)' }}/>
              Live
            </span>

            {/* 🌙/☀ Theme toggle */}
            <button className="theme-toggle" onClick={toggle} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* User chip */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px', borderRadius:10, background:'var(--bg-input)', border:'1px solid var(--border)' }}>
              <div style={{
                width:24, height:24, borderRadius:'50%',
                background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, color:'var(--text-inv)', fontFamily:'Syne,sans-serif',
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ color:'var(--text-2)', fontSize:13 }}>{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex:1, padding:'32px 32px', maxWidth:1380, margin:'0 auto', width:'100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}