import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function AgeCalculator() {
  // Default birthdate: exactly 24 years ago today
  const defaultDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 24);
    return d.toISOString().split('T')[0];
  };

  const [birthDate, setBirthDate] = useState(defaultDate);
  const [birthTime, setBirthTime] = useState('09:00');
  const [hasBirthTime, setHasBirthTime] = useState(false);
  const [targetDateMode, setTargetDateMode] = useState('now'); // 'now' or 'custom'
  const [customTargetDate, setCustomTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'milestones', 'cosmic', 'planets'

  const [currentTime, setCurrentTime] = useState(new Date());
  const canvasRef = useRef(null);

  // Live ticking clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate parsed birth DateTime object
  const getBirthDateTime = () => {
    if (!birthDate) return null;
    const [year, month, day] = birthDate.split('-').map(Number);
    if (!year || !month || !day) return null;
    let hours = 0;
    let minutes = 0;
    if (hasBirthTime && birthTime) {
      const [h, m] = birthTime.split(':').map(Number);
      hours = h || 0;
      minutes = m || 0;
    }
    return new Date(year, month - 1, day, hours, minutes, 0);
  };

  // Target comparison DateTime object
  const getTargetDateTime = () => {
    if (targetDateMode === 'now') {
      return currentTime;
    }
    if (!customTargetDate) return currentTime;
    const [year, month, day] = customTargetDate.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59);
  };

  const birthDateTime = getBirthDateTime();
  const targetDateTime = getTargetDateTime();

  // Precise Chronological Age calculation
  const calculateAge = () => {
    if (!birthDateTime || !targetDateTime || birthDateTime > targetDateTime) {
      return null;
    }

    let years = targetDateTime.getFullYear() - birthDateTime.getFullYear();
    let months = targetDateTime.getMonth() - birthDateTime.getMonth();
    let days = targetDateTime.getDate() - birthDateTime.getDate();
    let hours = targetDateTime.getHours() - birthDateTime.getHours();
    let minutes = targetDateTime.getMinutes() - birthDateTime.getMinutes();
    let seconds = targetDateTime.getSeconds() - birthDateTime.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      // Days in previous month of target date
      const prevMonth = new Date(targetDateTime.getFullYear(), targetDateTime.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    // Total milliseconds lived
    const totalMs = targetDateTime - birthDateTime;
    const totalSeconds = Math.floor(totalMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalWeeks,
      remainingDaysAfterWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
    };
  };

  const age = calculateAge();

  // Next Birthday countdown
  const getNextBirthdayInfo = () => {
    if (!birthDateTime) return null;
    const target = targetDateTime;
    const birthMonth = birthDateTime.getMonth();
    const birthDay = birthDateTime.getDate();

    let nextBday = new Date(target.getFullYear(), birthMonth, birthDay);
    // If birthday already passed this year (or is today with target later)
    if (nextBday < target && !(nextBday.toDateString() === target.toDateString())) {
      nextBday = new Date(target.getFullYear() + 1, birthMonth, birthDay);
    }

    const isToday =
      target.getMonth() === birthMonth &&
      target.getDate() === birthDay;

    const diffMs = nextBday - target;
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextWeekday = weekdayNames[nextBday.getDay()];

    // Half birthday
    const halfBday = new Date(birthDateTime);
    halfBday.setMonth(halfBday.getMonth() + 6);

    return {
      date: nextBday,
      daysRemaining: isToday ? 0 : days,
      isToday,
      weekday: nextWeekday,
      ageTurning: target.getFullYear() - birthDateTime.getFullYear() + (nextBday.getFullYear() > target.getFullYear() ? 1 : 0),
    };
  };

  const nextBirthday = getNextBirthdayInfo();

  // Astrological & Zodiac Details
  const getZodiacInfo = () => {
    if (!birthDateTime) return null;
    const day = birthDateTime.getDate();
    const month = birthDateTime.getMonth() + 1; // 1-12
    const year = birthDateTime.getFullYear();

    // Western Zodiac
    const zodiacs = [
      { sign: 'Capricorn', symbol: '♑', element: 'Earth 🌍', ruler: 'Saturn', traits: 'Ambitious, Disciplined, Loyal', start: [12, 22], end: [1, 19] },
      { sign: 'Aquarius', symbol: '♒', element: 'Air 💨', ruler: 'Uranus', traits: 'Innovative, Visionary, Free-spirited', start: [1, 20], end: [2, 18] },
      { sign: 'Pisces', symbol: '♓', element: 'Water 💧', ruler: 'Neptune', traits: 'Intuitive, Artistic, Empathetic', start: [2, 19], end: [3, 20] },
      { sign: 'Aries', symbol: '♈', element: 'Fire 🔥', ruler: 'Mars', traits: 'Bold, Energetic, Pioneering', start: [3, 21], end: [4, 19] },
      { sign: 'Taurus', symbol: '♉', element: 'Earth 🌍', ruler: 'Venus', traits: 'Grounded, Patient, Sensual', start: [4, 20], end: [5, 20] },
      { sign: 'Gemini', symbol: '♊', element: 'Air 💨', ruler: 'Mercury', traits: 'Curious, Adaptable, Expressive', start: [5, 21], end: [6, 20] },
      { sign: 'Cancer', symbol: '♋', element: 'Water 💧', ruler: 'Moon', traits: 'Compassionate, Protective, Sensitive', start: [6, 21], end: [7, 22] },
      { sign: 'Leo', symbol: '♌', element: 'Fire 🔥', ruler: 'Sun', traits: 'Radiant, Generous, Charismatic', start: [7, 23], end: [8, 22] },
      { sign: 'Virgo', symbol: '♍', element: 'Earth 🌍', ruler: 'Mercury', traits: 'Analytical, Helpful, Detail-oriented', start: [8, 23], end: [9, 22] },
      { sign: 'Libra', symbol: '♎', element: 'Air 💨', ruler: 'Venus', traits: 'Harmonious, Diplomatic, Charming', start: [9, 23], end: [10, 22] },
      { sign: 'Scorpio', symbol: '♏', element: 'Water 💧', ruler: 'Pluto & Mars', traits: 'Intense, Passionate, Resilient', start: [10, 23], end: [11, 21] },
      { sign: 'Sagittarius', symbol: '♐', element: 'Fire 🔥', ruler: 'Jupiter', traits: 'Adventurous, Optimistic, Philosophical', start: [11, 22], end: [12, 21] },
    ];

    let western = zodiacs[0];
    for (const z of zodiacs) {
      const [sm, sd] = z.start;
      const [em, ed] = z.end;
      if (
        (month === sm && day >= sd) ||
        (month === em && day <= ed) ||
        (sm === 12 && em === 1 && ((month === 12 && day >= sd) || (month === 1 && day <= ed)))
      ) {
        western = z;
        break;
      }
    }

    // Chinese Zodiac
    const chineseAnimals = [
      { name: 'Rat', icon: '🐀', traits: 'Quick-witted, Resourceful, Versatile' },
      { name: 'Ox', icon: '🐂', traits: 'Diligent, Dependable, Determined' },
      { name: 'Tiger', icon: '🐅', traits: 'Brave, Confident, Competitive' },
      { name: 'Rabbit', icon: '🐇', traits: 'Gentle, Elegant, Compassionate' },
      { name: 'Dragon', icon: '🐉', traits: 'Charismatic, Powerful, Fortunate' },
      { name: 'Snake', icon: '🐍', traits: 'Enigmatic, Intelligent, Wise' },
      { name: 'Horse', icon: '🐎', traits: 'Animated, Energetic, Independent' },
      { name: 'Goat', icon: '🐐', traits: 'Calm, Gentle, Creative' },
      { name: 'Monkey', icon: '🐒', traits: 'Witty, Intelligent, Inventive' },
      { name: 'Rooster', icon: '🐓', traits: 'Observant, Hardworking, Courageous' },
      { name: 'Dog', icon: '🐕', traits: 'Lovely, Honest, Prudent' },
      { name: 'Pig', icon: '🐖', traits: 'Compassionate, Generous, Diligent' },
    ];
    // Base 1900 is Rat
    const chineseIndex = (year - 1900) % 12;
    const chinese = chineseAnimals[(chineseIndex + 12) % 12];

    // Birthstones & Flowers by month
    const birthstones = [
      'Garnet (Protection & Purity)',
      'Amethyst (Wisdom & Clarity)',
      'Aquamarine (Courage & Serenity)',
      'Diamond (Strength & Eternal Love)',
      'Emerald (Vitality & Good Fortune)',
      'Pearl / Alexandrite (Harmony & Grace)',
      'Ruby (Passion & Energy)',
      'Peridot (Beauty & Joy)',
      'Sapphire (Truth & Nobility)',
      'Opal / Tourmaline (Creativity & Hope)',
      'Topaz / Citrine (Warmth & Abundance)',
      'Tanzanite / Turquoise (Peace & Intuition)',
    ];

    const birthFlowers = [
      'Carnation & Snowdrop',
      'Violet & Primrose',
      'Daffodil',
      'Daisy & Sweet Pea',
      'Lily of the Valley & Hawthorn',
      'Rose & Honeysuckle',
      'Larkspur & Water Lily',
      'Gladiolus & Poppy',
      'Aster & Morning Glory',
      'Marigold & Cosmos',
      'Chrysanthemum',
      'Narcissus & Holly',
    ];

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const birthWeekday = weekdayNames[birthDateTime.getDay()];

    return {
      western,
      chinese,
      birthstone: birthstones[month - 1],
      birthFlower: birthFlowers[month - 1],
      birthWeekday,
    };
  };

  const cosmic = getZodiacInfo();

  // Planetary Ages (Creative Feature)
  const getPlanetaryAges = () => {
    if (!age) return [];
    const earthYears = age.years + age.months / 12 + age.days / 365.25;

    return [
      {
        planet: 'Mercury',
        orbitalPeriod: 0.2408467,
        color: 'from-amber-400 to-yellow-600',
        textColor: 'text-amber-600',
        badge: 'Fastest Orbit',
        desc: 'A year is only 88 Earth days! You celebrate birthdays every ~3 months.',
      },
      {
        planet: 'Venus',
        orbitalPeriod: 0.61519726,
        color: 'from-orange-400 to-amber-600',
        textColor: 'text-orange-600',
        badge: 'Twin Sister',
        desc: 'A Venusian year lasts 225 Earth days in dense radiant clouds.',
      },
      {
        planet: 'Mars',
        orbitalPeriod: 1.8808158,
        color: 'from-rose-500 to-red-600',
        textColor: 'text-rose-600',
        badge: 'Red Planet',
        desc: 'Takes 687 Earth days to orbit the Sun. You are about half your Earth age.',
      },
      {
        planet: 'Jupiter',
        orbitalPeriod: 11.862615,
        color: 'from-purple-500 to-indigo-600',
        textColor: 'text-purple-600',
        badge: 'Gas Giant',
        desc: 'Takes nearly 12 Earth years per revolution around the Sun.',
      },
      {
        planet: 'Saturn',
        orbitalPeriod: 29.447498,
        color: 'from-blue-500 to-cyan-600',
        textColor: 'text-blue-600',
        badge: 'Ringed Wonder',
        desc: 'Reaches a single orbit every 29.5 Earth years!',
      },
    ].map((p) => {
      const planetAge = earthYears / p.orbitalPeriod;
      return {
        ...p,
        ageVal: planetAge.toFixed(2),
        yearsFull: Math.floor(planetAge),
      };
    });
  };

  const planetaryAges = getPlanetaryAges();

  // Life Milestones
  const getMilestones = () => {
    if (!birthDateTime || !age) return [];

    const milestonesList = [
      { label: '1,000 Days on Earth', days: 1000, desc: 'Early toddler explorer' },
      { label: '5,000 Days on Earth', days: 5000, desc: 'Stepping into adolescence (~13.7 yrs)' },
      { label: '10,000 Days on Earth', days: 10000, desc: 'Golden youth milestone (~27.4 yrs)' },
      { label: '15,000 Days on Earth', days: 15000, desc: 'Thriving mid-career mastery (~41.1 yrs)' },
      { label: '20,000 Days on Earth', days: 20000, desc: 'Wisdom & leadership era (~54.7 yrs)' },
      { label: '25,000 Days on Earth', days: 25000, desc: 'Senior prestige milestone (~68.5 yrs)' },
      { label: '1 Billion Seconds Alive', days: Math.round(1000000000 / 86400), desc: 'Exactly 1,000,000,000 seconds on planet Earth!' },
      { label: 'Silver Jubilee (25 Years)', days: Math.round(25 * 365.25), desc: 'Quarter century celebration' },
      { label: 'Golden Jubilee (50 Years)', days: Math.round(50 * 365.25), desc: 'Half-century milestone' },
    ];

    return milestonesList.map((m) => {
      const milestoneDate = new Date(birthDateTime.getTime() + m.days * 86400 * 1000);
      const isReached = targetDateTime >= milestoneDate;
      const daysDiff = Math.abs(Math.ceil((milestoneDate - targetDateTime) / (1000 * 60 * 60 * 24)));

      return {
        ...m,
        date: milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isReached,
        daysDiff,
      };
    });
  };

  const milestones = getMilestones();

  // Quick Preset Handlers
  const handlePreset = (yearsBack) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsBack);
    setBirthDate(d.toISOString().split('T')[0]);
    toast.success(`Set birthdate to ${yearsBack} years ago!`, { icon: '✨' });
  };

  // Confetti Particle Explosion Effect
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles = [];
    const colors = ['#CC0000', '#F5A623', '#4F46E5', '#10B981', '#EC4899', '#3B82F6', '#8B5CF6'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: width / 2,
        y: height / 2 + 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.2) * 18 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        opacity: 1,
      });
    }

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      let activeParticles = 0;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.opacity -= 0.009;

        if (p.opacity > 0) {
          activeParticles++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      });

      if (activeParticles > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        cancelAnimationFrame(animationId);
      }
    };

    render();
    toast.success('🎉 Birthday Confetti Activated!', { icon: '🎂' });
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!age || !cosmic) return;
    const summary = `🎂 My Age & Life Summary
🗓️ Born on: ${birthDate} (${cosmic.birthWeekday})
⏳ Exact Age: ${age.years} Years, ${age.months} Months, ${age.days} Days
✨ Total Days Lived: ${age.totalDays.toLocaleString()} Days
💓 Estimated Heartbeats: ${(age.totalMinutes * 80).toLocaleString()}
🪐 Planetary Zodiac: ${cosmic.western.symbol} ${cosmic.western.sign} (${cosmic.western.element})
🐉 Chinese Zodiac: ${cosmic.chinese.icon} ${cosmic.chinese.name}
🎈 Next Birthday: In ${nextBirthday?.daysRemaining} days on a ${nextBirthday?.weekday}!
Calculated via Star Graphix Creative Tools ✨`;

    navigator.clipboard.writeText(summary);
    toast.success('Age & Life summary copied to clipboard!', { icon: '📋' });
  };

  return (
    <div className="relative space-y-8 font-outfit text-left animate-fade-in">
      {/* Fullscreen Confetti Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
              <Icon name="Sparkles" size={14} className="text-yellow-300 animate-spin" /> Chronological & Celestial Explorer
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Creative Age & Life Calculator
            </h1>
            <p className="text-rose-100 text-sm max-w-xl">
              Calculate your precise chronological age down to the second, upcoming birthday radar, biological beats, and cosmic planetary ages.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerConfetti}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm border border-white/30 hover:scale-105 active:scale-95"
            >
              <Icon name="Cake" size={16} className="text-yellow-300" /> Confetti Burst
            </button>
            <button
              onClick={handleCopySummary}
              className="px-4 py-2.5 rounded-xl bg-white text-gray-900 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:bg-gray-50 hover:scale-105 active:scale-95"
            >
              <Icon name="Share" size={14} className="text-rose-600" /> Share Summary
            </button>
          </div>
        </div>
      </div>

      {/* Birthday Celebration Banner if today is their birthday! */}
      {nextBirthday?.isToday && (
        <div className="rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 p-1 text-white shadow-lg animate-pulse">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl animate-bounce">🎂</span>
              <div className="text-left">
                <h3 className="text-xl font-black tracking-wide text-white">HAPPY BIRTHDAY! 🎉</h3>
                <p className="text-xs text-yellow-100">Today marks the start of another radiant chapter around the Sun! Have an extraordinary year!</p>
              </div>
            </div>
            <button
              onClick={triggerConfetti}
              className="px-5 py-2.5 bg-white text-pink-600 font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all"
            >
              Launch Fireworks 🎆
            </button>
          </div>
        </div>
      )}

      {/* Input Control Hub */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Date Picker */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-primary-600" /> Select Date of Birth
              </label>
              <button
                type="button"
                onClick={() => setHasBirthTime(!hasBirthTime)}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                <Icon name="Clock" size={14} />
                {hasBirthTime ? 'Remove Birth Time' : '+ Add Exact Birth Time'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-base font-semibold border-2 border-gray-200 rounded-2xl px-4 py-3.5 focus:border-primary-600 focus:ring-4 focus:ring-primary-50 outline-none transition-all font-mono text-gray-800 bg-gray-50/50 hover:bg-white"
                />
              </div>

              {hasBirthTime ? (
                <div className="relative animate-scale-in">
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full text-base font-semibold border-2 border-indigo-200 rounded-2xl px-4 py-3.5 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-mono text-gray-800 bg-indigo-50/30"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-indigo-500 font-bold bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                    Live Precision
                  </span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center text-xs text-gray-400 bg-gray-50 rounded-2xl px-4 py-3.5 border border-dashed border-gray-200">
                  Default birth time is set to midnight (12:00 AM)
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Quick Age Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '👶 1 Year Old', years: 1 },
                  { label: '🎓 18 Years (Adulthood)', years: 18 },
                  { label: '🚀 21 Years (Prime)', years: 21 },
                  { label: '✨ 25 Years (Silver)', years: 25 },
                  { label: '💻 30 Years', years: 30 },
                  { label: '👑 50 Years (Golden)', years: 50 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.years)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-600 border border-gray-200 hover:border-primary-200 transition-all active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Comparison Mode Switcher */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl p-5 border border-gray-200/80 space-y-3">
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
              Calculate Age As Of:
            </label>

            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setTargetDateMode('now')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  targetDateMode === 'now'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Today
              </button>
              <button
                type="button"
                onClick={() => setTargetDateMode('custom')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  targetDateMode === 'custom'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Custom Date
              </button>
            </div>

            {targetDateMode === 'custom' && (
              <div className="animate-scale-in pt-1">
                <input
                  type="date"
                  value={customTargetDate}
                  onChange={(e) => setCustomTargetDate(e.target.value)}
                  className="w-full text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 outline-none font-mono focus:border-primary-600 bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">Calculates exact age at that future or past milestone date.</p>
              </div>
            )}

            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
              <Icon name="Clock" size={13} className="text-emerald-500" />
              <span>Current Time: <strong className="font-mono text-gray-700">{currentTime.toLocaleTimeString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Age Hero Visual Display */}
      {age ? (
        <div className="space-y-8">
          {/* Primary Cards: Years, Months, Days + Live Ticking Seconds */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            {/* YEARS */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 p-6 sm:p-7 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-2 right-3 text-6xl font-black text-white/10 select-none group-hover:scale-110 transition-transform">
                YR
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-rose-200">Solar Revolutions</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono">{age.years}</span>
                <span className="text-lg font-bold text-rose-100">Years</span>
              </div>
              <p className="mt-3 text-xs text-rose-100/90 font-medium">
                {age.years > 0 ? `Completed ${age.years} full orbits around the Sun` : 'Less than one year on Earth'}
              </p>
            </div>

            {/* MONTHS */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 sm:p-7 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-2 right-3 text-6xl font-black text-white/10 select-none group-hover:scale-110 transition-transform">
                MO
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-200">Lunar Cycles</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono">{age.months}</span>
                <span className="text-lg font-bold text-amber-100">Months</span>
              </div>
              <p className="mt-3 text-xs text-amber-100/90 font-medium">
                Plus {age.months} months since last birth anniversary
              </p>
            </div>

            {/* DAYS */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 p-6 sm:p-7 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-2 right-3 text-6xl font-black text-white/10 select-none group-hover:scale-110 transition-transform">
                DY
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-200">Earth Rotations</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono">{age.days}</span>
                <span className="text-lg font-bold text-indigo-100">Days</span>
              </div>
              <p className="mt-3 text-xs text-indigo-100/90 font-medium">
                And {age.days} days into the current month
              </p>
            </div>

            {/* LIVE TICKING PRECISE SECONDS */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-7 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-200">Live Precision</span>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  LIVE
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1 font-mono text-3xl sm:text-4xl font-black tracking-tight">
                <span>{String(age.hours).padStart(2, '0')}</span>
                <span className="text-emerald-300">:</span>
                <span>{String(age.minutes).padStart(2, '0')}</span>
                <span className="text-emerald-300">:</span>
                <span className="text-yellow-300">{String(age.seconds).padStart(2, '0')}</span>
              </div>
              <p className="mt-3 text-xs text-emerald-100/90 font-medium">
                Hours : Minutes : Seconds ticking in real time
              </p>
            </div>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-2">
            {[
              { id: 'overview', label: 'Life Metrics & Vitals', icon: 'BarChart' },
              { id: 'radar', label: 'Birthday Radar', icon: 'Calendar' },
              { id: 'cosmic', label: 'Zodiac & Celestial', icon: 'Sparkles' },
              { id: 'milestones', label: 'Earth Milestones', icon: 'Check' },
              { id: 'planets', label: 'Planetary Ages', icon: 'Planet' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50 rounded-t-xl'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon name={tab.icon} size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & BIOLOGICAL VITALS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Days', value: age.totalDays.toLocaleString(), sub: 'Days on Earth', icon: 'Calendar', bg: 'bg-blue-50 text-blue-600' },
                  { label: 'Total Weeks', value: age.totalWeeks.toLocaleString(), sub: `+ ${age.remainingDaysAfterWeeks} days`, icon: 'Layers', bg: 'bg-purple-50 text-purple-600' },
                  { label: 'Total Hours', value: age.totalHours.toLocaleString(), sub: 'Hours of consciousness', icon: 'Clock', bg: 'bg-amber-50 text-amber-600' },
                  { label: 'Total Minutes', value: age.totalMinutes.toLocaleString(), sub: 'Minutes experienced', icon: 'Cpu', bg: 'bg-rose-50 text-rose-600' },
                  { label: 'Total Seconds', value: age.totalSeconds.toLocaleString(), sub: 'Heartfelt seconds', icon: 'Sparkles', bg: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Sleep Time', value: Math.round(age.totalDays * 8).toLocaleString(), sub: 'Hours resting (~8h/d)', icon: 'Clock', bg: 'bg-indigo-50 text-indigo-600' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center mb-2`}>
                      <Icon name={item.icon} size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{item.label}</span>
                    <span className="text-xl sm:text-2xl font-black text-gray-800 font-mono block mt-1">{item.value}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">{item.sub}</span>
                  </div>
                ))}
              </div>

              {/* Biological Rhythm Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heartbeats */}
                <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse flex-shrink-0">
                    <Icon name="HeartPulse" size={32} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-500">Biological Rhythm</span>
                    <h3 className="text-2xl font-black text-gray-900 font-mono mt-0.5">
                      ~{(age.totalMinutes * 80).toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated heartbeats pumped at average resting rate of 80 beats per minute. Each beat has sustained your wondrous journey!
                    </p>
                  </div>
                </div>

                {/* Breaths Taken */}
                <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-200 flex-shrink-0">
                    <Icon name="Sparkles" size={32} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-600">Respiratory Miracle</span>
                    <h3 className="text-2xl font-black text-gray-900 font-mono mt-0.5">
                      ~{(age.totalMinutes * 16).toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated breaths of fresh Earth atmosphere inhaled at approximately 16 breaths per minute.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIRTHDAY RADAR */}
          {activeTab === 'radar' && nextBirthday && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-xs font-black text-primary-600 uppercase tracking-wider">Next Anniversary</span>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                    Turning {nextBirthday.ageTurning} Years Old
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Mark your calendar: <strong className="text-gray-800 font-semibold">{nextBirthday.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> falls on a <strong className="text-primary-600">{nextBirthday.weekday}</strong>!
                  </p>
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-2xl px-6 py-4 text-center">
                  <span className="text-[10px] uppercase tracking-widest font-black text-primary-700 block">Countdown</span>
                  <span className="text-4xl font-black text-primary-600 font-mono leading-none block mt-1">
                    {nextBirthday.daysRemaining}
                  </span>
                  <span className="text-xs font-bold text-primary-800">Days Remaining</span>
                </div>
              </div>

              {/* Progress to next birthday */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-2">
                  <span>Year Completion Progress</span>
                  <span>{Math.round(((365 - nextBirthday.daysRemaining) / 365) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200">
                  <div
                    className="bg-gradient-to-r from-primary-500 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(5, ((365 - nextBirthday.daysRemaining) / 365) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Fun birthday facts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Day of the Week</span>
                  <p className="text-base font-black text-gray-800 mt-1">{nextBirthday.weekday}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {nextBirthday.weekday === 'Saturday' || nextBirthday.weekday === 'Sunday'
                      ? 'Weekend Party vibes! 🎉'
                      : 'Weekday celebration ✨'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Half-Birthday</span>
                  <p className="text-base font-black text-gray-800 mt-1">
                    {new Date(birthDateTime.getFullYear(), birthDateTime.getMonth() + 6, birthDateTime.getDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Celebrate your 6-month halfway point</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Day Born On</span>
                  <p className="text-base font-black text-gray-800 mt-1">{cosmic?.birthWeekday}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Your original weekday of arrival</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ZODIAC & COSMIC */}
          {activeTab === 'cosmic' && cosmic && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {/* Western Zodiac Card */}
              <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600">Western Astrology</span>
                  <span className="text-3xl">{cosmic.western.symbol}</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{cosmic.western.sign}</h3>
                <div className="flex flex-wrap gap-2 my-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                    Element: {cosmic.western.element}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                    Ruler: {cosmic.western.ruler}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong className="text-gray-900 font-semibold">Core Traits:</strong> {cosmic.western.traits}
                </p>
                <div className="mt-6 pt-4 border-t border-purple-100/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block font-semibold">Birthstone</span>
                    <strong className="text-gray-800">{cosmic.birthstone}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Birth Flower</span>
                    <strong className="text-gray-800">{cosmic.birthFlower}</strong>
                  </div>
                </div>
              </div>

              {/* Chinese Zodiac Card */}
              <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600">Eastern Chinese Zodiac</span>
                  <span className="text-4xl">{cosmic.chinese.icon}</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Year of the {cosmic.chinese.name}</h3>
                <div className="flex flex-wrap gap-2 my-3">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    Lunar Calendar Spirit
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong className="text-gray-900 font-semibold">Symbolic Strengths:</strong> {cosmic.chinese.traits}
                </p>
                <div className="mt-6 pt-4 border-t border-amber-100/80 text-xs">
                  <span className="text-gray-400 block font-semibold">Born on a</span>
                  <strong className="text-base text-gray-800">{cosmic.birthWeekday}</strong>
                  <p className="text-gray-500 mt-1">
                    Ancient lore: Day of birth carries distinct vibrational harmony and energetic strengths.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EARTH MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-black text-gray-800">Life Milestone Tracker</h3>
                <p className="text-xs text-gray-500 mt-1">Track major chronological benchmarks you have conquered and what's on the horizon.</p>
              </div>

              <div className="divide-y divide-gray-100">
                {milestones.map((m) => (
                  <div key={m.label} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        m.isReached ? 'bg-emerald-100 text-emerald-600 font-bold' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {m.isReached ? '✓' : '○'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{m.label}</h4>
                        <p className="text-xs text-gray-400">{m.desc} • {m.date}</p>
                      </div>
                    </div>

                    <div>
                      {m.isReached ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          ✨ Achieved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          ⏳ In {m.daysDiff.toLocaleString()} Days
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PLANETARY AGES */}
          {activeTab === 'planets' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gray-900 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black flex items-center justify-center sm:justify-start gap-2">
                    <Icon name="Planet" size={20} className="text-yellow-400" /> Planetary Age Simulator
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Because planets have different orbital years around the Sun, your age changes drastically depending on which world you stand on!</p>
                </div>
                <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  Earth Age: {age.years}y {age.months}m
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {planetaryAges.map((p) => (
                  <div key={p.planet} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${p.color} text-white flex items-center justify-center shadow-sm`}>
                          <Icon name="Planet" size={18} />
                        </div>
                        <h4 className="font-black text-gray-900 text-lg">{p.planet}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {p.badge}
                      </span>
                    </div>

                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-black text-gray-900 font-mono">{p.ageVal}</span>
                      <span className="text-xs font-bold text-gray-400 ml-1.5">years old</span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed mt-2">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-800">
          <p className="text-sm font-bold">Please select a valid birth date in the past to calculate your age.</p>
        </div>
      )}
    </div>
  );
}
