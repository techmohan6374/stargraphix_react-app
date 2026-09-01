import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function ThanglishTypingTool() {
  const [inputText, setInputText] = useState('');
  const [tamilText, setTamilText] = useState('');
  const [selectedLang, setSelectedLang] = useState('ta'); // 'ta', 'hi', 'te', 'ml', 'kn', 'bn', 'mr'
  const [fontSize, setFontSize] = useState(20);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const debounceTimer = useRef(null);

  // Available languages list
  const languages = [
    { id: 'ta', name: 'Tamil (Tanglish -> தமிழ்)', active: true, script: 'தமிழ்' },
    { id: 'hi', name: 'Hindi (Hinglish -> हिंदी)', active: false, script: 'हिंदी' },
    { id: 'te', name: 'Telugu (Tenglish -> తెలుగు)', active: false, script: 'తెలుగు' },
    { id: 'ml', name: 'Malayalam (Manglish -> മലയാളം)', active: false, script: 'മലയാളം' },
    { id: 'kn', name: 'Kannada (Kanglish -> ಕನ್ನಡ)', active: false, script: 'ಕನ್ನಡ' },
    { id: 'bn', name: 'Bengali (Banglish -> বাংলা)', active: false, script: 'বাংলা' },
    { id: 'mr', name: 'Marathi (Marathiglish -> मराठी)', active: false, script: 'மராத்தி' },
  ];

  // Quick Tamil common phrases
  const quickPhrases = [
    { label: 'Vanakkam', ta: 'வணக்கம்' },
    { label: 'Nandri', ta: 'நன்றி' },
    { label: 'Kaalai Vanakkam', ta: 'காலை வணக்கம்' },
    { label: 'Iravu Vanakkam', ta: 'இரவு வணக்கம்' },
    { label: 'Eppadi Irukkinga', ta: 'எப்படி இருக்கீங்க?' },
    { label: 'Nalvaazhthukkal', ta: 'நல்வாழ்த்துகள்' },
    { label: 'Tamil', ta: 'தமிழ்' },
    { label: 'Mikka Nandri', ta: 'மிக்க நன்றி' },
    { label: 'Anbudan', ta: 'அன்புடன்' },
  ];

  // Primary Google Input Tools API transliteration with local dictionary fallback
  const transliterateTanglish = async (text) => {
    if (!text.trim()) {
      setTamilText('');
      return;
    }

    setIsTranslating(true);

    try {
      // Split into words to send to Google Input Tools API
      const words = text.split(/(\s+)/);
      const transliteratedWords = await Promise.all(
        words.map(async (word) => {
          // If whitespace or numbers/punctuation, preserve as-is
          if (!word.trim() || /^[\d\s\W]+$/.test(word)) {
            return word;
          }

          try {
            const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
              word
            )}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`;
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.[0]) {
                return data[1][0][1][0];
              }
            }
          } catch (err) {
            console.warn(`API call failed for word "${word}", using local fallback:`, err);
          }

          // Fallback to local dictionary / rule engine
          return localPhoneticFallback(word);
        })
      );

      setTamilText(transliteratedWords.join(''));
    } catch (err) {
      console.error('Transliteration failed:', err);
      setTamilText(localPhoneticFallback(text));
    } finally {
      setIsTranslating(false);
    }
  };

  // Local rule-based dictionary & phonetic converter fallback
  const localPhoneticFallback = (word) => {
    const dict = {
      vanakkam: 'வணக்கம்',
      nandri: 'நன்றி',
      tamil: 'தமிழ்',
      eppadi: 'எப்படி',
      irukkinga: 'இருக்கீங்க',
      kaalai: 'காலை',
      iravu: 'இரவு',
      kalai: 'காலை',
      en: 'என்',
      peyar: 'பெயர்',
      unmai: 'உண்மை',
      nanban: 'நண்பன்',
      nanba: 'நண்பா',
      vaazhthukkal: 'வாழ்த்துகள்',
      vaalthukkal: 'வாழ்த்துகள்',
      santhosam: 'சந்தோஷம்',
      mikka: 'மிக்க',
      anbudan: 'அன்புடன்',
      amaam: 'ஆமாம்',
      illai: 'இல்லை',
      seri: 'சரி',
      vanga: 'வாங்க',
      ponga: 'போங்க',
      romba: 'ரொம்ப',
      nalla: 'நல்ல',
      nalladhu: 'நல்லது',
    };

    const lower = word.toLowerCase().trim();
    if (dict[lower]) {
      return dict[lower];
    }

    // Basic letter substitution fallback
    let res = lower
      .replace(/zh/g, 'ழ்')
      .replace(/th/g, 'த்')
      .replace(/sh/g, 'ஷ்')
      .replace(/ch/g, 'ச்')
      .replace(/ng/g, 'ங்')
      .replace(/nj/g, 'ஞ்')
      .replace(/aa/g, 'ஆ')
      .replace(/ee/g, 'ஈ')
      .replace(/oo/g, 'ஊ')
      .replace(/ai/g, 'ஐ')
      .replace(/au/g, 'ஔ')
      .replace(/k/g, 'க்')
      .replace(/g/g, 'க்')
      .replace(/c/g, 'ச்')
      .replace(/j/g, 'ஜ்')
      .replace(/t/g, 'ட்')
      .replace(/d/g, 'ட்')
      .replace(/n/g, 'ன்')
      .replace(/p/g, 'ப்')
      .replace(/b/g, 'ப்')
      .replace(/m/g, 'ம்')
      .replace(/y/g, 'ய்')
      .replace(/r/g, 'ர்')
      .replace(/l/g, 'ல்')
      .replace(/v/g, 'வ்')
      .replace(/w/g, 'வ்')
      .replace(/s/g, 'ஸ்')
      .replace(/h/g, 'ஹ்');

    return res || word;
  };

  // Debounced input handler for live typing
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      transliterateTanglish(val);
    }, 250);
  };

  // Language selection change
  const handleLanguageChange = (e) => {
    const langId = e.target.value;
    setSelectedLang(langId);
    const selected = languages.find((l) => l.id === langId);

    if (!selected.active) {
      toast(
        `Currently Tamil (Tanglish -> தமிழ்) live transliteration is active. ${selected.name} will be added in the next update!`,
        { icon: '🚀', duration: 4000 }
      );
    }
  };

  // Copy Tamil Text
  const handleCopy = () => {
    if (!tamilText) return;
    navigator.clipboard.writeText(tamilText);
    setCopied(true);
    toast.success('Tamil text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download TXT file
  const handleDownloadTxt = () => {
    if (!tamilText) return;
    const blob = new Blob([tamilText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tamil_text_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Tamil Text File!');
  };

  // Insert Quick Phrase
  const handleInsertPhrase = (phrase) => {
    const newTanglish = inputText ? `${inputText} ${phrase.label}` : phrase.label;
    const newTamil = tamilText ? `${tamilText} ${phrase.ta}` : phrase.ta;
    setInputText(newTanglish);
    setTamilText(newTamil);
  };

  // Word & Character count
  const charCount = tamilText.length;
  const wordCount = tamilText.trim() ? tamilText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 text-left font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <Icon name="FileText" size={22} />
            </span>
            Thanglish to Tamil Typing Tool (தங்குலிஷ் தமிழ்)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Type phonetically in Tanglish / English (e.g. <span className="font-mono text-gray-600">vanakkam nanba</span>) and get instant Tamil script (<span className="font-mono text-primary-600 font-bold">வணக்கம் நண்பா</span>).
          </p>
        </div>

        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
            Language:
          </label>
          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            className="border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold bg-white text-gray-800 focus:border-primary-600 outline-none shadow-xs cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} {!lang.active ? '(Coming Soon)' : '✓'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notice Banner for Non-Tamil Languages */}
      {selectedLang !== 'ta' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2.5 animate-fade-in">
          <Icon name="Info" size={16} className="text-amber-600 flex-shrink-0" />
          <span>
            <strong>Future Update Notice:</strong> Live transliteration for {languages.find(l => l.id === selectedLang)?.name} is currently under development. Tamil live typing remains active below!
          </span>
        </div>
      )}

      {/* Quick Phrase Chips Bar */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
          Quick Insert Phrases:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPhrases.map((phrase) => (
            <button
              key={phrase.label}
              onClick={() => handleInsertPhrase(phrase)}
              className="bg-gray-100 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>{phrase.ta}</span>
              <span className="text-[10px] text-gray-400 font-mono">({phrase.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Grid: Tanglish Input vs Tamil Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT: Tanglish Input Box */}
        <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="Edit" size={14} className="text-gray-500" /> Type Tanglish / Phonetic English
            </span>
            {isTranslating && (
              <span className="text-[10px] font-bold text-primary-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>
                Converting...
              </span>
            )}
          </div>

          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type in Tanglish here (e.g. vanakkam, eppadi irukkinga, nandri)..."
            rows={8}
            className="w-full p-4 rounded-2xl border border-gray-200 focus:border-primary-600 outline-none bg-white text-sm text-gray-800 placeholder-gray-400 font-outfit resize-none shadow-inner transition-all"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 font-semibold">
              Tip: Press space or type words naturally
            </span>
            {inputText && (
              <button
                onClick={() => { setInputText(''); setTamilText(''); }}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <Icon name="Trash" size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Tamil Script Output Box */}
        <div className="flex flex-col bg-primary-50/40 border border-primary-150 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="CheckCircle" size={14} className="text-primary-600" /> Live Tamil Script Output (தமிழ்)
            </span>

            {/* Font Size Adjuster Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Font Size:</span>
              <input
                type="range"
                min="16"
                max="36"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-20 accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded"
                title="Adjust Tamil Font Size"
              />
              <span className="text-[11px] font-mono font-bold text-primary-700">{fontSize}px</span>
            </div>
          </div>

          <textarea
            value={tamilText}
            readOnly
            placeholder="தமிழ் உரை இங்கே தோன்றும் (Tamil script output will appear here live)..."
            rows={8}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            className="w-full p-4 rounded-2xl border border-primary-200 outline-none bg-white text-gray-900 font-bold placeholder-gray-300 resize-none shadow-inner transition-all font-outfit"
          />

          {/* Bottom Actions & Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
              <span>Words: <span className="text-primary-700 font-mono">{wordCount}</span></span>
              <span>•</span>
              <span>Chars: <span className="text-primary-700 font-mono">{charCount}</span></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTxt}
                disabled={!tamilText}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                  tamilText
                    ? 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    : 'bg-gray-100 text-gray-300 border border-gray-150 cursor-not-allowed'
                }`}
              >
                <Icon name="Download" size={13} /> Download .TXT
              </button>

              <button
                onClick={handleCopy}
                disabled={!tamilText}
                className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : tamilText
                    ? 'btn-primary'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Icon name={copied ? 'Check' : 'Share'} size={14} />
                {copied ? 'Copied!' : 'Copy Tamil Text'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Guide Footer */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-500 leading-relaxed">
        <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-1.5">
          <Icon name="Info" size={14} className="text-primary-600" /> How to use Thanglish Tamil Typing:
        </h4>
        <p>
          Simply type words using standard English letters based on how they sound in Tamil (e.g., <code className="bg-white px-1.5 py-0.5 rounded border text-primary-700 font-bold">vanakkam</code>, <code className="bg-white px-1.5 py-0.5 rounded border text-primary-700 font-bold">nandri</code>, <code className="bg-white px-1.5 py-0.5 rounded border text-primary-700 font-bold">kaalai vanakkam</code>). The tool instantly converts your text into proper Tamil Unicode characters ready to copy into Photoshop, Canva, WhatsApp, or Social Media.
        </p>
      </div>

    </div>
  );
}
