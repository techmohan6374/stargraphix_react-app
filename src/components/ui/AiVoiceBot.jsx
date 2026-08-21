import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Visualizer from './Visualizer';

// ─── Configuration ────────────────────────────────────────────────────────────
const DEEPGRAM_API_KEY = 'c7e39f40831728b00238c6c3b376be5a13316912';
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';
const ENDPOINT = 'wss://agent.deepgram.com/v1/agent/converse';
const GREETING = 'Hello! Welcome to Star Graphix. How can I help you today?';

const THINK_PROMPT = `#Role
You are the virtual assistant for Star Graphix, a company providing professional graphic design, web design, and web development services to help brands shine online. Your goal is to guide users, answer questions, provide service details, share product prices, and offer contact info.

#About Star Graphix
- Tagline: Digital Solution in one place
- Leadership: The company CEOs are Veerasamy and Manohar, and Mohanraj is the Assistant CEO.
- Branches:
  - Ponnammapet Gate, Salem, Tamilnadu
  - New Bus Stand, Salem, Tamilnadu
- Contact Support:
  - Support Time: 10:00 AM to 9:00 PM
  - Email: stargraphix2010@gmail.com
  - Phone: +91 98940 33883, +91 80565 80402

#Services Offered
- Logo Design, Print Design, Brand Identity, Website Design, Digital Business Card, Web Applications

#Products & Pricing
- E-Book: Rs.4000, Flyer Design: Rs.1000, Wedding Card Design: Rs.2000, Instagram Posters: Rs.500
- Resume: Rs.350, Note Book: Rs.450, Digital Business Card: Rs.1000, Brand Logo: Rs.1000
- Book Wrapper: Rs.1500, Invoice: Rs.900, Banner: Rs.800, Business Card Design: Rs.500

#General Guidelines
- Be warm, friendly, and professional.
- Keep most responses to 1–2 sentences.
- Do not use markdown formatting.
- Use simple conversational language.`;
// ─────────────────────────────────────────────────────────────────────────────

export default function AiVoiceBot() {
  const location = useLocation();

  // Hide AI bot on all admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [callDuration, setCallDuration] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('sg_bot_messages');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [logs, setLogs] = useState([]);

  // Audio refs
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const micProcessorRef = useRef(null);
  const activeSourcesRef = useRef([]);
  const nextPlayTimeRef = useRef(0);
  const userVolumeRef = useRef(0);
  const agentVolumeRef = useRef(0);

  // Control refs
  const wsRef = useRef(null);
  const keepAliveRef = useRef(null);
  const durationRef = useRef(null);
  const messagesEndRef = useRef(null);
  const logsEndRef = useRef(null);
  const lastActiveRef = useRef(Date.now());

  // Auto scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  // Persist messages
  useEffect(() => {
    try { localStorage.setItem('sg_bot_messages', JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => () => disconnectSession(true), []);

  const addLog = (type, text) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, text, time }]);
  };

  const addMessage = (role, content) => {
    lastActiveRef.current = Date.now();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].role === role && prev[prev.length - 1].content === content) return prev;
      return [...prev, { id: Math.random().toString(36).substr(2, 9), role, content, time }];
    });
  };

  const floatTo16BitPCM = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const playPCMChunk = (arrayBuffer) => {
    lastActiveRef.current = Date.now();
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;
    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    let sum = 0;
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
      sum += float32[i] * float32[i];
    }
    agentVolumeRef.current = Math.sqrt(sum / int16.length);

    const buf = audioCtx.createBuffer(1, float32.length, 24000);
    buf.copyToChannel(float32, 0);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    const playAt = Math.max(nextPlayTimeRef.current, now + 0.06);
    src.start(playAt);
    activeSourcesRef.current.push({ node: src, time: playAt, duration: buf.duration });
    nextPlayTimeRef.current = playAt + buf.duration;
    activeSourcesRef.current = activeSourcesRef.current.filter(s => now <= s.time + s.duration);
  };

  const clearPlaybackQueue = () => {
    activeSourcesRef.current.forEach(s => { try { s.node.stop(); } catch {} });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    agentVolumeRef.current = 0;
  };

  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    micStreamRef.current = stream;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    audioCtxRef.current = audioCtx;
    const src = audioCtx.createMediaStreamSource(stream);
    const proc = audioCtx.createScriptProcessor(2048, 1, 1);
    micProcessorRef.current = proc;
    proc.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      userVolumeRef.current = rms;
      if (rms > 0.015) lastActiveRef.current = Date.now();
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(floatTo16BitPCM(data));
    };
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    src.connect(proc);
    proc.connect(gain);
    gain.connect(audioCtx.destination);
  };

  const stopMic = () => {
    micProcessorRef.current?.disconnect();
    micProcessorRef.current = null;
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
  };

  const connectSession = async () => {
    if (status === 'connected' || status === 'connecting') return;
    setMessages([]);
    setLogs([]);
    clearPlaybackQueue();
    setStatus('connecting');
    try {
      await startMic();
      const socket = new WebSocket(ENDPOINT, ['token', DEEPGRAM_API_KEY]);
      socket.binaryType = 'arraybuffer';
      wsRef.current = socket;

      socket.onopen = () => {
        addLog('success', 'WebSocket connected');
        lastActiveRef.current = Date.now();
        keepAliveRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'KeepAlive' }));
        }, 5000);

        let secs = 0;
        setCallDuration('00:00');
        durationRef.current = setInterval(() => {
          if (Date.now() - lastActiveRef.current >= 10000) {
            addLog('warning', 'Auto-ended due to 10s inactivity');
            addMessage('assistant', 'Call ended due to inactivity.');
            disconnectSession(true);
            return;
          }
          secs++;
          setCallDuration(`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`);
        }, 1000);
      };

      socket.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'Welcome') {
              socket.send(JSON.stringify({
                type: 'Settings',
                audio: {
                  input: { encoding: 'linear16', sample_rate: 48000 },
                  output: { encoding: 'linear16', sample_rate: 24000, container: 'none' }
                },
                agent: {
                  speak: { provider: { type: 'eleven_labs', model_id: 'eleven_multilingual_v2', voice_id: VOICE_ID } },
                  listen: { provider: { type: 'deepgram', version: 'v2', model: 'flux-general-en' } },
                  think: { provider: { type: 'google', model: 'gemini-3.1-flash-lite' }, prompt: THINK_PROMPT },
                  greeting: GREETING
                }
              }));
              setStatus('connected');
              addMessage('assistant', GREETING);
            } else if (data.type === 'ConversationText') {
              const text = data.content || data.text || '';
              if (text.trim()) addMessage(data.role, text);
            } else if (data.type === 'UserStartedSpeaking') {
              lastActiveRef.current = Date.now();
              setAgentSpeaking(false);
              clearPlaybackQueue();
            } else if (data.type === 'AgentStartedSpeaking') {
              lastActiveRef.current = Date.now();
              setAgentSpeaking(true);
            } else if (data.type === 'AgentAudioDone') {
              lastActiveRef.current = Date.now();
              setAgentSpeaking(false);
            }
          } catch (e) { addLog('error', 'JSON parse failed: ' + e.message); }
        } else if (event.data instanceof ArrayBuffer) {
          playPCMChunk(event.data);
        }
      };

      socket.onclose = () => { addLog('warning', 'WebSocket closed'); disconnectSession(false); };
      socket.onerror = () => { addLog('error', 'WebSocket error'); setStatus('error'); };
    } catch (err) {
      addLog('error', 'Setup failed: ' + err.message);
      disconnectSession(true);
    }
  };

  const disconnectSession = (closeSocket = true) => {
    setStatus('idle');
    setCallDuration('');
    setAgentSpeaking(false);
    userVolumeRef.current = 0;
    agentVolumeRef.current = 0;
    stopMic();
    clearInterval(keepAliveRef.current);
    clearInterval(durationRef.current);
    keepAliveRef.current = null;
    durationRef.current = null;
    clearPlaybackQueue();
    if (closeSocket && wsRef.current) {
      if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(wsRef.current.readyState)) wsRef.current.close();
      wsRef.current = null;
    }
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  const statusColor = { idle: '#9ca3af', connecting: '#f59e0b', connected: '#22c55e', error: '#ef4444' }[status];

  return (
    <>
      {/* Widget Card */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '20px',
            width: '340px',
            maxHeight: '520px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            border: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Outfit', sans-serif",
            zIndex: 9999,
            animation: 'botSlideIn 0.25s ease',
          }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#CC0000,#990000)', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}`, transition: 'background 0.3s' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Voice Assistant</span>
              {callDuration && (
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                  ⏱ {callDuration}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setActiveTab(t => t === 'chat' ? 'logs' : 'chat')}
                title="Toggle Logs"
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}
              >
                {activeTab === 'chat' ? '≡' : '💬'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Message / Log Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeTab === 'chat' ? (
              messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', marginTop: 'auto', marginBottom: 'auto' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎙️</div>
                  <p style={{ fontWeight: 600, color: '#6b7280' }}>Ready to chat</p>
                  <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Click "Start Call" to speak with our AI assistant.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%',
                      background: msg.role === 'user' ? '#CC0000' : '#f3f4f6',
                      color: msg.role === 'user' ? '#fff' : '#1f2937',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}>
                      <div>{msg.content}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))
              )
            ) : (
              logs.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>No system logs yet.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#22c55e' : '#6b7280',
                    padding: '2px 0',
                  }}>
                    <span style={{ opacity: 0.6 }}>[{log.time}]</span> {log.text}
                  </div>
                ))
              )
            )}
            <div ref={activeTab === 'chat' ? messagesEndRef : logsEndRef} />
          </div>

          {/* Voice Visualizer */}
          <div style={{ padding: '8px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
            <Visualizer
              getUserVolume={() => userVolumeRef.current}
              getAgentVolume={() => agentVolumeRef.current}
              status={status}
            />
          </div>

          {/* Controls */}
          <div style={{ padding: '10px 16px 14px', background: '#fff', display: 'flex', justifyContent: 'center' }}>
            {status === 'idle' || status === 'error' ? (
              <button
                onClick={connectSession}
                style={{
                  background: 'linear-gradient(135deg,#CC0000,#990000)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  padding: '10px 32px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(204,0,0,0.35)',
                  transition: 'transform 0.15s',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                🎙️ Start Call
              </button>
            ) : status === 'connecting' ? (
              <button disabled style={{
                background: '#f3f4f6',
                color: '#9ca3af',
                border: 'none',
                borderRadius: 50,
                padding: '10px 32px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'not-allowed',
                fontFamily: "'Outfit', sans-serif",
              }}>
                ⏳ Connecting...
              </button>
            ) : (
              <button
                onClick={() => disconnectSession(true)}
                style={{
                  background: '#fee2e2',
                  color: '#ef4444',
                  border: '2px solid #fca5a5',
                  borderRadius: 50,
                  padding: '10px 32px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'transform 0.15s',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                📵 End Call
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title={isOpen ? 'Close AI Assistant' : 'Open AI Voice Assistant'}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#CC0000,#880000)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: `0 4px 20px rgba(204,0,0,0.45)${!isOpen ? ', 0 0 0 0 rgba(204,0,0,0.4)' : ''}`,
          zIndex: 10000,
          animation: !isOpen ? 'botPulse 2.5s infinite' : 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Keyframe CSS injected once */}
      <style>{`
        @keyframes botPulse {
          0%   { box-shadow: 0 4px 20px rgba(204,0,0,0.45), 0 0 0 0   rgba(204,0,0,0.35); }
          70%  { box-shadow: 0 4px 20px rgba(204,0,0,0.45), 0 0 0 14px rgba(204,0,0,0); }
          100% { box-shadow: 0 4px 20px rgba(204,0,0,0.45), 0 0 0 0   rgba(204,0,0,0); }
        }
        @keyframes botSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </>
  );
}
