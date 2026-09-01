import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

// Question Bank tailored for Star Graphix Skills
const QUESTION_BANKS = {
  coreldraw: [
    { level: 'Easy', q: 'Which tool in CorelDRAW is used for converting vector shapes into freehand curved lines?', options: ['Pen Tool', 'Bezier Tool', 'Freehand Tool', 'Shape Tool'], answer: 1 },
    { level: 'Easy', q: 'What is the default file extension for saved CorelDRAW graphic projects?', options: ['.cdr', '.ai', '.psd', '.eps'], answer: 0 },
    { level: 'Easy', q: 'Which shortcut key in CorelDRAW aligns selected objects directly to the page center?', options: ['Ctrl + C', 'P', 'Ctrl + E', 'Alt + F12'], answer: 1 },
    { level: 'Medium', q: 'Which feature in CorelDRAW allows clipping a graphic inside another closed vector container shape?', options: ['PowerClip Inside', 'Weld', 'Intersect', 'Trim'], answer: 0 },
    { level: 'Medium', q: 'What tool is used to edit node positions and control points of a curve path in CorelDRAW?', options: ['Pick Tool', 'Shape Tool (F10)', 'Knife Tool', 'Virtual Segment Delete'], answer: 1 },
    { level: 'Medium', q: 'Which color palette mode is essential for offset printing color accuracy in CorelDRAW?', options: ['RGB 24-bit', 'CMYK Process', 'Grayscale 8-bit', 'LAB Color'], answer: 1 },
    { level: 'Medium', q: 'What command combines multiple overlapping vector paths into a single unified outline contour?', options: ['Weld', 'Combine (Ctrl+L)', 'Group (Ctrl+G)', 'Simplify'], answer: 0 },
    { level: 'Hard', q: 'Which Docker window controls color trapping and overprint fills for commercial printing presses?', options: ['Object Properties', 'Color Proofing', 'Color Styles', 'Overprint Preview & Trapping'], answer: 3 },
    { level: 'Hard', q: 'In CorelDRAW, how do you convert all paragraph text into uneditable vector curves before sending to print?', options: ['Ctrl + Q (Convert to Curves)', 'Ctrl + K', 'Ctrl + Shift + O', 'Alt + F3'], answer: 0 },
    { level: 'Hard', q: 'Which advanced mesh tool creates multi-point gradient shading transitions on vector objects?', options: ['Interactive Fill Tool', 'Mesh Fill Tool (M)', 'Drop Shadow Tool', 'Extrude Tool'], answer: 1 },
  ],
  html_css: [
    { level: 'Easy', q: 'Which HTML5 element is correctly used for defining the primary top heading of a webpage?', options: ['<h6>', '<head>', '<h1>', '<header>'], answer: 2 },
    { level: 'Easy', q: 'In CSS3, which property controls the inner spacing between an element’s border and content?', options: ['margin', 'padding', 'gap', 'spacing'], answer: 1 },
    { level: 'Easy', q: 'Which display property creates a 1D flexbox layout container?', options: ['display: grid', 'display: flex', 'display: block', 'display: inline'], answer: 1 },
    { level: 'Medium', q: 'What does CSS specificity rule prioritize between class selector (.btn) and ID selector (#btn)?', options: ['Class selector has higher specificity', 'ID selector has higher specificity', 'They have equal weight', 'Inline style ranks lower than ID'], answer: 1 },
    { level: 'Medium', q: 'Which CSS property centers items vertically inside a flex container with flex-direction: row?', options: ['justify-content: center', 'align-items: center', 'text-align: center', 'place-content: center'], answer: 1 },
    { level: 'Medium', q: 'What HTML attribute is essential for accessibility and image load fallbacks?', options: ['title', 'alt', 'src', 'data-img'], answer: 1 },
    { level: 'Medium', q: 'Which CSS units are relative to the root font-size of the document?', options: ['em', 'px', 'rem', 'vh'], answer: 2 },
    { level: 'Hard', q: 'What CSS rule creates keyframe animations for smooth multi-step motion graphics?', options: ['@keyframes', '@media', '@import', '@supports'], answer: 0 },
    { level: 'Hard', q: 'Which CSS display mode allows 2D grid alignments with template rows and columns?', options: ['display: flex', 'display: grid', 'display: table', 'display: contents'], answer: 1 },
    { level: 'Hard', q: 'What meta tag guarantees responsive scaling across mobile viewports?', options: ['<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta charset="UTF-8">', '<meta name="description">', '<meta http-equiv="X-UA-Compatible">'], answer: 0 },
  ],
  indesign: [
    { level: 'Easy', q: 'What is Adobe InDesign primarily designed for in the graphic design industry?', options: ['Video Editing', 'Multi-page Layouts & Desktop Publishing', '3D Modeling', 'Vector Drawing'], answer: 1 },
    { level: 'Easy', q: 'What feature allows repeating header/footer items across all document pages automatically?', options: ['Master Pages (Parent Pages)', 'Layers', 'Paragraph Styles', 'Swatches'], answer: 0 },
    { level: 'Easy', q: 'What is the bleed area in an InDesign print layout document used for?', options: ['Adding margins', 'Preventing white gaps after trimming page edges', 'Embedding font files', 'Scaling images'], answer: 1 },
    { level: 'Medium', q: 'Which panel formats typography styles across an entire multi-page catalog in one click?', options: ['Paragraph Styles', 'Character Panel', 'Transform Panel', 'Align Panel'], answer: 0 },
    { level: 'Medium', q: 'What indicates that text inside an InDesign frame has overflowed beyond its frame border?', options: ['Green Checkmark', 'Red Plus Icon (+) on Outport', 'Blue Dot', 'Warning Dialog'], answer: 1 },
    { level: 'Medium', q: 'Which function links external high-res images to an InDesign document layout file?', options: ['Links Panel', 'Preflight Panel', 'Swatches Panel', 'Attributes Panel'], answer: 0 },
    { level: 'Medium', q: 'What feature packages all links, fonts, and layout files into a zip folder for commercial printers?', options: ['Export PDF', 'Package (Ctrl+Alt+Shift+P)', 'Collect for Output', 'Publish Online'], answer: 1 },
    { level: 'Hard', q: 'What option controls baseline grid alignment for consistent paragraph text baseline spacing?', options: ['Align to Baseline Grid', 'Justify All Lines', 'Optical Margin Alignment', 'Kerning Metric'], answer: 0 },
    { level: 'Hard', q: 'Which feature automatically generates a Table of Contents from designated paragraph style tags?', options: ['TOC Styles (Layout > Table of Contents)', 'Index Panel', 'Cross-References', 'Hyperlinks'], answer: 0 },
    { level: 'Hard', q: 'What color swatches setting prevents rich black ink heavy buildup on thin body text font lines?', options: ['100% K Process Black', '100% C M Y K', 'Registration Color', 'Rich Black Spot'], answer: 0 },
  ],
  ceo_entrepreneur: [
    { level: 'Easy', q: 'What does KPI stand for in business performance management?', options: ['Key Performance Indicator', 'Knowledge Product Index', 'Key Profit Return', 'Known Process Insight'], answer: 0 },
    { level: 'Easy', q: 'What is a business pitch deck primarily created for?', options: ['Internal Payroll', 'Presenting strategy & securing investor funding', 'Tax filings', 'Product User Manual'], answer: 1 },
    { level: 'Easy', q: 'What does ROI measure in corporate project investments?', options: ['Return on Investment', 'Rate of Inflation', 'Risk of Insolvency', 'Ratio of Income'], answer: 0 },
    { level: 'Medium', q: 'What financial statement summarizes a company’s revenue, expenses, and net profit over a quarter?', options: ['Balance Sheet', 'Income Statement (P&L)', 'Cash Flow Statement', 'Cap Table'], answer: 1 },
    { level: 'Medium', q: 'What strategy focuses on acquiring customers at low CAC while maximizing Customer Lifetime Value (LTV)?', options: ['Unit Economics Optimization', 'Debt Financing', 'Liquidation', 'Burn Rate Expansion'], answer: 0 },
    { level: 'Medium', q: 'What is the term for a startup reaching financial equilibrium where revenue equals total expenses?', options: ['Break-Even Point', 'Series A', 'Valuation', 'Pivot'], answer: 0 },
    { level: 'Medium', q: 'What framework analyzes Business Strengths, Weaknesses, Opportunities, and Threats?', options: ['PESTLE Analysis', 'SWOT Analysis', 'OKRs', 'Agile Scrum'], answer: 1 },
    { level: 'Hard', q: 'What term describes a strategic shift in business business model in response to market feedback?', options: ['Bootstrapping', 'Pivot', 'Downsizing', 'Acquisition'], answer: 1 },
    { level: 'Hard', q: 'What is the capitalization table (Cap Table) used for in growth startup governance?', options: ['Tracking equity ownership percentages and dilution', 'Managing office inventory', 'Listing vendor debts', 'Calculating employee salaries'], answer: 0 },
    { level: 'Hard', q: 'What leadership approach balances visionary strategic vision with operational execution excellence?', options: ['Executive Leadership & Strategic Execution', 'Micromanagement', 'Laissez-faire', 'Autocratic control'], answer: 0 },
  ],
};

// Generic Fallback Question Generator for Custom Skills
const generateCustomQuestions = (skillName) => [
  { level: 'Easy', q: `What is the primary fundamental objective when mastering ${skillName}?`, options: [`Building core foundations & best practices`, `Skipping theoretical concepts`, `Avoiding standard tools`, `Using default settings only`], answer: 0 },
  { level: 'Easy', q: `Which key resource is essential for troubleshooting issues in ${skillName}?`, options: [`Official documentation & industry guides`, `Ignoring error logs`, `Random guessing`, `Copying outdated code`], answer: 0 },
  { level: 'Easy', q: `What habit distinguishes a beginner from an efficient practitioner in ${skillName}?`, options: [`Organized workflow & asset management`, `Unstructured file names`, `No version backups`, `Manual repetitive tasks`], answer: 0 },
  { level: 'Medium', q: `How does continuous optimization impact professional output in ${skillName}?`, options: [`Increases efficiency, speed, and output quality`, `Has zero effect`, `Slows down delivery`, `Reduces customer trust`], answer: 0 },
  { level: 'Medium', q: `What approach is best when adopting new updates or tools in ${skillName}?`, options: [`Continuous learning & practical testing`, `Resisting new technology`, `Waiting 10 years`, `Only using legacy versions`], answer: 0 },
  { level: 'Medium', q: `Why is attention to detail critical during execution in ${skillName}?`, options: [`Prevents costly errors & ensures client satisfaction`, `It is unnecessary`, `Increases file size only`, `Takes too much time`], answer: 0 },
  { level: 'Medium', q: `How do experienced professionals validate quality in ${skillName}?`, options: [`Rigorous testing & quality assurance audits`, `Self-assumption without testing`, `Skipping review steps`, `Relying on end-user complaints`], answer: 0 },
  { level: 'Hard', q: `What strategy resolves complex edge-case challenges in ${skillName}?`, options: [`Root-cause diagnostic analysis & systematic problem solving`, `Trial and error without logs`, `Abandoning project`, `Blaming infrastructure`], answer: 0 },
  { level: 'Hard', q: `How does mastering advanced techniques in ${skillName} create business value?`, options: [`Drives innovation, scale, and high market value`, `Increases operational cost only`, `Decreases team morale`, `No impact`], answer: 0 },
  { level: 'Hard', q: `What defines true leadership mastery in ${skillName}?`, options: [`Architecting scalable solutions & mentoring peers`, `Working in isolation`, `Avoiding feedback`, `Fearing change`], answer: 0 },
];

export default function SkillTesterTool() {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'Star Professional';
  const userEmail = user?.email || 'user@stargraphix.in';

  const [skillInput, setSkillInput] = useState('CorelDRAW');
  const [activeSkill, setActiveSkill] = useState('');
  const [step, setStep] = useState('input'); // input | test | result
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [downloadingImg, setDownloadingImg] = useState(false);

  const certCardRef = useRef(null);

  // Preset Skill Suggestions
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

  // Start the 10-Question Test
  const handleStartTest = (skillToTest) => {
    const targetSkill = skillToTest || skillInput;
    if (!targetSkill.trim()) {
      toast.error('Please enter or select a skill to test!');
      return;
    }

    setActiveSkill(targetSkill.trim());
    const key = targetSkill.toLowerCase().replace(/[^a-z]/g, '_');
    
    let selectedBank = generateCustomQuestions(targetSkill);
    if (key.includes('corel')) selectedBank = QUESTION_BANKS.coreldraw;
    else if (key.includes('html') || key.includes('css')) selectedBank = QUESTION_BANKS.html_css;
    else if (key.includes('indesign') || key.includes('design')) selectedBank = QUESTION_BANKS.indesign;
    else if (key.includes('ceo') || key.includes('entrepreneur') || key.includes('business')) selectedBank = QUESTION_BANKS.ceo_entrepreneur;

    setQuestions(selectedBank);
    setCurrentIdx(0);
    setSelectedAnswers(new Array(10).fill(null));
    setStep('test');
    toast.success(`Started 10-Question Skill Test for ${targetSkill}!`);
  };

  // Voice Reader (Speech Synthesis)
  const handleVoiceRead = (text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Voice reader is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Select Answer
  const handleSelectOption = (optionIdx) => {
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  // Next Question / Complete
  const handleNextQuestion = () => {
    if (selectedAnswers[currentIdx] === null) {
      toast.error('Please select an answer before proceeding!');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (currentIdx < 9) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStep('result');
      toast.success('Skill test completed! Generating official certificate...');
    }
  };

  // Calculate Final Score & Grade
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
    if (pct >= 90) return { title: 'Master Specialist', color: 'text-amber-600', badge: 'GOLD MASTER' };
    if (pct >= 70) return { title: 'Advanced Professional', color: 'text-purple-600', badge: 'SILVER EXPERT' };
    if (pct >= 50) return { title: 'Certified Practitioner', color: 'text-blue-600', badge: 'CERTIFIED' };
    return { title: 'Junior Practitioner', color: 'text-gray-600', badge: 'TRAINEE' };
  };

  const gradeInfo = getGradeTitle(percentage);

  // Download Certificate Card as Image PNG
  const handleDownloadCertificate = async () => {
    if (!certCardRef.current) return;
    setDownloadingImg(true);
    toast.loading('Generating high-resolution Certificate Image...', { id: 'cert-download' });

    try {
      const canvas = await html2canvas(certCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `StarGraphix_Certificate_${activeSkill.replace(/\s+/g, '_')}_${userName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Certificate downloaded successfully!', { id: 'cert-download' });
    } catch (err) {
      console.error('Certificate render error:', err);
      toast.error('Failed to download certificate image.', { id: 'cert-download' });
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
            Test your expertise across 10 progressive questions (<span className="text-emerald-600 font-bold">Easy</span>, <span className="text-amber-600 font-bold">Medium</span>, <span className="text-red-600 font-bold">Hard</span>) and earn a verified download certificate image card!
          </p>
        </div>

        {/* Logged in User Tag */}
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

      {/* STEP 1: SKILL SELECTION INPUT */}
      {step === 'input' && (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xs">
          
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Enter or Select Any Skill to Test:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Enter skill (e.g. CorelDRAW, HTML & CSS, Adobe InDesign, Tech CEO, Entrepreneurship)..."
                className="flex-1 p-3.5 border-2 border-gray-200 focus:border-amber-500 rounded-2xl outline-none text-sm bg-white text-gray-800 font-outfit shadow-xs transition-colors"
              />
              <button
                onClick={() => handleStartTest(skillInput)}
                className="btn-primary py-3.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Icon name="Zap" size={16} /> Start 10-Q Skill Test
              </button>
            </div>
          </div>

          {/* Quick Preset Skill Chips */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
              Popular Star Graphix Skills:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setSkillInput(skill);
                    handleStartTest(skill);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Icon name="Check" size={12} className="text-amber-500" />
                  {skill}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: 10-QUESTION TEST INTERFACE */}
      {step === 'test' && currentQ && (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xs">
          
          {/* Progress & Difficulty Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                Tested Skill: {activeSkill}
              </span>
              <span className={`px-3 py-1 font-bold text-xs rounded-full border uppercase tracking-wider ${
                currentQ.level === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                currentQ.level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                Level: {currentQ.level}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVoiceRead(`${currentQ.q}. Options: ${currentQ.options.join(', ')}`)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon name="Volume2" size={14} />
                {isSpeaking ? 'Stop Voice' : 'Read Question'}
              </button>
              <span className="text-xs font-bold text-gray-500 font-mono">
                Question {currentIdx + 1} / 10
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug">
              {currentIdx + 1}. {currentQ.q}
            </h3>
          </div>

          {/* Options Grid */}
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

          {/* Next Button Footer */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
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
              {currentIdx < 9 ? 'Next Question' : 'Finish & View Certificate'}
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: OFFICIAL CERTIFICATE RESULT CARD */}
      {step === 'result' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Certificate Render Frame */}
          <div className="p-4 sm:p-8 bg-gray-100 rounded-3xl border border-gray-300 flex justify-center">
            
            <div
              ref={certCardRef}
              className="w-full max-w-2xl bg-white rounded-3xl border-4 border-amber-500/80 p-8 shadow-2xl relative overflow-hidden font-outfit text-gray-800"
              style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fffdf9 100%)' }}
            >
              
              {/* Outer Decorative Border */}
              <div className="border-2 border-dashed border-amber-300 p-6 rounded-2xl relative">
                
                {/* Certificate Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Star Graphix" className="h-10 w-10 object-contain" />
                    <div>
                      <div className="text-base font-black text-primary-600 tracking-tight leading-none">STAR GRAPHIX</div>
                      <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Digital Solutions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200`}>
                      {gradeInfo.badge}
                    </span>
                  </div>
                </div>

                {/* Main Certificate Title */}
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

                {/* Score & Breakdown Cards */}
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Mastery Level</span>
                    <strong className={`text-xs font-bold ${gradeInfo.color} block mt-1`}>{gradeInfo.title}</strong>
                  </div>
                </div>

                {/* Footer Seal & Signatures */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Issue Date</p>
                    <p className="font-semibold text-gray-700">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  {/* Official Star Seal Stamp */}
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
