import { useState, useMemo } from 'react';

export default function Dropdown({ value, onChange, label = 'Expires' }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = useMemo(() => [
    { label: '30 minutes', value: '30', icon: '◆' },
    { label: '1 hour', value: '60', icon: '◆' },
    { label: '24 hours', value: '1440', icon: '◆' },
    { label: '7 days', value: '10080', icon: '◆' },
  ], []);

  const currentLabel = useMemo(() => {
    const found = menuItems.find((m) => m.value === String(value));
    return found ? found.label : '24 hours';
  }, [menuItems, value]);

  return (
    <div className="dropdown5-container">
      <style>{` 
      .dropdown5-container { position: relative; display: inline-block; }
      .dropdown5-trigger { background: transparent; color: #60a5fa; border: 2px solid #1e3a8a; padding: 10px 18px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.4s ease; position: relative; overflow: hidden; text-transform: uppercase; letter-spacing: 1px; display:flex; gap:8px; align-items:center }
      .dropdown5-trigger-bg { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, #1e3a8a, #3b82f6); transition: left 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      .dropdown5-trigger:hover .dropdown5-trigger-bg { left: 0; }
      .dropdown5-trigger-text { position: relative; z-index: 1; transition: color 0.3s ease; }
      .dropdown5-trigger:hover .dropdown5-trigger-text { color: #ffffff; }
      .dropdown5-trigger-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%); opacity: 0; transition: opacity 0.5s ease; pointer-events: none; }
      .dropdown5-trigger:hover .dropdown5-trigger-glow { opacity: 1; animation: rotate 3s linear infinite; }
      @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .dropdown5-menu { position: absolute; top: calc(100% + 12px); left: 50%; transform: translateX(-50%); background: #000000; border: 2px solid #1e3a8a; border-radius: 12px; min-width: 220px; opacity: 0; visibility: hidden; transform: translateX(-50%) scale(0.95) rotateY(8deg); transform-origin: center top; transition: all 0.32s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8); padding: 10px; z-index: 1000; overflow: hidden; }
      .dropdown5-menu.active { opacity: 1; visibility: visible; transform: translateX(-50%) scale(1) rotateY(0deg); }
      .dropdown5-menu-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; }
      .dropdown5-menu-circle { position: absolute; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%); animation: float 4s ease-in-out infinite; }
      .dropdown5-menu-circle:nth-child(1) { top: -40px; right: -40px; }
      .dropdown5-menu-circle:nth-child(2) { bottom: -40px; left: -40px; animation-delay: 2s; }
      @keyframes float { 0%,100%{ transform: translateY(0) scale(1);}50%{ transform: translateY(-12px) scale(1.04);} }

      .dropdown5-item { display:flex; align-items:center; gap:10px; padding:10px 12px; color:#94a3b8; text-decoration:none; border-radius:8px; transition: all 0.28s ease; margin-bottom:6px; position:relative; z-index:1; opacity:0; transform: translateY(8px) scale(0.98); }
      .dropdown5-menu.active .dropdown5-item { animation: popIn 0.36s cubic-bezier(0.68,-0.55,0.265,1.55) forwards; }
      @keyframes popIn { 0%{ opacity:0; transform: scale(0.85) translateY(12px);}70%{ transform: scale(1.02) translateY(-4px);}100%{ opacity:1; transform: scale(1) translateY(0);} }
      .dropdown5-item:hover { background: linear-gradient(135deg, rgba(30,58,138,0.28) 0%, rgba(59,130,246,0.12) 100%); color:#60a5fa; transform: scale(1.02); }
      .dropdown5-item-icon { font-size:14px; color:#1e3a8a; transition: all 0.4s ease; }
      .dropdown5-item-label { flex:1; font-weight:600; font-size:14px; }
      .dropdown5-item-line { position:absolute; bottom:0; left:12px; right:12px; height:2px; background: linear-gradient(90deg, transparent, #3b82f6, transparent); transform: scaleX(0); transition: transform 0.32s ease; }
      .dropdown5-item:hover .dropdown5-item-line { transform: scaleX(1); }
      .dropdown5-overlay { position: fixed; top:0; left:0; right:0; bottom:0; z-index: 999; }
      `}</style>

      <button className="dropdown5-trigger" onClick={() => setIsOpen(!isOpen)} aria-haspopup="true" aria-expanded={isOpen}>
        <div className="dropdown5-trigger-bg" />
        <span className="dropdown5-trigger-text">{label}: {currentLabel}</span>
        <div className="dropdown5-trigger-glow" />
      </button>

      <div className={`dropdown5-menu ${isOpen ? 'active' : ''}`}>
        <div className="dropdown5-menu-bg">
          <div className="dropdown5-menu-circle" />
          <div className="dropdown5-menu-circle" />
        </div>
        {menuItems.map((item, index) => (
          <a
            key={index}
            role="button"
            tabIndex={0}
            onClick={(e) => { e.preventDefault(); onChange(item.value); setIsOpen(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onChange(item.value); setIsOpen(false); } }}
            href="#"
            className="dropdown5-item"
            style={{ '--item-index': index }}
          >
            <span className="dropdown5-item-icon">{item.icon}</span>
            <span className="dropdown5-item-label">{item.label}</span>
            <div className="dropdown5-item-line" />
          </a>
        ))}
      </div>

      {isOpen && (
        <div className="dropdown5-overlay" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
