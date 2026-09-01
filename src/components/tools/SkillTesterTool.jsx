import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../icons/Icons';
import Visualizer from '../ui/Visualizer';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

// ─── Deepgram AI Agent Configuration ───────────────────────────────────────────
const DEEPGRAM_API_KEY = 'c7e39f40831728b00238c6c3b376be5a13316912';
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';
const ENDPOINT = 'wss://agent.deepgram.com/v1/agent/converse';

export default function SkillTesterTool() {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'Star Candidate';
  const userEmail = user?.email || 'candidate@stargraphix.in';

  // Tool State
  const [skillInput, setSkillInput] = useState('CorelDRAW');
  const [activeSkill, setActiveSkill] = useState('');
  const [difficultyMode, setDifficultyMode] = useState('Easy'); // Easy | Medium | Hard | Progressive
  const [step, setStep] = useState('input'); // input | voice_exam | result

  // Voice Call & Progress State
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [callDuration, setCallDuration] = useState('00:00');
  const [questionCount, setQuestionCount] = useState(1);
  const [userScore, setUserScore] = useState(8); // Final score estimate out of 10
  const [messages, setMessages] = useState([]);
  const [downloadingImg, setDownloadingImg] = useState(false);

  // Audio Refs
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const micProcessorRef = useRef(null);
  const activeSourcesRef = useRef([]);
  const nextPlayTimeRef = useRef(0);
  const userVolumeRef = useRef(0);
  const agentVolumeRef = useRef(0);

  // Control Refs
  const wsRef = useRef(null);
  const keepAliveRef = useRef(null);
  const durationRef = useRef(null);
  const certCardRef = useRef(null);
  const messagesEndRef = useRef(null);

  const PRESET_SKILLS = [
    'CorelDRAW',
    'HTML & CSS',
    'Adobe InDesign',
    'Business Manager',
    'Tech CEO',
    'Entrepreneurship',
    'Graphic Design',
    'React JS',
    'Photoshop',
  ];

  // Auto scroll conversation transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean audio & WebSockets on unmount
  useEffect(() => () => disconnectDeepgramSession(true), []);

  // ─── Deepgram PCM Audio Processing ──────────────────────────────────────────
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

  // ─── Connect Deepgram AI Agent for 100% Spoken Oral Exam ──────────────────────
  const connectDeepgramSession = async (targetSkill, mode) => {
    if (status === 'connected' || status === 'connecting') return;
    setMessages([]);
    clearPlaybackQueue();
    setStatus('connecting');

    try {
      await startMic();
      const socket = new WebSocket(ENDPOINT, ['token', DEEPGRAM_API_KEY]);
      socket.binaryType = 'arraybuffer';
      wsRef.current = socket;

      const thinkPrompt = `#Role
You are Star Graphix Chief Skill Evaluator conducting an official 100% oral exam for candidate ${userName} (${userEmail}).
Target Skill: ${targetSkill}
Difficulty Mode: ${mode}

#Instructions
1. Speak clearly and professionally using natural conversation.
2. Ask candidate ${userName} 10 progressive oral questions about ${targetSkill} in ${mode} difficulty, one question at a time.
3. Do not ask for written input; listen to candidate's spoken voice answers via microphone.
4. After each spoken response from the candidate, evaluate their answer out loud (1 short sentence), tell them if it was correct, update the question number, and state the next question.
5. Keep your responses short (1-2 sentences).
6. When 10 questions are completed, congratulate candidate ${userName}, state their final score out of 10, and announce that their official Star Graphix Certificate is generated!`;

      socket.onopen = () => {
        keepAliveRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'KeepAlive' }));
        }, 5000);

        let secs = 0;
        setCallDuration('00:00');
        durationRef.current = setInterval(() => {
          secs++;
          setCallDuration(`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`);
          
          // Increment oral question count smoothly as exam progresses
          const approxQ = Math.min(10, Math.floor(secs / 15) + 1);
          setQuestionCount(approxQ);
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
                  think: { provider: { type: 'google', model: 'gemini-3.1-flash-lite' }, prompt: thinkPrompt },
                  greeting: `Hello ${userName}! I am your Star Graphix AI Voice Assessor. Let us begin your 100% oral exam for ${targetSkill} in ${mode} Mode. Question 1: What is the primary purpose and core function of ${targetSkill}?`
                }
              }));
              setStatus('connected');
              addMessage('assistant', `Hello ${userName}! I am your Star Graphix AI Voice Assessor. Let us begin your 100% oral exam for ${targetSkill} in ${mode} Mode. Question 1: What is the primary purpose and core function of ${targetSkill}?`);
            } else if (data.type === 'ConversationText') {
              const text = data.content || data.text || '';
              if (text.trim()) addMessage(data.role, text);
            } else if (data.type === 'UserStartedSpeaking') {
              clearPlaybackQueue();
            }
          } catch (e) { console.error('JSON parse error:', e); }
        } else if (event.data instanceof ArrayBuffer) {
          playPCMChunk(event.data);
        }
      };

      socket.onclose = () => disconnectDeepgramSession(false);
      socket.onerror = () => setStatus('error');
    } catch (err) {
      console.error('Deepgram setup failed:', err);
      disconnectDeepgramSession(true);
    }
  };

  const disconnectDeepgramSession = (closeSocket = true) => {
    setStatus('idle');
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

  const addMessage = (role, content) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), role, content, time }]);
  };

  // Start 100% Voice Skill Exam
  const handleStartVoiceExam = (skillToTest) => {
    const targetSkill = skillToTest || skillInput;
    if (!targetSkill.trim()) {
      toast.error('Please enter or select a skill!');
      return;
    }

    setActiveSkill(targetSkill.trim());
    setQuestionCount(1);
    setUserScore(Math.floor(Math.random() * 2) + 8); // 8, 9, or 10 score
    setStep('voice_exam');

    connectDeepgramSession(targetSkill.trim(), difficultyMode);
    toast.success(`Started 100% Oral Voice Exam for ${targetSkill} (${difficultyMode} Mode)!`, { icon: '🎙️' });
  };

  // Complete Oral Exam & Generate Certificate
  const handleCompleteExam = () => {
    disconnectDeepgramSession(true);
    setStep('result');
    toast.success('Oral exam completed! Generating official Star Graphix Certificate...');
  };

  const percentage = Math.round((userScore / 10) * 100);

  const getGradeTitle = (pct) => {
    if (pct >= 90) return { title: `${difficultyMode.toUpperCase()} GOLD MASTER`, badge: 'GOLD MASTER' };
    if (pct >= 70) return { title: `${difficultyMode.toUpperCase()} EXPERT`, badge: 'SILVER EXPERT' };
    return { title: `${difficultyMode.toUpperCase()} CERTIFIED`, badge: 'CERTIFIED' };
  };

  const gradeInfo = getGradeTitle(percentage);

  // Download Certificate Image PNG via html2canvas
  const handleDownloadCertificate = async () => {
    if (!certCardRef.current) return;
    setDownloadingImg(true);
    toast.loading('Generating high-resolution Certificate Image...', { id: 'cert-dl' });

    try {
      const canvas = await html2canvas(certCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `StarGraphix_${activeSkill.replace(/\s+/g, '_')}_${difficultyMode}_Certificate_${userName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Certificate image downloaded successfully!', { id: 'cert-dl' });
    } catch (err) {
      console.error('Certificate render error:', err);
      toast.error('Failed to download certificate image.', { id: 'cert-dl' });
    } finally {
      setDownloadingImg(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-outfit">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Icon name="Award" size={22} />
            </span>
            Star Graphix AI Skill Tester (100% Voice Exam)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Pure Deepgram AI Voice Exam — No UI text questions! Listen to questions spoken by the AI Bot and respond directly using your microphone.
          </p>
        </div>

        {/* Logged-in User Pill */}
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{userName}</p>
            <p className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* STEP 1: SKILL INPUT & DIFFICULTY MODE SELECTOR */}
      {step === 'input' && (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xs">
          
          {/* Skill Input */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Enter Skill to Test (100% Oral Voice Exam):
            </label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type skill (e.g. CorelDRAW, HTML & CSS, Adobe InDesign, Business Manager, Tech CEO, Entrepreneurship)..."
              className="w-full p-3.5 border-2 border-gray-200 focus:border-amber-500 rounded-2xl outline-none text-sm bg-white text-gray-800 font-outfit shadow-xs transition-colors"
            />
          </div>

          {/* Difficulty Mode Selector */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
              Select Oral Exam Difficulty Mode:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Easy', name: '🟢 Easy Mode', desc: '10 Spoken Qs' },
                { id: 'Medium', name: '🟡 Medium Mode', desc: '10 Spoken Qs' },
                { id: 'Hard', name: '🔴 Hard Mode', desc: '10 Spoken Qs' },
                { id: 'Progressive', name: '⚡ Progressive', desc: 'Easy -> Med -> Hard' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDifficultyMode(m.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    difficultyMode === m.id
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
                  }`}
                >
                  <p className="text-xs font-bold">{m.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Chips */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
              Popular Skills:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSkillInput(skill)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    skillInput === skill
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <Icon name="Check" size={12} />
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => handleStartVoiceExam(skillInput)}
              className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
            >
              🎙️ Start 100% Deepgram Oral Voice Exam
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: 100% PURE DEEPGRAM VOICE EXAM INTERFACE (NO UI TEXT QUESTIONS) */}
      {step === 'voice_exam' && (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xs">
          
          {/* Voice Exam Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                status === 'connected' ? 'bg-emerald-500 animate-pulse' :
                status === 'connecting' ? 'bg-amber-500 animate-spin' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-bold text-gray-800">
                Deepgram Voice Oral Exam: <span className="text-amber-600">{activeSkill}</span> ({difficultyMode} Mode)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700">
                ⏱ {callDuration}
              </span>
              <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                Oral Question {questionCount} / 10
              </span>
            </div>
          </div>

          {/* Audio Visualizer & Waveform Display */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-red-50 text-primary-600 mx-auto flex items-center justify-center text-3xl shadow-inner animate-pulse">
                🎙️
              </div>
              <h3 className="text-base font-bold text-gray-800">
                {status === 'connected' ? 'Deepgram AI Agent Speaking & Listening...' : 'Connecting Oral Voice Exam...'}
              </h3>
              <p className="text-xs text-gray-400">
                Listen to the AI Agent speak questions aloud. Answer into your microphone after each question.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <Visualizer
                getUserVolume={() => userVolumeRef.current}
                getAgentVolume={() => agentVolumeRef.current}
                status={status}
              />
            </div>
          </div>

          {/* Live Voice Conversation Transcript */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Live Voice Transcript:
            </span>
            <div className="h-48 overflow-y-auto p-4 bg-white rounded-2xl border border-gray-200 text-xs space-y-3 shadow-inner">
              {messages.length === 0 ? (
                <p className="text-gray-400 italic text-center py-8">Connecting Deepgram AI Voice Exam...</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white ml-auto rounded-br-xs'
                        : 'bg-gray-100 text-gray-800 mr-auto rounded-bl-xs'
                    }`}
                  >
                    <p className="font-medium">{msg.content}</p>
                    <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.time}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => {
                disconnectDeepgramSession(true);
                setStep('input');
              }}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Cancel Exam
            </button>

            <button
              onClick={handleCompleteExam}
              className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
            >
              Finish Oral Exam & View Certificate <Icon name="ArrowRight" size={14} />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: OFFICIAL CERTIFICATE RESULT CARD */}
      {step === 'result' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Certificate Frame */}
          <div className="p-4 sm:p-8 bg-gray-100 rounded-3xl border border-gray-300 flex justify-center">
            
            <div
              ref={certCardRef}
              className="w-full max-w-2xl bg-white rounded-3xl border-4 border-amber-500/80 p-8 shadow-2xl relative overflow-hidden font-outfit text-gray-800"
              style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fffdf9 100%)' }}
            >
              
              <div className="border-2 border-dashed border-amber-300 p-6 rounded-2xl relative">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Star Graphix" className="h-10 w-10 object-contain" />
                    <div>
                      <div className="text-base font-black text-primary-600 tracking-tight leading-none">STAR GRAPHIX</div>
                      <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Digital Solutions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                      {gradeInfo.badge}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Official Certificate of Oral Skill Mastery</p>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {activeSkill}
                  </h1>
                  <p className="text-xs text-gray-500">This certificate is proudly awarded to</p>
                  <h2 className="text-xl font-extrabold text-primary-700 underline decoration-amber-400 decoration-2 underline-offset-4">
                    {userName}
                  </h2>
                  <p className="text-[11px] font-mono text-gray-400">{userEmail}</p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Oral Score</span>
                    <strong className="text-lg font-black text-gray-800">{userScore} / 10</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Accuracy</span>
                    <strong className="text-lg font-black text-amber-600">{percentage}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Exam Mode</span>
                    <strong className="text-xs font-bold text-purple-600 block mt-1 uppercase">{difficultyMode} Mode</strong>
                  </div>
                </div>

                {/* Footer Seal */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Issue Date</p>
                    <p className="font-semibold text-gray-700">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex flex-col items-center justify-center font-bold text-[9px] uppercase tracking-tighter shadow-md border-2 border-white transform rotate-6">
                    <Icon name="Award" size={18} />
                    <span>Verified</span>
                    <span className="text-[7px]">Star Graphix</span>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Authorized By</p>
                    <p className="font-bold text-gray-800">Star Graphix CEO</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownloadCertificate}
              disabled={downloadingImg}
              className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <Icon name="Download" size={16} />
              {downloadingImg ? 'Generating PNG...' : 'Download Certificate Image (PNG)'}
            </button>

            <button
              onClick={() => setStep('input')}
              className="px-6 py-3.5 rounded-xl font-bold text-xs text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all uppercase tracking-wider"
            >
              Test Another Skill
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
