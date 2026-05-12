import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Brain, Clock, Play, ChevronRight, RotateCcw, CheckCircle2,
  XCircle, Trophy, AlertCircle, BookOpen, Sparkles, Target,
  TrendingUp, Eye, EyeOff, Pause, Award, BarChart3, Zap,
  Flame, Keyboard, Settings2, Sun, Moon, Upload, FileText, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Papa from 'papaparse';
import { DEFAULT_QUESTIONS } from './questions';


// ============================================================
// CONFIG DOMAINES
// ============================================================
const DOMAINS = {
  1: { name: "Fondamentaux IA / ML", short: "D1", color: "#FF9900", weight: "20%" },
  2: { name: "Fondamentaux IA générative", short: "D2", color: "#22D3EE", weight: "24%" },
  3: { name: "Applications modèles de fondation", short: "D3", color: "#A78BFA", weight: "28%" },
  4: { name: "IA responsable", short: "D4", color: "#F472B6", weight: "14%" },
  5: { name: "Sécurité, conformité, gouvernance", short: "D5", color: "#4ADE80", weight: "14%" }
};

const LETTERS = ['A', 'B', 'C', 'D'];

// ============================================================
// FONTS
// ============================================================
const useGoogleFonts = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);
};

const FONT_SERIF = "'Instrument Serif', 'Times New Roman', serif";
const FONT_SANS = "'Geist', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  useGoogleFonts();

  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [theme, setTheme] = useState('dark');
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('training');
  const [numQuestions, setNumQuestions] = useState(20);
  const [selectedDomains, setSelectedDomains] = useState([1, 2, 3, 4, 5]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(40);

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showImport, setShowImport] = useState(false);

  const isDark = theme === 'dark';
  const T = useMemo(() => isDark ? {
    bg1: '#0a0a0a', bg2: '#1a1a1a', card: 'rgba(20,20,20,0.6)', cardSolid: '#111',
    border: '#232323', borderH: '#3a3a3a', text: '#fafafa', textDim: '#a1a1aa',
    textMuted: '#71717a', accent: '#FF9900', accentH: '#ffad33', glassBg: 'rgba(255,255,255,0.02)'
  } : {
    bg1: '#fafafa', bg2: '#f0f0f0', card: 'rgba(255,255,255,0.7)', cardSolid: '#fff',
    border: '#e5e5e5', borderH: '#d4d4d4', text: '#0a0a0a', textDim: '#525252',
    textMuted: '#737373', accent: '#FF6600', accentH: '#ff8533', glassBg: 'rgba(0,0,0,0.02)'
  }, [isDark]);

  const finishQuiz = useCallback(() => setScreen('results'), []);

  // Timer
  useEffect(() => {
    if (screen !== 'quiz' || !timerEnabled || isPaused || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); finishQuiz(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, timerEnabled, isPaused, timeLeft, finishQuiz]);

  const startQuiz = () => {
    const pool = questions.filter(q => selectedDomains.includes(q.d));
    if (pool.length === 0) return;
    const n = Math.min(numQuestions, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, n);
    setQuiz(shuffled); setCurrentIdx(0); setAnswers({}); setSelectedAnswer(null);
    setRevealed(false); setTimeLeft(timerDuration * 60); setIsPaused(false);
    setStreak(0); setMaxStreak(0); setScreen('quiz');
  };

  const goNext = useCallback(() => {
    setCurrentIdx(prev => {
      if (!quiz || prev + 1 >= quiz.length) { finishQuiz(); return prev; }
      return prev + 1;
    });
    setSelectedAnswer(null);
    setRevealed(false);
  }, [quiz, finishQuiz]);

  const submitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;
    const q = quiz[currentIdx];
    const correct = selectedAnswer === q.a;
    setAnswers(prev => ({ ...prev, [q.i]: selectedAnswer }));
    if (correct) {
      setStreak(s => { const ns = s + 1; setMaxStreak(m => Math.max(m, ns)); return ns; });
    } else {
      setStreak(0);
    }
    if (mode === 'training') setRevealed(true);
    else goNext();
  }, [selectedAnswer, quiz, currentIdx, mode, goNext]);

  // Keyboard shortcuts
  useEffect(() => {
    if (screen !== 'quiz') return;
    const handler = (e) => {
      if (revealed) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNext(); }
        return;
      }
      if (['1','a','A'].includes(e.key)) setSelectedAnswer(0);
      else if (['2','b','B'].includes(e.key)) setSelectedAnswer(1);
      else if (['3','c','C'].includes(e.key)) setSelectedAnswer(2);
      else if (['4','d','D'].includes(e.key)) setSelectedAnswer(3);
      else if (e.key === 'Enter' && selectedAnswer !== null) { e.preventDefault(); submitAnswer(); }
      else if (e.key === ' ' && timerEnabled) { e.preventDefault(); setIsPaused(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, revealed, selectedAnswer, timerEnabled, goNext, submitAnswer]);

  const resetAll = () => {
    setScreen('home'); setQuiz(null); setCurrentIdx(0); setAnswers({});
    setSelectedAnswer(null); setRevealed(false); setStreak(0); setMaxStreak(0);
  };

  const toggleDomain = (d) => setSelectedDomains(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const handleCSVImport = (files) => {
    if (!files || files.length === 0) return;
    let imported = [];
    let processed = 0;
    Array.from(files).forEach(file => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (res) => {
          res.data.forEach(row => {
            if (row.id && row.question && row.option_a && row.correct_answer) {
              imported.push({
                i: row.id, d: parseInt(row.domain), df: row.difficulty?.[0] || 'm',
                q: row.question, o: [row.option_a, row.option_b, row.option_c, row.option_d],
                a: LETTERS.indexOf(row.correct_answer.trim().toUpperCase()),
                e: row.explanation || '', s: row.service || '-'
              });
            }
          });
          processed++;
          if (processed === files.length) {
            const existing = new Set(questions.map(q => q.i));
            const newOnes = imported.filter(q => !existing.has(q.i));
            setQuestions([...questions, ...newOnes]);
            setShowImport(false);
            alert(`✅ ${newOnes.length} questions importées ! Total : ${questions.length + newOnes.length}`);
          }
        }
      });
    });
  };

  const results = useMemo(() => {
    if (!quiz) return null;
    const total = quiz.length;
    let correct = 0;
    const byDomain = {};
    Object.keys(DOMAINS).forEach(d => byDomain[d] = { total: 0, correct: 0 });
    quiz.forEach(q => {
      byDomain[q.d].total++;
      if (answers[q.i] === q.a) { correct++; byDomain[q.d].correct++; }
    });
    const pct = total === 0 ? 0 : (correct / total) * 100;
    const awsScore = Math.round(100 + (pct / 100) * 900);
    return { total, correct, pct, awsScore, passed: awsScore >= 700, byDomain, maxStreak };
  }, [quiz, answers, maxStreak]);

  return (
    <div style={{
      minHeight: '100vh', background: T.bg1, color: T.text,
      fontFamily: FONT_SANS, position: 'relative', overflow: 'hidden'
    }}>
      <MeshGradientBg isDark={isDark} />
      <ThemeToggle theme={theme} setTheme={setTheme} T={T} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '920px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {screen === 'home' && (
          <HomeScreen
            T={T} isDark={isDark}
            mode={mode} setMode={setMode}
            numQuestions={numQuestions} setNumQuestions={setNumQuestions}
            selectedDomains={selectedDomains} toggleDomain={toggleDomain}
            timerEnabled={timerEnabled} setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration} setTimerDuration={setTimerDuration}
            startQuiz={startQuiz}
            questions={questions} questionsCount={questions.length}
            showImport={() => setShowImport(true)}
          />
        )}
        {screen === 'quiz' && quiz && (
          <QuizScreen
            T={T} isDark={isDark}
            quiz={quiz} currentIdx={currentIdx}
            selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer}
            revealed={revealed} mode={mode} answers={answers}
            timerEnabled={timerEnabled} timeLeft={timeLeft}
            isPaused={isPaused} setIsPaused={setIsPaused}
            submitAnswer={submitAnswer} goNext={goNext} finishQuiz={finishQuiz}
            streak={streak}
          />
        )}
        {screen === 'results' && results && (
          <ResultsScreen T={T} isDark={isDark} quiz={quiz} answers={answers} results={results} resetAll={resetAll} />
        )}
      </div>
      {showImport && <ImportModal T={T} isDark={isDark} onClose={() => setShowImport(false)} onImport={handleCSVImport} />}
    </div>
  );
}

// ============================================================
// ANIMATED MESH GRADIENT BACKGROUND
// ============================================================
function MeshGradientBg({ isDark }) {
  const colors = isDark
    ? ['rgba(255,153,0,0.12)', 'rgba(167,139,250,0.10)', 'rgba(34,211,238,0.08)']
    : ['rgba(255,153,0,0.15)', 'rgba(167,139,250,0.12)', 'rgba(34,211,238,0.10)'];
  return (
    <>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,-50px) scale(1.1)} 66%{transform:translate(-40px,40px) scale(0.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-60px,40px) scale(1.05)} 66%{transform:translate(50px,-30px) scale(1.15)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,60px) scale(1.1)} 66%{transform:translate(-50px,-50px) scale(0.9)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{transform:translateX(-12px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(74,222,128,0.3)} 50%{box-shadow:0 0 40px rgba(74,222,128,0.6)} }
        @keyframes scoreReveal { from{stroke-dashoffset:var(--circumference)} to{stroke-dashoffset:var(--target)} }
        .fade-in { animation: fadeIn 0.4s ease-out both; }
        .slide-in { animation: slideRight 0.3s ease-out both; }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px',
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'blob1 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '-10%', width: '600px', height: '600px',
          background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'blob2 25s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '20%', width: '550px', height: '550px',
          background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'blob3 22s ease-in-out infinite'
        }} />
      </div>
    </>
  );
}

// ============================================================
// THEME TOGGLE
// ============================================================
function ThemeToggle({ theme, setTheme, T }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 10,
        width: '40px', height: '40px', borderRadius: '50%',
        background: T.card, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.border}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.text, transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ T, isDark, mode, setMode, numQuestions, setNumQuestions, selectedDomains, toggleDomain, timerEnabled, setTimerEnabled, timerDuration, setTimerDuration, startQuiz, questions, questionsCount, showImport }) {
  const availableCount = questions.filter(q => selectedDomains.includes(q.d)).length;
  const countByDomain = useMemo(() => {
    const m = {};
    questions.forEach(q => { m[q.d] = (m[q.d] || 0) + 1; });
    return m;
  }, [questions]);
  const canStart = selectedDomains.length > 0 && numQuestions > 0;
  const effectiveCount = Math.min(numQuestions, availableCount);

  return (
    <div className="fade-in" style={{ paddingTop: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', background: 'rgba(255,153,0,0.1)',
          border: '1px solid rgba(255,153,0,0.3)', borderRadius: '999px',
          marginBottom: '24px', fontSize: '11px', letterSpacing: '0.1em',
          textTransform: 'uppercase', fontFamily: FONT_MONO, color: T.accent
        }}>
          <Sparkles size={11} /> AWS Certified · AIF-C02
        </div>
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 76px)', lineHeight: '1', margin: 0,
          fontFamily: FONT_SERIF, fontWeight: 400, letterSpacing: '-0.02em'
        }}>
          <span style={{ fontStyle: 'italic', color: T.accent }}>Examen blanc</span><br />
          <span>AI Practitioner</span>
        </h1>
        <p style={{ marginTop: '20px', fontSize: '15px', color: T.textDim, maxWidth: '480px', margin: '20px auto 0', lineHeight: '1.6' }}>
          {questionsCount} questions calibrées sur la pondération officielle AWS. Configure ta session puis lance-toi.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <Card T={T} title="Mode" icon={<Target size={14} />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <ModeButton T={T} active={mode === 'training'} onClick={() => setMode('training')} title="Entraînement" desc="Feedback immédiat" icon={<BookOpen size={16} />} />
            <ModeButton T={T} active={mode === 'exam'} onClick={() => setMode('exam')} title="Examen blanc" desc="Feedback final" icon={<Trophy size={16} />} />
          </div>
        </Card>

        <Card T={T} title="Nombre de questions" icon={<BarChart3 size={14} />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <input type="range" min="5" max={Math.max(65, questionsCount)} step="5" value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: T.accent }} />
            <div style={{ fontFamily: FONT_MONO, fontSize: '30px', minWidth: '64px', textAlign: 'right', color: T.accent, fontWeight: 500 }}>
              {numQuestions}
            </div>
          </div>
          {effectiveCount < numQuestions && (
            <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', borderRadius: '8px', fontSize: '12px', color: T.accent }}>
              ⚠️ {availableCount} disponibles, session de {effectiveCount} questions. <button onClick={showImport} style={{ background: 'none', border: 'none', color: T.accent, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Importer plus ↗</button>
            </div>
          )}
        </Card>

        <Card T={T} title="Domaines" icon={<Brain size={14} />}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(DOMAINS).map(([d, info]) => {
              const isActive = selectedDomains.includes(parseInt(d));
              return (
                <button key={d} onClick={() => toggleDomain(parseInt(d))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                    background: isActive ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                    border: `1px solid ${isActive ? info.color + '60' : T.border}`,
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', color: T.text, fontFamily: FONT_SANS
                  }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isActive ? info.color : T.border,
                    boxShadow: isActive ? `0 0 12px ${info.color}80` : 'none',
                    transition: 'all 0.2s'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{info.name}</div>
                    <div style={{ fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO, marginTop: '2px' }}>
                      {info.short} · pondération {info.weight} · {countByDomain[parseInt(d)] || 0} questions
                    </div>
                  </div>
                  {isActive && <CheckCircle2 size={16} color={info.color} />}
                </button>
              );
            })}
          </div>
        </Card>

        <Card T={T} title="Chronomètre" icon={<Clock size={14} />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: timerEnabled ? '16px' : '0' }}>
            <Switch T={T} active={timerEnabled} onClick={() => setTimerEnabled(!timerEnabled)} />
            <span style={{ fontSize: '14px', color: timerEnabled ? T.text : T.textMuted }}>
              {timerEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          {timerEnabled && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input type="range" min="5" max="180" step="5" value={timerDuration}
                  onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: T.accent }} />
                <div style={{ fontFamily: FONT_MONO, fontSize: '20px', minWidth: '70px', textAlign: 'right', color: T.accent }}>
                  {timerDuration} <span style={{ fontSize: '12px', color: T.textMuted }}>min</span>
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO }}>
                Examen réel : 130 min pour 65 questions
              </div>
            </>
          )}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', marginTop: '8px' }}>
          <button onClick={showImport}
            style={{
              padding: '20px', background: 'transparent', border: `1px solid ${T.border}`,
              borderRadius: '12px', color: T.text, cursor: 'pointer',
              fontFamily: FONT_SANS, fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = T.borderH}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = T.border}>
            <Upload size={16} /> Importer CSV
          </button>
          <button onClick={startQuiz} disabled={!canStart}
            style={{
              padding: '20px 28px', background: canStart ? T.accent : T.border,
              color: canStart ? '#0a0a0a' : T.textMuted, border: 'none', borderRadius: '12px',
              fontSize: '17px', fontWeight: 600, cursor: canStart ? 'pointer' : 'not-allowed',
              fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              transition: 'all 0.15s', letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => { if (canStart) e.currentTarget.style.background = T.accentH; }}
            onMouseLeave={(e) => { if (canStart) e.currentTarget.style.background = T.accent; }}>
            <Play size={18} fill="currentColor" />
            Commencer
            <span style={{ fontFamily: FONT_MONO, opacity: 0.7, fontSize: '13px' }}>
              · {effectiveCount}Q · {mode === 'exam' ? 'Examen' : 'Training'}
            </span>
          </button>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO }}>
          <Keyboard size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Raccourcis pendant le quiz : 1-4 ou A-D pour choisir · Entrée pour valider · Espace pour pause
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUIZ SCREEN
// ============================================================
function QuizScreen({ T, isDark, quiz, currentIdx, selectedAnswer, setSelectedAnswer, revealed, mode, answers, timerEnabled, timeLeft, isPaused, setIsPaused, submitAnswer, goNext, finishQuiz, streak }) {
  const q = quiz[currentIdx];
  const total = quiz.length;
  const progress = ((currentIdx + (revealed ? 1 : 0)) / total) * 100;
  const isCorrect = selectedAnswer === q.a;
  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const timerCritical = timerEnabled && timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="fade-in">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: '13px', color: T.textDim }}>
          Q<span style={{ color: T.accent, marginLeft: '2px' }}>{currentIdx + 1}</span>/{total}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {streak >= 3 && (
            <div className="slide-in" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', background: 'rgba(251,146,60,0.15)',
              border: '1px solid rgba(251,146,60,0.4)', borderRadius: '999px',
              fontFamily: FONT_MONO, fontSize: '12px', color: '#fb923c'
            }}>
              <Flame size={12} /> {streak} streak
            </div>
          )}
          {timerEnabled && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: timerCritical ? 'rgba(248,113,113,0.15)' : 'rgba(255,153,0,0.1)',
              border: `1px solid ${timerCritical ? '#f87171' : 'rgba(255,153,0,0.3)'}`,
              borderRadius: '999px', fontFamily: FONT_MONO, fontSize: '13px',
              color: timerCritical ? '#f87171' : T.accent,
              animation: timerCritical ? 'pulse 1s infinite' : 'none'
            }}>
              <Clock size={12} /> {formatTime(timeLeft)}
            </div>
          )}
          {timerEnabled && (
            <button onClick={() => setIsPaused(!isPaused)}
              style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '999px', padding: '5px 10px', color: T.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: FONT_MONO }}>
              {isPaused ? <Play size={11} /> : <Pause size={11} />}
            </button>
          )}
          <button onClick={() => { if (window.confirm('Terminer maintenant ?')) finishQuiz(); }}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '999px', padding: '5px 10px', color: T.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: FONT_MONO }}>
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar with dots */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: `linear-gradient(90deg, ${T.accent} 0%, ${T.accentH} 100%)`,
            boxShadow: `0 0 12px ${T.accent}60`,
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Question card */}
      <div className="fade-in" style={{
        background: T.card, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${T.border}`, borderRadius: '18px', padding: '32px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: FONT_MONO, color: DOMAINS[q.d].color,
            padding: '4px 10px', background: `${DOMAINS[q.d].color}15`,
            border: `1px solid ${DOMAINS[q.d].color}40`, borderRadius: '999px'
          }}>
            {DOMAINS[q.d].short} · {DOMAINS[q.d].name}
          </span>
          <span style={{
            fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: FONT_MONO, color: T.textMuted,
            padding: '4px 10px', background: T.glassBg,
            border: `1px solid ${T.border}`, borderRadius: '999px'
          }}>
            {q.df === 'e' ? '○ Facile' : q.df === 'm' ? '◐ Moyen' : '● Difficile'}
          </span>
        </div>

        <h2 style={{
          fontFamily: FONT_SERIF, fontWeight: 400, fontSize: '24px',
          lineHeight: '1.4', margin: '0 0 28px 0', color: T.text, letterSpacing: '-0.01em'
        }}>{q.q}</h2>

        <div style={{ display: 'grid', gap: '10px' }}>
          {q.o.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isAnswer = i === q.a;
            let bg = 'transparent', border = T.border;
            if (revealed) {
              if (isAnswer) { bg = 'rgba(74,222,128,0.1)'; border = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(248,113,113,0.1)'; border = '#f87171'; }
            } else if (isSelected) {
              bg = isDark ? 'rgba(255,153,0,0.1)' : 'rgba(255,102,0,0.08)'; border = T.accent;
            }
            return (
              <button key={i} onClick={() => !revealed && setSelectedAnswer(i)} disabled={revealed}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '14px 18px', background: bg, border: `1px solid ${border}`,
                  borderRadius: '10px', cursor: revealed ? 'default' : 'pointer',
                  textAlign: 'left', color: T.text, fontFamily: FONT_SANS,
                  fontSize: '14px', lineHeight: '1.5', transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!revealed && !isSelected) {
                    e.currentTarget.style.borderColor = T.borderH;
                    e.currentTarget.style.background = T.glassBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!revealed && !isSelected) {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.background = 'transparent';
                  }
                }}>
                <span style={{
                  fontFamily: FONT_MONO, fontWeight: 500, fontSize: '13px', minWidth: '20px',
                  color: isSelected || (revealed && isAnswer) ? (revealed ? (isAnswer ? '#4ade80' : '#f87171') : T.accent) : T.textMuted
                }}>
                  {LETTERS[i]}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {revealed && isAnswer && <CheckCircle2 size={18} color="#4ade80" />}
                {revealed && isSelected && !isAnswer && <XCircle size={18} color="#f87171" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {revealed && (
        <div className="fade-in" style={{
          background: isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
          border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          borderRadius: '14px', padding: '20px 24px', marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {isCorrect ? (
              <><CheckCircle2 size={20} color="#4ade80" /><span style={{ fontSize: '16px', fontWeight: 600, color: '#4ade80' }}>Bonne réponse</span></>
            ) : (
              <>
                <XCircle size={20} color="#f87171" />
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#f87171' }}>Réponse incorrecte</span>
                <span style={{ fontSize: '13px', color: T.textDim, marginLeft: '6px', fontFamily: FONT_MONO }}>
                  · Bonne réponse : <span style={{ color: '#4ade80' }}>{LETTERS[q.a]}</span>
                </span>
              </>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.65', color: T.text, opacity: 0.9 }}>{q.e}</p>
          <div style={{ marginTop: '14px', fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={11} /> Service AWS : <span style={{ color: T.accent }}>{q.s}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!revealed ? (
          <button onClick={submitAnswer} disabled={selectedAnswer === null}
            style={{
              padding: '14px 28px',
              background: selectedAnswer !== null ? T.accent : T.border,
              color: selectedAnswer !== null ? '#0a0a0a' : T.textMuted,
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
              cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            {mode === 'training' ? 'Valider' : 'Suivante'}
            <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={() => goNext()}
            style={{
              padding: '14px 28px', background: T.accent, color: '#0a0a0a',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT_SANS,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            {currentIdx + 1 === total ? 'Voir résultats' : 'Question suivante'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// RESULTS SCREEN
// ============================================================
function ResultsScreen({ T, isDark, quiz, answers, results, resetAll }) {
  const [reviewMode, setReviewMode] = useState(false);
  const [filterIncorrect, setFilterIncorrect] = useState(false);
  const verdictColor = results.awsScore >= 800 ? '#4ade80' : results.awsScore >= 700 ? T.accent : '#f87171';
  const verdictText = results.awsScore >= 800 ? 'Excellent — réussite confortable'
    : results.awsScore >= 700 ? 'Réussite probable — marge limitée'
    : results.awsScore >= 600 ? 'Échec probable — réviser les points faibles'
    : 'Score insuffisant — révision approfondie nécessaire';

  const chartData = Object.entries(results.byDomain)
    .filter(([_, v]) => v.total > 0)
    .map(([d, v]) => ({
      name: DOMAINS[d].short, fullName: DOMAINS[d].name,
      pct: Math.round((v.correct / v.total) * 100),
      correct: v.correct, total: v.total, color: DOMAINS[d].color
    }));

  if (reviewMode) return <ReviewMode T={T} isDark={isDark} quiz={quiz} answers={answers} setReviewMode={setReviewMode} filterIncorrect={filterIncorrect} setFilterIncorrect={setFilterIncorrect} />;

  return (
    <div className="fade-in" style={{ paddingTop: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '20px' }}>
          · Résultats · AIF-C02 ·
        </div>
        <ScoreRing score={results.awsScore} color={verdictColor} T={T} />
        <div style={{ marginTop: '16px', fontSize: '15px', color: verdictColor, fontWeight: 500 }}>{verdictText}</div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: T.textMuted, fontFamily: FONT_MONO }}>
          Score AWS estimé (réussite ≥ 700) · indicatif
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <StatBox T={T} label="Bonnes réponses" value={`${results.correct}/${results.total}`} accent="#4ade80" />
        <StatBox T={T} label="Précision" value={`${Math.round(results.pct)}%`} accent={T.accent} />
        <StatBox T={T} label="Meilleur streak" value={results.maxStreak} accent="#fb923c" icon={<Flame size={14} />} />
        <StatBox T={T} label="Verdict" value={results.passed ? 'RÉUSSITE' : 'ÉCHEC'} accent={verdictColor} />
      </div>

      <Card T={T} title="Performance par domaine" icon={<TrendingUp size={14} />}>
        <div style={{ width: '100%', height: '260px', marginTop: '8px' }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: T.textMuted, fontSize: 11, fontFamily: FONT_MONO }} stroke={T.border} />
              <YAxis dataKey="name" type="category" tick={{ fill: T.textDim, fontSize: 12, fontFamily: FONT_MONO }} stroke={T.border} />
              <Tooltip
                contentStyle={{ background: T.cardSolid, border: `1px solid ${T.border}`, borderRadius: '8px', fontFamily: FONT_SANS, fontSize: '12px' }}
                labelStyle={{ color: T.text }}
                formatter={(v, n, p) => [`${v}% (${p.payload.correct}/${p.payload.total})`, p.payload.fullName]} />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {chartData.some(d => d.pct < 70) && (
        <div style={{ marginTop: '20px' }}>
          <Card T={T} title="Points à retravailler" icon={<AlertCircle size={14} color="#f87171" />}>
            <ul style={{ margin: 0, paddingLeft: '20px', color: T.text, opacity: 0.85, fontSize: '14px', lineHeight: '1.8' }}>
              {chartData.filter(d => d.pct < 70).sort((a, b) => a.pct - b.pct).map(d => (
                <li key={d.name}><strong style={{ color: d.color }}>{d.fullName}</strong> — {d.pct}% ({d.correct}/{d.total})</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setReviewMode(true)}
          style={{ flex: 1, minWidth: '180px', padding: '14px 20px', background: 'transparent', border: `1px solid ${T.border}`, color: T.text, borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: FONT_SANS, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Eye size={16} /> Revoir les questions
        </button>
        <button onClick={resetAll}
          style={{ flex: 1, minWidth: '180px', padding: '14px 20px', background: T.accent, color: '#0a0a0a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={16} /> Nouvelle session
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ANIMATED SCORE RING
// ============================================================
function ScoreRing({ score, color, T }) {
  const [displayScore, setDisplayScore] = useState(0);
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 1000, 1);
  const offset = circumference * (1 - pct);

  useEffect(() => {
    let raf;
    let start = null;
    const duration = 1400;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: '64px', lineHeight: '1', color, fontWeight: 400 }}>
          {displayScore}
        </div>
        <div style={{ fontSize: '12px', color: T.textMuted, fontFamily: FONT_MONO, marginTop: '4px' }}>
          / 1000
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REVIEW MODE
// ============================================================
function ReviewMode({ T, isDark, quiz, answers, setReviewMode, filterIncorrect, setFilterIncorrect }) {
  const list = filterIncorrect ? quiz.filter(q => answers[q.i] !== q.a) : quiz;
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: '32px', margin: 0, fontWeight: 400 }}>
          <span style={{ fontStyle: 'italic', color: T.accent }}>Revue</span> des questions
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilterIncorrect(!filterIncorrect)}
            style={{ padding: '8px 14px', background: filterIncorrect ? T.accent : 'transparent', color: filterIncorrect ? '#0a0a0a' : T.textDim, border: `1px solid ${filterIncorrect ? T.accent : T.border}`, borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontFamily: FONT_MONO, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {filterIncorrect ? <EyeOff size={12} /> : <Eye size={12} />}
            {filterIncorrect ? 'Erreurs' : 'Toutes'}
          </button>
          <button onClick={() => setReviewMode(false)}
            style={{ padding: '8px 14px', background: 'transparent', color: T.textDim, border: `1px solid ${T.border}`, borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontFamily: FONT_MONO }}>
            ← Retour
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: T.textMuted, background: T.cardSolid, borderRadius: '12px', border: `1px solid ${T.border}` }}>
          <Award size={32} color="#4ade80" style={{ margin: '0 auto 12px', display: 'block' }} />
          Toutes les questions ont été correctement répondues ! 🎉
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {list.map((q, idx) => {
            const userAns = answers[q.i];
            const isCorrect = userAns === q.a;
            return (
              <div key={q.i} style={{
                background: T.cardSolid, border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                borderRadius: '12px', padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: '11px', color: T.textMuted }}>{q.i}</span>
                  <span style={{ padding: '3px 8px', borderRadius: '999px', fontFamily: FONT_MONO, fontSize: '10px', background: `${DOMAINS[q.d].color}15`, color: DOMAINS[q.d].color, border: `1px solid ${DOMAINS[q.d].color}30` }}>
                    {DOMAINS[q.d].short}
                  </span>
                  {isCorrect ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '11px', fontFamily: FONT_MONO }}><CheckCircle2 size={12} /> Correct</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontSize: '11px', fontFamily: FONT_MONO }}><XCircle size={12} /> Incorrect</span>}
                </div>
                <div style={{ fontSize: '15px', lineHeight: '1.5', marginBottom: '14px', color: T.text }}>{q.q}</div>
                <div style={{ display: 'grid', gap: '6px', marginBottom: '14px' }}>
                  {q.o.map((opt, i) => {
                    const isAns = i === q.a;
                    const isUser = i === userAns;
                    return (
                      <div key={i} style={{
                        fontSize: '13px', padding: '8px 12px',
                        background: isAns ? 'rgba(74,222,128,0.06)' : (isUser && !isAns ? 'rgba(248,113,113,0.06)' : 'transparent'),
                        border: `1px solid ${isAns ? 'rgba(74,222,128,0.2)' : isUser ? 'rgba(248,113,113,0.2)' : T.border}`,
                        borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px'
                      }}>
                        <span style={{ fontFamily: FONT_MONO, color: isAns ? '#4ade80' : isUser ? '#f87171' : T.textMuted }}>{LETTERS[i]}</span>
                        <span style={{ flex: 1, color: T.text, opacity: 0.85 }}>{opt}</span>
                        {isAns && <CheckCircle2 size={14} color="#4ade80" />}
                        {isUser && !isAns && <XCircle size={14} color="#f87171" />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '12px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6', color: T.text, opacity: 0.85, borderLeft: `2px solid ${DOMAINS[q.d].color}` }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, fontFamily: FONT_MONO, marginBottom: '6px' }}>
                    {q.s}
                  </div>
                  {q.e}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// IMPORT CSV MODAL
// ============================================================
function ImportModal({ T, isDark, onClose, onImport }) {
  const inputRef = useRef();
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div className="fade-in" style={{
        background: T.cardSolid, border: `1px solid ${T.border}`, borderRadius: '16px',
        padding: '32px', maxWidth: '480px', width: '100%', position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'transparent',
          border: 'none', color: T.textMuted, cursor: 'pointer', padding: '4px'
        }}><X size={20} /></button>
        <FileText size={32} color={T.accent} style={{ marginBottom: '12px' }} />
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: '28px', margin: '0 0 8px 0', fontWeight: 400 }}>Importer des questions</h2>
        <p style={{ color: T.textDim, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          Sélectionne tes 5 fichiers CSV (D1, D2, D3, D4, D5) pour étendre la banque à 250 questions.
          Format requis : <span style={{ fontFamily: FONT_MONO, color: T.text, fontSize: '12px' }}>id, domain, difficulty, question, option_a-d, correct_answer, explanation, service</span>
        </p>
        <input ref={inputRef} type="file" accept=".csv" multiple onChange={(e) => onImport(e.target.files)}
          style={{ display: 'none' }} />
        <button onClick={() => inputRef.current?.click()}
          style={{
            width: '100%', padding: '40px 20px', background: 'transparent',
            border: `2px dashed ${T.border}`, borderRadius: '12px', color: T.text, cursor: 'pointer',
            fontSize: '14px', fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px', transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.glassBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}>
          <Upload size={28} color={T.accent} />
          <div>
            <div style={{ fontWeight: 500 }}>Cliquer pour sélectionner les CSV</div>
            <div style={{ fontSize: '12px', color: T.textMuted, marginTop: '4px' }}>Sélection multiple acceptée</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// UI PRIMITIVES
// ============================================================
function Card({ T, title, icon, children }) {
  return (
    <div style={{
      background: T.card, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px 22px'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
        fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: T.textMuted, fontFamily: FONT_MONO
      }}>{icon} {title}</div>
      {children}
    </div>
  );
}

function ModeButton({ T, active, onClick, title, desc, icon }) {
  return (
    <button onClick={onClick}
      style={{
        padding: '16px', textAlign: 'left',
        background: active ? (T.accent === '#FF9900' ? 'rgba(255,153,0,0.08)' : 'rgba(255,102,0,0.06)') : 'transparent',
        border: `1px solid ${active ? T.accent : T.border}`,
        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s', color: T.text, fontFamily: FONT_SANS
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: active ? T.accent : T.textDim }}>
        {icon}<span style={{ fontSize: '15px', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: '12px', color: T.textMuted, lineHeight: '1.5' }}>{desc}</div>
    </button>
  );
}

function StatBox({ T, label, value, accent, icon }) {
  return (
    <div style={{
      background: T.card, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, fontFamily: FONT_MONO, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        {icon}{label}
      </div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: '24px', color: accent, fontWeight: 400 }}>{value}</div>
    </div>
  );
}

function Switch({ T, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', width: '46px', height: '26px',
      background: active ? T.accent : T.border, borderRadius: '999px',
      border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: active ? '23px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
}
