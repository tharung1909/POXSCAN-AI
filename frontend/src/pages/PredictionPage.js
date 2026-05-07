import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { predictAPI } from '../services/api';

/* ══════════════════════════════════════════════════════════════
   CIRCULAR GAUGE
   ══════════════════════════════════════════════════════════════ */
function CircularGauge({ value, color, size = 100, delay = 0 }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2, cy = size / 2;

  const c = color || (value >= 80 ? '#34d399' : value >= 55 ? '#fbbf24' : '#f87171');

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke={c} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
          transition={{ duration:1.2, delay, ease:'easeOut' }}
          style={{ filter:`drop-shadow(0 0 6px ${c}90)` }}
        />
      </svg>
      <div style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      }}>
        <motion.span
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: delay+0.5 }}
          style={{ fontFamily:'Space Mono,monospace', fontWeight:700, fontSize:15, color:c, lineHeight:1 }}
        >
          {Math.round(value)}%
        </motion.span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPEEDOMETER (half-arc)
   ══════════════════════════════════════════════════════════════ */
function Speedometer({ value, name, isMpox }) {
  const W = 190, H = 105;
  const cx = W / 2, cy = H - 8;
  const r = 76;
  const toRad = d => (d * Math.PI) / 180;

  const pt = (deg, dist) => ({
    x: cx + dist * Math.cos(toRad(deg)),
    y: cy + dist * Math.sin(toRad(deg)),
  });

  const arc = (s, e) => {
    const sp = pt(s, r), ep = pt(e, r);
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 0 1 ${ep.x} ${ep.y}`;
  };

  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setAnim(value), 250); return () => clearTimeout(t); }, [value]);

  const needleAngle = 180 - (anim / 100) * 180;
  const np = pt(needleAngle, r - 16);
  const mainColor = isMpox ? '#f87171' : '#34d399';

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Zone tracks */}
        {[
          { s:180, e:120, c:'#34d399' },
          { s:120, e: 60, c:'#fbbf24' },
          { s: 60, e:  0, c:'#f87171' },
        ].map((z,i) => (
          <path key={i} d={arc(z.s, z.e)} fill="none" stroke={z.c} strokeWidth={9} strokeLinecap="round" opacity={0.18}/>
        ))}
        {/* Filled track */}
        <motion.path
          d={arc(180, 180 - (value/100)*180)}
          fill="none" stroke={mainColor} strokeWidth={9} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 7px ${mainColor}90)` }}
          initial={{ pathLength:0 }}
          animate={{ pathLength:1 }}
          transition={{ duration:1.3, ease:'easeOut', delay:0.2 }}
        />
        {/* Tick marks */}
        {[0,25,50,75,100].map(t => {
          const a = 180 - (t/100)*180;
          const i = pt(a, r-15), o = pt(a, r-5);
          return <line key={t} x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke="rgba(255,255,255,0.18)" strokeWidth={1.5}/>;
        })}
        {/* Labels */}
        {[{t:0,l:'0'},{t:50,l:'50'},{t:100,l:'100'}].map(({t,l}) => {
          const a = 180-(t/100)*180;
          const p = pt(a, r+13);
          return <text key={t} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={7.5} fill="rgba(255,255,255,0.28)" fontFamily="Space Mono,monospace">{l}</text>;
        })}
        {/* Needle */}
        <motion.line
          x1={cx} y1={cy} x2={pt(180, r-16).x} y2={cy}
          stroke={mainColor} strokeWidth={2.5} strokeLinecap="round"
          animate={{ x2: np.x, y2: np.y }}
          transition={{ duration:1.3, ease:'easeOut', delay:0.2 }}
          style={{ filter:`drop-shadow(0 0 4px ${mainColor})` }}
        />
        <circle cx={cx} cy={cy} r={5} fill={mainColor} style={{ filter:`drop-shadow(0 0 6px ${mainColor})` }}/>
        {/* Value */}
        <text x={cx} y={cy-30} textAnchor="middle" fontSize={20} fontWeight={700} fill={mainColor} fontFamily="Space Mono,monospace">
          {Math.round(value)}%
        </text>
        <text x={cx} y={cy-14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.35)" fontFamily="Space Mono,monospace">
          CONFIDENCE
        </text>
      </svg>
      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, color:'var(--text-1)', marginTop:2 }}>
        {name}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODEL CARD  — row with circular gauge + segmented bar
   ══════════════════════════════════════════════════════════════ */
function ModelCard({ name, label, confidence, accuracy, delay }) {
  const isMpox  = label === 'Monkeypox';
  const confNum = parseFloat(confidence) || 0;
  const accNum  = parseFloat(accuracy)   || 0;
  const tier    = confNum >= 90 ? 'Very High' : confNum >= 75 ? 'High' : confNum >= 55 ? 'Moderate' : 'Low';
  const tierCol = confNum >= 90 ? '#34d399'  : confNum >= 75 ? '#2ee8c8' : confNum >= 55 ? '#fbbf24' : '#f87171';
  const barCol  = isMpox ? 'var(--rose)' : 'var(--emerald)';
  const gaugeCol = isMpox
    ? (confNum >= 75 ? '#f87171' : '#fbbf24')
    : '#34d399';

  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      style={{
        padding:'16px 18px', borderRadius:13,
        border:`1px solid ${isMpox ? 'rgba(248,113,113,0.22)' : 'rgba(52,211,153,0.22)'}`,
        background: isMpox
          ? 'linear-gradient(135deg,rgba(248,113,113,0.05),transparent)'
          : 'linear-gradient(135deg,rgba(52,211,153,0.05),transparent)',
        display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'center',
      }}
    >
      {/* Info column */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, color:'var(--text-1)' }}>{name}</span>
          <span className={`badge ${isMpox ? 'badge-rose' : 'badge-emerald'}`}>{isMpox ? '⚠ ' : '✓ '}{label}</span>
        </div>

        {/* Confidence segmented bar */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.09em' }}>Confidence</span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:12, fontWeight:700, color:barCol }}>{confidence}</span>
              <span style={{
                fontFamily:'Space Mono,monospace', fontSize:8, color:tierCol,
                background:`${tierCol}18`, border:`1px solid ${tierCol}40`,
                borderRadius:20, padding:'1px 7px',
              }}>{tier}</span>
            </div>
          </div>
          {/* Bar with zone dividers */}
          <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden', position:'relative' }}>
            {[33,66].map(p => (
              <div key={p} style={{
                position:'absolute', top:0, bottom:0, left:`${p}%`,
                width:1, background:'rgba(255,255,255,0.18)', zIndex:1,
              }}/>
            ))}
            <motion.div
              initial={{ width:0 }} animate={{ width:`${confNum}%` }}
              transition={{ delay:delay+0.2, duration:1.1, ease:'easeOut' }}
              style={{
                height:'100%', borderRadius:4,
                background: confNum >= 80 ? 'linear-gradient(90deg,#34d399,#2ee8c8)'
                          : confNum >= 55 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                          :                 'linear-gradient(90deg,#f87171,#ef4444)',
                boxShadow:`0 0 10px ${barCol}50`,
              }}
            />
          </div>
          {/* Legend */}
          <div style={{ display:'flex', gap:10, marginTop:5 }}>
            {[{l:'Low',c:'#f87171'},{l:'Moderate',c:'#fbbf24'},{l:'High',c:'#34d399'}].map(z=>(
              <div key={z.l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:z.c }}/>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:8, color:'var(--text-3)' }}>{z.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy bar */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.09em' }}>Model Accuracy</span>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--violet)' }}>{accuracy}</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
            <motion.div
              initial={{ width:0 }} animate={{ width:`${accNum}%` }}
              transition={{ delay:delay+0.4, duration:1.0, ease:'easeOut' }}
              style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,var(--violet),#7c3aed)' }}
            />
          </div>
        </div>
      </div>

      {/* Circular gauge */}
      <CircularGauge value={confNum} color={gaugeCol} size={95} delay={delay+0.3} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   OVERVIEW PANEL  — three speedometers + average bar
   ══════════════════════════════════════════════════════════════ */
function OverallPanel({ result }) {
  const models = [
    { name:'VGG16',           conf:parseFloat(result.vgg_confidence),    label:result.vgg_prediction,    isMpox:result.vgg_prediction    ==='Monkeypox' },
    { name:'ResNet18',        conf:parseFloat(result.resnet_confidence),  label:result.resnet_prediction, isMpox:result.resnet_prediction ==='Monkeypox' },
    { name:'ShuffleNet+CBAM', conf:parseFloat(result.shuffle_confidence), label:result.shuffle_prediction,isMpox:result.shuffle_prediction==='Monkeypox' },
  ];
  const avg = Math.round(models.reduce((s,m)=>s+m.conf,0)/3);
  const finalMpox = result.final_prediction === 'Monkeypox';
  const avgTier = avg>=80?'VERY HIGH':avg>=65?'HIGH':avg>=50?'MODERATE':'LOW';
  const avgCol  = avg>=80?'#34d399':avg>=65?'#2ee8c8':avg>=50?'#fbbf24':'#f87171';

  return (
    <motion.div
      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.04 }}
      className="card" style={{ marginBottom:14 }}
    >
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>
        Confidence Overview — All Models
      </div>

      {/* Speedometers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
        {models.map((m,i) => (
          <motion.div key={m.name}
            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.1 }}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              padding:'12px 6px 10px', borderRadius:12,
              background:'rgba(255,255,255,0.03)',
              border:`1px solid ${m.isMpox?'rgba(248,113,113,0.18)':'rgba(52,211,153,0.18)'}`,
              gap:8,
            }}
          >
            <Speedometer value={m.conf} name={m.name} isMpox={m.isMpox} />
            <span className={`badge ${m.isMpox?'badge-rose':'badge-emerald'}`}>
              {m.isMpox?'⚠ ':'✓ '}{m.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Average bar */}
      <div style={{
        padding:'13px 16px', borderRadius:10,
        background: finalMpox?'rgba(248,113,113,0.07)':'rgba(52,211,153,0.07)',
        border:`1px solid ${finalMpox?'rgba(248,113,113,0.2)':'rgba(52,211,153,0.2)'}`,
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.09em' }}>
            Average Confidence
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:'Space Mono,monospace', fontWeight:700, fontSize:18,
              color:finalMpox?'var(--rose)':'var(--emerald)' }}>
              {avg}%
            </span>
            <span style={{
              fontFamily:'Space Mono,monospace', fontSize:9, color:avgCol,
              background:`${avgCol}18`, border:`1px solid ${avgCol}40`,
              borderRadius:20, padding:'2px 9px',
            }}>{avgTier}</span>
          </div>
        </div>
        <div style={{ height:11, background:'rgba(255,255,255,0.06)', borderRadius:6, overflow:'hidden' }}>
          <motion.div
            initial={{ width:0 }} animate={{ width:`${avg}%` }}
            transition={{ duration:1.4, ease:'easeOut', delay:0.4 }}
            style={{
              height:'100%', borderRadius:6,
              background: finalMpox
                ? 'linear-gradient(90deg,#f87171,#fbbf24)'
                : 'linear-gradient(90deg,#34d399,#2ee8c8)',
              boxShadow: finalMpox
                ? '0 0 14px rgba(248,113,113,0.45)'
                : '0 0 14px rgba(52,211,153,0.45)',
            }}
          />
        </div>

        {/* Low confidence warning */}
        {avg < 60 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
            style={{
              marginTop:11, padding:'9px 13px',
              background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.25)',
              borderRadius:8, fontSize:12, color:'var(--amber)', lineHeight:1.6,
            }}
          >
            ⚠ Low confidence — models are likely running in <strong>demo mode</strong> (no .pth files loaded).
            Copy <code>vgg_model.pth</code>, <code>resnet_model.pth</code>, <code>shufflenet_cbam_model.pth</code> into
            the <code>models/</code> folder, then restart the backend.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCAN ANIMATION
   ══════════════════════════════════════════════════════════════ */
function ScanAnim() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, padding:'50px 0' }}>
      <div style={{ position:'relative', width:88, height:88 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid var(--border-bright)', animation:'scanPulse 1.5s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', inset:10, borderRadius:'50%', border:'2px solid var(--accent)', borderTopColor:'transparent', animation:'spin 0.9s linear infinite' }}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:12, height:12, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 16px var(--accent)' }}/>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:6 }}>Analysing Image</div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-3)' }}>Running VGG16 · ResNet18 · ShuffleNet+CBAM</div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', marginTop:4 }}>Generating Grad-CAM heatmap…</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function PredictionPage() {
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [webcam,  setWebcam]  = useState(false);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const onDrop = useCallback(files => {
    const f = files[0]; if (!f) return;
    setImage(f); setPreview(URL.createObjectURL(f)); setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept:{'image/*':[]}, maxFiles:1 });

  const startWebcam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:true });
      streamRef.current = s; videoRef.current.srcObject = s; setWebcam(true);
    } catch { toast.error('Webcam not accessible'); }
  };

  const captureWebcam = () => {
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(blob => {
      setImage(new File([blob],'webcam.jpg',{type:'image/jpeg'}));
      setPreview(c.toDataURL()); stopWebcam(); setResult(null);
    }, 'image/jpeg');
  };

  const stopWebcam = () => { streamRef.current?.getTracks().forEach(t=>t.stop()); setWebcam(false); };

  const handlePredict = async () => {
    if (!image) return toast.error('Please upload or capture an image first');
    setLoading(true); setResult(null);
    try {
      const fd = new FormData(); fd.append('image', image);
      const res = await predictAPI.predict(fd);
      setResult(res.data); toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Prediction failed. Is the backend running?');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="page-eyebrow">AI Analysis Engine</div>
        <h1 className="page-title">Skin Lesion Analysis</h1>
        <p className="page-sub">
          Upload a skin image. Three deep learning models classify the lesion with live confidence gauges and Grad-CAM visualisation.
        </p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20, alignItems:'start' }}>

        {/* ── LEFT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
          {/* Dropzone */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div {...getRootProps()} style={{
              minHeight:200, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              border: isDragActive ? '2px dashed var(--accent)' : '2px dashed transparent',
              borderRadius:14, background: isDragActive ? 'var(--accent-dim)' : 'transparent', transition:'all 0.2s',
            }}>
              <input {...getInputProps()} />
              {preview
                ? <img src={preview} alt="Preview" style={{ width:'100%', minHeight:200, objectFit:'cover', display:'block' }} />
                : <div style={{ textAlign:'center', padding:30 }}>
                    <div style={{ fontSize:34, marginBottom:10 }}>{isDragActive ? '📂' : '🖼️'}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:13, color:'var(--text-1)', marginBottom:5 }}>
                      {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>PNG · JPG · WEBP</div>
                  </div>
              }
            </div>
          </div>

          <button className="btn btn-ghost" style={{ justifyContent:'center', width:'100%' }}
            onClick={webcam ? captureWebcam : startWebcam}>
            {webcam ? '📸 Capture Photo' : '📷 Use Webcam'}
          </button>
          {webcam && <button className="btn btn-danger" style={{ justifyContent:'center', width:'100%' }} onClick={stopWebcam}>✕ Cancel</button>}
          <video ref={videoRef} autoPlay playsInline style={{ display:webcam?'block':'none', width:'100%', borderRadius:10, border:'1px solid var(--border)' }}/>
          <canvas ref={canvasRef} style={{ display:'none' }}/>

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'13px' }}
              onClick={handlePredict} disabled={loading || !image}>
              {loading ? <><span className="spinner"/>Analysing…</> : '◎  Analyse Image'}
            </button>
            {(image||result) && <button className="btn btn-ghost" onClick={()=>{setImage(null);setPreview(null);setResult(null);}}>Reset</button>}
          </div>

          {/* Model accuracy strip */}
          <div className="card" style={{ padding:14 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>
              Model Accuracies
            </div>
            {[{n:'VGG16',a:87.5},{n:'ResNet18',a:85.2},{n:'ShuffleNet+CBAM',a:91.3}].map((m,i)=>(
              <div key={m.n} style={{ marginBottom:i<2?10:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:12, color:'var(--text-1)' }}>{m.n}</span>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--violet)' }}>{m.a}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${m.a}%`, background:'linear-gradient(90deg,var(--violet),#7c3aed)' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div>
          <AnimatePresence mode="wait">

            {loading && (
              <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="card">
                <ScanAnim />
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="results" initial={{ opacity:0 }} animate={{ opacity:1 }}>

                {/* Verdict */}
                <motion.div
                  initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  className="card"
                  style={{
                    marginBottom:14,
                    borderColor: result.final_prediction==='Monkeypox' ? 'rgba(248,113,113,0.4)' : 'rgba(52,211,153,0.4)',
                    background:  result.final_prediction==='Monkeypox'
                      ? 'linear-gradient(135deg,rgba(248,113,113,0.08),transparent)'
                      : 'linear-gradient(135deg,rgba(52,211,153,0.08),transparent)',
                  }}
                >
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                    Majority Vote — Final Diagnosis
                  </div>
                  <div style={{
                    fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:26,
                    color: result.final_prediction==='Monkeypox' ? 'var(--rose)' : 'var(--emerald)',
                    marginBottom:8,
                  }}>
                    {result.final_prediction==='Monkeypox' ? '⚠  Monkeypox Detected' : '✓  Normal — No Monkeypox'}
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
                    {result.final_prediction==='Monkeypox'
                      ? 'Monkeypox indicators detected. Please consult a healthcare professional immediately.'
                      : 'No monkeypox indicators detected across all three models.'}
                  </div>
                </motion.div>

                {/* Speedometer panel */}
                <OverallPanel result={result} />

                {/* Per-model cards */}
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>
                  Detailed Model Breakdown
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                  <ModelCard name="VGG16"            label={result.vgg_prediction}     confidence={result.vgg_confidence}     accuracy={result.vgg_accuracy}     delay={0.05}/>
                  <ModelCard name="ResNet18"          label={result.resnet_prediction}  confidence={result.resnet_confidence}  accuracy={result.resnet_accuracy}  delay={0.12}/>
                  <ModelCard name="ShuffleNet + CBAM" label={result.shuffle_prediction} confidence={result.shuffle_confidence} accuracy={result.shuffle_accuracy} delay={0.20}/>
                </div>

                {/* Grad-CAM */}
                {result.gradcam_image && (
                  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }} className="card">
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Grad-CAM Explainability</div>
                    <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6, marginBottom:14 }}>
                      Red/yellow = high model attention · Blue/cyan = low attention
                    </p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Original</div>
                        <img src={preview} alt="Original" style={{ width:'100%', borderRadius:10, border:'1px solid var(--border)', objectFit:'cover', aspectRatio:'1/1' }}/>
                      </div>
                      <div>
                        <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Grad-CAM Heatmap</div>
                        <div style={{ position:'relative' }}>
                          <img src={`data:image/png;base64,${result.gradcam_image}`} alt="Grad-CAM"
                            style={{ width:'100%', borderRadius:10, border:'1px solid var(--border-mid)', objectFit:'cover', aspectRatio:'1/1' }}
                            onError={e=>{ e.target.style.display='none'; }}/>
                          <div style={{
                            position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
                            display:'flex', alignItems:'center', gap:6,
                            background:'rgba(0,0,0,0.65)', borderRadius:6, padding:'3px 8px',
                          }}>
                            <div style={{ width:50, height:5, borderRadius:3, background:'linear-gradient(90deg,#00f,#0ff,#0f0,#ff0,#f00)' }}/>
                            <span style={{ fontFamily:'Space Mono,monospace', fontSize:8, color:'#fff' }}>LOW → HIGH</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div style={{ marginTop:12, textAlign:'center' }}>
                  <a href="/community" className="btn btn-ghost" style={{ display:'inline-flex' }}>💬 Leave a Community Review</a>
                </div>
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} className="card"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:380, textAlign:'center' }}>
                <div style={{ fontSize:44, marginBottom:16 }}>🔬</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:19, color:'var(--text-1)', marginBottom:8 }}>Ready to Analyse</div>
                <div style={{ fontSize:13, color:'var(--text-2)', maxWidth:270, lineHeight:1.6 }}>Upload or capture a skin lesion image and click Analyse Image.</div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}