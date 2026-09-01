import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../icons/Icons';
import Visualizer from '../ui/Visualizer';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

// ─── Deepgram AI Agent Config ───────────────────────────────────────────────────
const DEEPGRAM_API_KEY = 'c7e39f40831728b00238c6c3b376be5a13316912';
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';
const ENDPOINT = 'wss://agent.deepgram.com/v1/agent/converse';

// Question Banks for Star Graphix Skills
const QUESTION_BANKS = {
  coreldraw: {
    Easy: [
      { q: 'Which tool in CorelDRAW is used for converting vector shapes into freehand curved lines?', options: ['Pen Tool', 'Bezier Tool', 'Freehand Tool', 'Shape Tool'], answer: 1 },
      { q: 'What is the default file extension for saved CorelDRAW graphic projects?', options: ['.cdr', '.ai', '.psd', '.eps'], answer: 0 },
      { q: 'Which shortcut key in CorelDRAW aligns selected objects directly to the page center?', options: ['Ctrl + C', 'P', 'Ctrl + E', 'Alt + F12'], answer: 1 },
      { q: 'What palette mode is standard for printing design layouts in CorelDRAW?', options: ['RGB', 'CMYK', 'Grayscale', 'Indexed'], answer: 1 },
    ],
    Medium: [
      { q: 'Which feature in CorelDRAW allows clipping a graphic inside another closed vector container shape?', options: ['PowerClip Inside', 'Weld', 'Intersect', 'Trim'], answer: 0 },
      { q: 'What tool is used to edit node positions and control points of a curve path in CorelDRAW?', options: ['Pick Tool', 'Shape Tool (F10)', 'Knife Tool', 'Virtual Segment Delete'], answer: 1 },
      { q: 'What command combines multiple overlapping vector paths into a single unified outline contour?', options: ['Weld', 'Combine (Ctrl+L)', 'Group (Ctrl+G)', 'Simplify'], answer: 0 },
    ],
    Hard: [
      { q: 'Which Docker window controls color trapping and overprint fills for commercial printing presses?', options: ['Object Properties', 'Color Proofing', 'Color Styles', 'Overprint Preview & Trapping'], answer: 3 },
      { q: 'In CorelDRAW, how do you convert all paragraph text into uneditable vector curves before sending to print?', options: ['Ctrl + Q (Convert to Curves)', 'Ctrl + K', 'Ctrl + Shift + O', 'Alt + F3'], answer: 0 },
      { q: 'Which advanced mesh tool creates multi-point gradient shading transitions on vector objects?', options: ['Interactive Fill Tool', 'Mesh Fill Tool (M)', 'Drop Shadow Tool', 'Extrude Tool'], answer: 1 },
    ],
  },
  html_css: {
    Easy: [
      { q: 'Which HTML5 element is correctly used for defining the primary top heading of a webpage?', options: ['<h6>', '<head>', '<h1>', '<header>'], answer: 2 },
      { q: 'In CSS3, which property controls the inner spacing between an element’s border and content?', options: ['margin', 'padding', 'gap', 'spacing'], answer: 1 },
      { q: 'Which display property creates a 1D flexbox layout container?', options: ['display: grid', 'display: flex', 'display: block', 'display: inline'], answer: 1 },
    ],
    Medium: [
      { q: 'What does CSS specificity rule prioritize between class selector (.btn) and ID selector (#btn)?', options: ['Class selector has higher specificity', 'ID selector has higher specificity', 'They have equal weight', 'Inline style ranks lower than ID'], answer: 1 },
      { q: 'Which CSS property centers items vertically inside a flex container with flex-direction: row?', options: ['justify-content: center', 'align-items: center', 'text-align: center', 'place-content: center'], answer: 1 },
      { q: 'Which CSS units are relative to the root font-size of the document?', options: ['em', 'px', 'rem', 'vh'], answer: 2 },
    ],
    Hard: [
      { q: 'What CSS rule creates keyframe animations for smooth multi-step motion graphics?', options: ['@keyframes', '@media', '@import', '@supports'], answer: 0 },
      { q: 'Which CSS display mode allows 2D grid alignments with template rows and columns?', options: ['display: flex', 'display: grid', 'display: table', 'display: contents'], answer: 1 },
      { q: 'What meta tag guarantees responsive scaling across mobile viewports?', options: ['<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta charset="UTF-8">', '<meta name="description">', '<meta http-equiv="X-UA-Compatible">'], answer: 0 },
    ],
  },
  ceo_entrepreneur: {
    Easy: [
      { q: 'What does KPI stand for in business performance management?', options: ['Key Performance Indicator', 'Knowledge Product Index', 'Key Profit Return', 'Known Process Insight'], answer: 0 },
      { q: 'What is a business pitch deck primarily created for?', options: ['Internal Payroll', 'Presenting strategy & securing investor funding', 'Tax filings', 'Product User Manual'], answer: 1 },
      { q: 'What does ROI measure in corporate project investments?', options: ['Return on Investment', 'Rate of Inflation', 'Risk of Insolvency', 'Ratio of Income'], answer: 0 },
    ],
    Medium: [
      { q: 'What financial statement summarizes a company’s revenue, expenses, and net profit over a quarter?', options: ['Balance Sheet', 'Income Statement (P&L)', 'Cash Flow Statement', 'Cap Table'], answer: 1 },
      { q: 'What strategy focuses on acquiring customers at low CAC while maximizing Customer Lifetime Value (LTV)?', options: ['Unit Economics Optimization', 'Debt Financing', 'Liquidation', 'Burn Rate Expansion'], answer: 0 },
      { q: 'What framework analyzes Business Strengths, Weaknesses, Opportunities, and Threats?', options: ['PESTLE Analysis', 'SWOT Analysis', 'OKRs', 'Agile Scrum'], answer: 1 },
    ],
    Hard: [
      { q: 'What term describes a strategic shift in business model in response to market feedback?', options: ['Bootstrapping', 'Pivot', 'Downsizing', 'Acquisition'], answer: 1 },
      { q: 'What is the capitalization table (Cap Table) used for in growth startup governance?', options: ['Tracking equity ownership percentages and dilution', 'Managing office inventory', 'Listing vendor debts', 'Calculating employee salaries'], answer: 0 },
      { q: 'What leadership approach balances visionary strategic vision with operational execution excellence?', options: ['Executive Leadership & Strategic Execution', 'Micromanagement', 'Laissez-faire', 'Autocratic control'], answer: 0 },
    ],
  },
};

// Generic Fallback Question Generator
const generateQuestionsForLevel = (skillName, levelName) => [
  { q: `[${levelName}] What is a key fundamental principle when implementing ${skillName}?`, options: ['Structured execution & best practices', 'Ignoring standards', 'Random guessing', 'Manual repetitive work'], answer: 0 },
  { q: `[${levelName}] Which core tool or feature is essential when optimizing ${skillName}?`, options: ['Professional diagnostics & workflow tools', 'Unorganized files', 'No backups', 'Legacy defaults'], answer: 0 },
  { q: `[${levelName}] How do industry professionals validate quality when working with ${skillName}?`, options: ['Systematic quality assurance testing', 'Self-assumption without checks', 'Skipping review steps', 'Ignoring feedback'], answer: 0 },
  { q: `[${levelName}] What approach resolves advanced challenges in ${skillName}?`, options: ['Root-cause analysis & problem solving', 'Trial and error without logs', 'Abandoning project', 'Blaming tools'], answer: 0 },
];

export default function SkillTesterTool() {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'Star Professional';
  const userEmail = user?.email || 'user@stargraphix.in';

  const [skillInput, setSkillInput] = useState('CorelDRAW');
  const [activeSkill, setActiveSkill] = useState('');
  const [difficultyMode, setDifficultyMode] = useState('Easy'); // Easy | Medium | Hard | Progressive
  const [step, setStep] = useState('input'); // input | test | result

  // Test State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Deepgram Voice Agent State
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);

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
  const certCardRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [downloadingImg, setDownloadingImg] = useState(false);

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

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean audio & sockets on unmount
  useEffect(() => () => disconnectDeepgramSession(true), []);

  // ─── Deepgram PCM Audio Helpers ──────────────────────────────────────────────
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

  // ─── Deepgram WebSocket Connection ───────────────────────────────────────────
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

      const thinkPrompt = `Role: You are Star Graphix AI Skill Evaluator.
Target User: ${userName} (${userEmail})
Target Skill: ${targetSkill}
Mode: ${mode}
Goal: Conduct a 10-question oral & visual skill assessment. Speak clearly, ask one question at a time, evaluate the user's responses, and announce the result when complete. Keep answers concise.`;

      socket.onopen = () => {
        keepAliveRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'KeepAlive' }));
        }, 5000);
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
                  greeting: `Hello ${userName}! Welcome to Star Graphix AI Skill Evaluator. We are starting your 10-question ${targetSkill} test in ${mode} Mode. Let us start with Question 1.`
                }
              }));
              setStatus('connected');
              addMessage('assistant', `Hello ${userName}! Welcome to Star Graphix AI Skill Evaluator. We are starting your 10-question ${targetSkill} test in ${mode} Mode.`);
            } else if (data.type === 'ConversationText') {
              const text = data.content || data.text || '';
              if (text.trim()) addMessage(data.role, text);
            } else if (data.type === 'UserStartedSpeaking') {
              setAgentSpeaking(false);
              clearPlaybackQueue();
            } else if (data.type === 'AgentStartedSpeaking') {
              setAgentSpeaking(true);
            } else if (data.type === 'AgentAudioDone') {
              setAgentSpeaking(false);
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
    setAgentSpeaking(false);
    userVolumeRef.current = 0;
    agentVolumeRef.current = 0;
    stopMic();
    clearInterval(keepAliveRef.current);
    keepAliveRef.current = null;
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

  // ─── Test Execution Logic ────────────────────────────────────────────────────
  const handleStartTest = (skillToTest) => {
    const targetSkill = skillToTest || skillInput;
    if (!targetSkill.trim()) {
      toast.error('Please enter or select a skill!');
      return;
    }

    setActiveSkill(targetSkill.trim());

    // Generate 10 Questions based on chosen Difficulty Mode
    const key = targetSkill.toLowerCase().replace(/[^a-z]/g, '_');
    let bank = QUESTION_BANKS.coreldraw;
    if (key.includes('html') || key.includes('css')) bank = QUESTION_BANKS.html_css;
    else if (key.includes('ceo') || key.includes('entrepreneur') || key.includes('business')) bank = QUESTION_BANKS.ceo_entrepreneur;

    let testQs = [];
    if (difficultyMode === 'Easy') {
      testQs = bank.Easy || generateQuestionsForLevel(targetSkill, 'Easy');
    } else if (difficultyMode === 'Medium') {
      testQs = bank.Medium || generateQuestionsForLevel(targetSkill, 'Medium');
    } else if (difficultyMode === 'Hard') {
      testQs = bank.Hard || generateQuestionsForLevel(targetSkill, 'Hard');
    } else {
      // Progressive Mode
      testQs = [
        ...(bank.Easy || generateQuestionsForLevel(targetSkill, 'Easy')),
        ...(bank.Medium || generateQuestionsForLevel(targetSkill, 'Medium')),
        ...(bank.Hard || generateQuestionsForLevel(targetSkill, 'Hard')),
      ];
    }

    // Ensure 10 questions total
    while (testQs.length < 10) {
      const fillQs = generateQuestionsForLevel(targetSkill, difficultyMode);
      testQs = [...testQs, ...fillQs];
    }
    testQs = testQs.slice(0, 10);

    setQuestions(testQs);
    setCurrentIdx(0);
    setSelectedAnswers(new Array(10).fill(null));
    setStep('test');

    // Initiate Deepgram AI Voice Agent WebSockets session
    connectDeepgramSession(targetSkill.trim(), difficultyMode);
    toast.success(`Connected Deepgram AI Voice Agent for ${targetSkill} (${difficultyMode} Mode)!`);
  };

  // Select Option
  const handleSelectOption = (optionIdx) => {
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (selectedAnswers[currentIdx] === null) {
      toast.error('Please select an answer before proceeding!');
      return;
    }

    if (currentIdx < 9) {
      setCurrentIdx(currentIdx + 1);
    } else {
      disconnectDeepgramSession(true);
      setStep('result');
      toast.success('Skill test completed! Generating official certificate card...');
    }
  };

  // Score Calculation
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / 10) * 100);

  const getGradeTitle = (pct) => {
    if (pct >= 90) return { title: `${difficultyMode.toUpperCase()} GOLD MASTER`, color: 'text-amber-600', badge: 'GOLD MASTER' };
    if (pct >= 70) return { title: `${difficultyMode.toUpperCase()} EXPERT`, color: 'text-purple-600', badge: 'SILVER EXPERT' };
    if (pct >= 50) return { title: `${difficultyMode.toUpperCase()} PRACTITIONER`, color: 'text-blue-600', badge: 'CERTIFIED' };
    return { title: 'Junior Practitioner', color: 'text-gray-600', badge: 'TRAINEE' };
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

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6 text-left font-outfit">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Icon name="Award" size={22} />
            </span>
            Star Graphix AI Skill Tester
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Test your expertise with our <strong className="text-primary-600 font-semibold">Deepgram AI Voice Agent</strong> across 10 oral & visual questions with downloadable certificate cards!
          </p>
        </div>

        {/* Logged-in User Profile Pill */}
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

      {/* STEP 1: SKILL ENTRY & DIFFICULTY MODE SELECTOR */}
      {step === 'input' && (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xs">
          
          {/* Skill Text Input */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Enter Skill to Test:
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
              Select Difficulty Mode:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Easy', name: '🟢 Easy Mode', desc: '10 Introductory Qs' },
                { id: 'Medium', name: '🟡 Medium Mode', desc: '10 Intermediate Qs' },
                { id: 'Hard', name: '🔴 Hard Mode', desc: '10 Advanced Qs' },
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

          {/* Preset Skills Chips */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
              Popular Skills:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setSkillInput(skill);
                  }}
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

          {/* Start Test Button */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => handleStartTest(skillInput)}
              className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
            >
              <Icon name="Zap" size={16} /> Start Test with Deepgram AI Agent
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: TEST INTERFACE WITH DEEPGRAM AI VOICE AGENT */}
      {step === 'test' && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* LEFT: Deepgram AI Voice Bot Widget & Transcript (5 cols) */}
          <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'connected' ? 'bg-emerald-500 animate-pulse' :
                    status === 'connecting' ? 'bg-amber-500 animate-spin' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs font-bold text-gray-800">Deepgram AI Voice Agent</span>
                </div>
                <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  {status === 'connected' ? 'Active Call' : status}
                </span>
              </div>

              {/* Transcript Chat Area */}
              <div className="h-64 overflow-y-auto space-y-2 p-3 bg-white rounded-2xl border border-gray-200 text-xs">
                {messages.length === 0 ? (
                  <p className="text-gray-400 italic text-center py-10">Connecting Deepgram AI Voice Agent...</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white ml-auto rounded-br-xs'
                          : 'bg-gray-100 text-gray-800 mr-auto rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.time}</span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Audio Visualizer Waveform */}
            <div className="p-3 bg-white rounded-2xl border border-gray-200">
              <Visualizer
                getUserVolume={() => userVolumeRef.current}
                getAgentVolume={() => agentVolumeRef.current}
                status={status}
              />
            </div>
          </div>

          {/* RIGHT: Question Cards & Options (7 cols) */}
          <div className="lg:col-span-7 bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xs">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                  {activeSkill} ({difficultyMode} Mode)
                </span>
                <span className="text-xs font-bold text-gray-500 font-mono">
                  Question {currentIdx + 1} / 10
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug">
                  {currentIdx + 1}. {currentQ.q}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold text-left transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-400/20'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                          isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <Icon name="Check" size={16} className="text-amber-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => {
                  disconnectDeepgramSession(true);
                  setStep('input');
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Cancel Test
              </button>

              <button
                onClick={handleNextQuestion}
                className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {currentIdx < 9 ? 'Next Question' : 'Finish & Get Certificate'}
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>

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
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Official Certificate of Skill Mastery</p>
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Score</span>
                    <strong className="text-lg font-black text-gray-800">{score} / 10</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Accuracy</span>
                    <strong className="text-lg font-black text-amber-600">{percentage}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Tested Mode</span>
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
