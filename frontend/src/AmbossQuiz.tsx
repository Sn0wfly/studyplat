import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Lightbulb, FlaskConical, Target, RefreshCcw, LayoutDashboard, RotateCcw, X, Search } from 'lucide-react';
import clsx from 'clsx';
import type { AmbossQuestion, Subject } from './types';
import { ImageThumbnail } from './ImageModal';
import SubjectNavbar from './SubjectNavbar';

interface AmbossQuizProps {
  subject: Subject;
  username: string;
  onBack: () => void;
}

function DifficultyHammers({ level }: { level: number }) {
  // difficulty 0-4 maps to 1-5 display
  const display = level + 1;
  return (
    <div className="flex gap-0.5" title={`Difficulty ${display}/5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={clsx("text-xs", i <= display ? "text-amber-400" : "text-primary/15")}>
          ⚒
        </span>
      ))}
    </div>
  );
}

function SelectionRateBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-primary/30" style={{ width: `${rate}%` }} />
      </div>
      <span className="text-[10px] text-primary/30 font-mono w-8 text-right">{rate}%</span>
    </div>
  );
}

interface LabRow { name: string; ref: string; si: string; isCategory?: boolean; isContinuation?: boolean }
interface LabSection { name: string; rows: LabRow[] }

const labTranslations: Record<string, string> = {
  // Categories
  'Cholesterol': 'Colesterol', 'Electrolytes, serum': 'Electrolitos séricos',
  'Proteins': 'Proteínas', 'Immunoglobulin': 'Inmunoglobulina',
  'Proteins, total': 'Proteínas totales',
  // Serum
  'Alanine aminotransferase (ALT)': 'Alanina aminotransferasa (ALT)',
  'Aspartate aminotransferase (AST)': 'Aspartato aminotransferasa (AST)',
  'Alkaline phosphatase': 'Fosfatasa alcalina',
  'Amylase': 'Amilasa', 'Calcium': 'Calcio',
  'Bilirubin, Total // Direct': 'Bilirrubina, Total // Directa',
  'Triglycerides': 'Triglicéridos', 'Cortisol': 'Cortisol',
  'Creatine kinase': 'Creatina quinasa', 'Creatinine': 'Creatinina',
  'Urea nitrogen': 'Nitrógeno ureico (BUN)', 'Creatinine clearance': 'Depuración de creatinina',
  'Ferritin': 'Ferritina', 'Iron': 'Hierro',
  'Total iron-binding capacity': 'Capacidad total de fijación de hierro',
  'Transferrin saturation': 'Saturación de transferrina',
  'Folate (folic acid)': 'Folato (ácido fólico)',
  'Glucose, fasting': 'Glucosa en ayunas', 'Glucose': 'Glucosa',
  'Growth hormone (fasting)': 'Hormona de crecimiento (ayunas)',
  'Lactate dehydrogenase (LDH)': 'Lactato deshidrogenasa (LDH)',
  'Lactic acid (venous)': 'Ácido láctico (venoso)',
  'Lipase': 'Lipasa', 'Magnesium': 'Magnesio',
  'Osmolality': 'Osmolalidad', 'Phosphorus (inorganic)': 'Fósforo (inorgánico)',
  'Potassium': 'Potasio', 'Uric acid': 'Ácido úrico',
  'Copper': 'Cobre', 'Zinc': 'Zinc',
  'Total': 'Total', 'HDL': 'HDL', 'LDL': 'LDL',
  'Albumin': 'Albúmina', 'Globulin': 'Globulina',
  'Fibrinogen': 'Fibrinógeno',
  'Thyroid-stimulating hormone (TSH)': 'Hormona estimulante de tiroides (TSH)',
  'Thyroxine (T4), free': 'Tiroxina (T4) libre',
  'Triiodothyronine (T3)': 'Triyodotironina (T3)',
  'Parathyroid hormone (PTH)': 'Hormona paratiroidea (PTH)',
  'Vitamin A (retinol)': 'Vitamina A (retinol)',
  'Vitamin B12 (cyanocobalamin)': 'Vitamina B12 (cianocobalamina)',
  'Vitamin D': 'Vitamina D',
  // Sodium, Chloride, Bicarbonate
  'Sodium (Na^+)': 'Sodio (Na⁺)', 'Chloride (Cl^-)': 'Cloruro (Cl⁻)',
  'Bicarbonate (HCO_3^-)': 'Bicarbonato (HCO₃⁻)',
  // Blood / Hematologic
  'Erythrocyte count': 'Recuento de eritrocitos',
  'Erythrocyte sedimentation rate (Westergren)': 'Velocidad de sedimentación globular (VSG)',
  'Hematocrit': 'Hematocrito', 'Hemoglobin': 'Hemoglobina',
  'Hemoglobin A1c': 'Hemoglobina A1c',
  'Leukocyte count': 'Recuento de leucocitos',
  'Mean corpuscular hemoglobin (MCH)': 'Hemoglobina corpuscular media (HCM)',
  'Mean corpuscular hemoglobin concentration (MCHC)': 'Concentración de HCM (CHCM)',
  'Mean corpuscular volume (MCV)': 'Volumen corpuscular medio (VCM)',
  'Platelet count': 'Recuento de plaquetas',
  'Reticulocyte count': 'Recuento de reticulocitos',
  'Neutrophils': 'Neutrófilos', 'Bands': 'Bandas/Cayados',
  'Eosinophils': 'Eosinófilos', 'Basophils': 'Basófilos',
  'Lymphocytes': 'Linfocitos', 'Monocytes': 'Monocitos',
  'CD4 cell count': 'Recuento de CD4',
  'Partial thromboplastin time (PTT), activated': 'Tiempo de tromboplastina parcial activado (TTPa)',
  'Prothrombin time (PT)': 'Tiempo de protrombina (TP)',
  'International normalized ratio (INR)': 'Razón normalizada internacional (INR)',
  'Bleeding time': 'Tiempo de sangría',
  'Thrombin time': 'Tiempo de trombina',
  'D-dimer': 'Dímero D',
  // CSF
  'Pressure': 'Presión',
  'Cell count': 'Recuento celular',
  // Urine
  'Oxalate': 'Oxalato',
  '17-Hydroxycorticosteroids': '17-Hidroxicorticosteroides',
  '17-Ketosteroids, total': '17-Cetosteroides totales',
  'Body Mass Index (BMI)': 'Índice de Masa Corporal (IMC)',
  // Gases
  'pH, arterial': 'pH arterial', 'P_CO2, arterial': 'PaCO₂ arterial',
  'P_O2, arterial': 'PaO₂ arterial',
  'Oxygen saturation, arterial': 'Saturación de O₂ arterial',
  'Base excess': 'Exceso de base',
  'Anion gap': 'Brecha aniónica',
  // Continuation prefixes translated
};

function translateLabText(text: string): string {
  if (labTranslations[text]) return labTranslations[text];
  return text
    .replace(/^Male:/, 'Masc:')
    .replace(/^Female:/, 'Fem:')
    .replace(/^Child:/, 'Niño:')
    .replace(/^Infant:/, 'Lactante:')
    .replace(/^Newborn:/, 'Neonato:')
    .replace(/^Adult:/, 'Adulto:')
    .replace(/\bNormal:/, 'Normal:')
    .replace(/\bHigh:/, 'Alto:')
    .replace(/\bBorderline:/, 'Límite:');
}

// Detect lines that are continuation values (not new analyte names)
function isContinuationLine(line: string): boolean {
  return /^(Male:|Female:|Child:|Infant:|Newborn:|Adult:|\d{4}\s*h:|\d+nd |Fraction )/.test(line);
}

function parseLabValues(raw: string): LabSection[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const sections: LabSection[] = [];
  const sectionHeaders = ['Serum', 'Cerebrospinal Fluid', 'Hematologic', 'Urine', 'Body Mass Index (BMI)'];
  const tabNames: Record<string, string> = {
    'Serum': 'Suero',
    'Cerebrospinal Fluid': 'LCR',
    'Hematologic': 'Sangre',
    'Urine': 'Orina e IMC',
    'Body Mass Index (BMI)': 'Orina e IMC',
  };

  let current: LabSection | null = null;
  let i = 0;
  if (lines[0] === 'Lab Values') i = 1;

  while (i < lines.length) {
    const line = lines[i];

    const matchedHeader = sectionHeaders.find(h => line === h);
    if (matchedHeader) {
      const name = tabNames[matchedHeader] || matchedHeader;
      if (name === 'Orina e IMC' && current?.name === 'Orina e IMC') {
        current.rows.push({ name: translateLabText('Body Mass Index (BMI)'), ref: '', si: '', isCategory: true });
        i++;
        if (lines[i] === 'Reference Range') i++;
        if (lines[i]?.startsWith('SI Reference')) i++;
        continue;
      }
      if (name === 'Orina e IMC' && current?.name !== 'Orina e IMC') {
        current = { name, rows: [] };
        sections.push(current);
      } else if (name !== 'Orina e IMC') {
        current = { name, rows: [] };
        sections.push(current);
      }
      i++;
      if (lines[i] === 'Reference Range') i++;
      if (lines[i]?.startsWith('SI Reference')) i++;
      continue;
    }

    if (!current) { i++; continue; }

    const cur = lines[i];
    const next1 = lines[i + 1];
    const next2 = lines[i + 2];

    // If current line is a continuation (Male:/Female:/2000 h: etc), treat as sub-row
    if (isContinuationLine(cur)) {
      const hasRef = next1 && /[\d–\-<>]/.test(next1) && !sectionHeaders.includes(next1);
      if (hasRef) {
        current.rows.push({ name: '', ref: translateLabText(cur), si: next1, isContinuation: true });
        i += 2;
      } else {
        current.rows.push({ name: '', ref: translateLabText(cur), si: '', isContinuation: true });
        i++;
      }
      continue;
    }

    const isNextAHeader = next1 && sectionHeaders.includes(next1);
    const isNextAValue = next1 && (
      /[\d–\-<>]/.test(next1) || next1.startsWith('Male:') || next1.startsWith('Female:') ||
      next1.startsWith('Normal:') || next1.startsWith('Adult:') || next1.startsWith('Fraction')
    );

    if (!isNextAValue || isNextAHeader) {
      current.rows.push({ name: translateLabText(cur), ref: '', si: '', isCategory: true });
      i++;
    } else if (next1 && next2 && !sectionHeaders.includes(next2) && !isContinuationLine(next2) && /[\d–\-<>]/.test(next2)) {
      current.rows.push({ name: translateLabText(cur), ref: translateLabText(next1), si: next2 });
      i += 3;
    } else if (next1 && next2 && !sectionHeaders.includes(next2) && isContinuationLine(next2)) {
      current.rows.push({ name: translateLabText(cur), ref: translateLabText(next1), si: '' });
      i += 2;
    } else if (next1) {
      current.rows.push({ name: translateLabText(cur), ref: translateLabText(next1), si: '' });
      i += 2;
    } else {
      i++;
    }
  }

  return sections;
}

function LabValuesModal({ labValues, onClose }: { labValues: string; onClose: () => void }) {
  const sections = parseLabValues(labValues);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  const currentSection = sections[activeTab];
  const filteredRows = currentSection?.rows.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q) || r.si.toLowerCase().includes(q);
  }) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full sm:max-w-3xl sm:mx-4 max-h-[85vh] flex flex-col ring-1 ring-blue-500/20 rounded-t-2xl sm:rounded-2xl overflow-hidden bg-[#0d1117] border border-border/40"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with tabs */}
        <div className="border-b border-border/30 px-4 pt-4 pb-0 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={16} className="text-blue-400" />
              <span className="text-sm font-mono tracking-wider text-blue-400 uppercase">Valores de Laboratorio</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary/30" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-7 pr-3 py-1 w-36 sm:w-48 rounded-lg bg-surface/60 border border-border/30 text-xs text-primary/80 placeholder:text-primary/25 font-mono outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-primary/50 hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-0">
            {sections.map((sec, idx) => (
              <button
                key={sec.name}
                onClick={() => { setActiveTab(idx); setSearch(''); }}
                className={clsx(
                  "px-3 py-2 text-xs font-mono tracking-wider transition-colors border-b-2 -mb-px",
                  idx === activeTab
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-primary/40 hover:text-primary/70"
                )}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <table className="w-full text-xs sm:text-sm">
            <thead className="sticky top-0 bg-[#0d1117] z-10">
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-4 text-primary/50 font-mono font-normal tracking-wider">{currentSection?.name || ''}</th>
                <th className="text-left py-2 px-4 text-primary/50 font-mono font-normal tracking-wider">Rango de Referencia</th>
                <th className="text-left py-2 px-4 text-primary/50 font-mono font-normal tracking-wider">Referencia SI</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                row.isCategory ? (
                  <tr key={i} className="border-b border-border/20">
                    <td colSpan={3} className="py-2 px-4 text-primary/80 font-semibold bg-surface/30">{row.name}</td>
                  </tr>
                ) : row.isContinuation ? (
                  <tr key={i} className="border-b border-border/10 hover:bg-surface/30 transition-colors">
                    <td className="py-1.5 px-4 text-primary/70"></td>
                    <td className="py-1.5 px-4 text-primary/50 font-mono">{row.ref}</td>
                    <td className="py-1.5 px-4 text-primary/50 font-mono">{row.si}</td>
                  </tr>
                ) : (
                  <tr key={i} className="border-b border-border/10 hover:bg-surface/30 transition-colors">
                    <td className="py-1.5 px-4 text-primary/70">{row.name}</td>
                    <td className="py-1.5 px-4 text-primary/50 font-mono">{row.ref}</td>
                    <td className="py-1.5 px-4 text-primary/50 font-mono">{row.si}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {/* Close footer */}
        <div className="border-t border-border/30 px-4 py-2 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-primary/50 hover:text-primary hover:bg-white/5 transition-colors"
          >
            <X size={13} /> Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AmbossQuiz({ subject, username, onBack }: AmbossQuizProps) {
  const [questions, setQuestions] = useState<AmbossQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [correctEids, setCorrectEids] = useState<string[]>([]);
  const [incorrectEids, setIncorrectEids] = useState<string[]>([]);
  const [sessionCorrectEids, setSessionCorrectEids] = useState<string[]>([]);
  const [sessionIncorrectEids, setSessionIncorrectEids] = useState<string[]>([]);

  const [mode, setMode] = useState<'all' | 'incorrect'>('all');
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const [direction, setDirection] = useState(1);

  const storageKey = `studyplat_amboss_${subject.id}_${username}`;

  // Load questions
  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/data/${subject.file}`)
      .then(r => r.json())
      .then((data: AmbossQuestion[]) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [subject.file]);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCorrectEids(parsed.correct || []);
        setIncorrectEids(parsed.incorrect || []);
        setSessionCorrectEids(parsed.correct || []);
        setSessionIncorrectEids(parsed.incorrect || []);
      } catch (_) { /* ignore */ }
    }
  }, [storageKey]);

  const activeQuestions = mode === 'all'
    ? questions.filter(q => !sessionCorrectEids.includes(q.eid))
    : questions.filter(q => sessionIncorrectEids.includes(q.eid));

  useEffect(() => {
    if (activeQuestions.length > 0 && currentIndex >= activeQuestions.length) {
      setCurrentIndex(0);
    }
  }, [activeQuestions.length, currentIndex]);

  const saveProgress = (correct: string[], incorrect: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify({ correct, incorrect }));
  };

  const currentQ = activeQuestions[currentIndex];

  const handleOptionClick = (letter: string) => {
    if (selectedLetter !== null) return;
    setSelectedLetter(letter);
    setTimeout(() => setShowExplanation(true), 400);

    const isCorrect = currentQ.correct_answer === letter;

    // Auto-expand selected answer's explanation + show hint if wrong
    setTimeout(() => {
      if (!isCorrect) {
        setShowHint(true);
        // Auto-expand both the selected (wrong) and correct answers
        setExpandedAnswers(new Set([letter, currentQ.correct_answer]));
      } else {
        // If correct, auto-expand just the correct answer
        setExpandedAnswers(new Set([letter]));
      }
    }, 500);

    let newC = [...correctEids];
    let newI = [...incorrectEids];

    if (isCorrect && !newC.includes(currentQ.eid)) {
      newC.push(currentQ.eid);
      newI = newI.filter(id => id !== currentQ.eid);
    } else if (!isCorrect && !newI.includes(currentQ.eid)) {
      newI.push(currentQ.eid);
      newC = newC.filter(id => id !== currentQ.eid);
    }

    setCorrectEids(newC);
    setIncorrectEids(newI);
    saveProgress(newC, newI);
  };

  const goNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setDirection(1);
      setCurrentIndex(c => c + 1);
      resetQuestionState();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(c => c - 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedLetter(null);
    setShowExplanation(false);
    setExpandedAnswers(new Set());
    setShowHint(false);
    setShowLabs(false);
  };

  const resetQuiz = () => {
    setDirection(-1);
    setCurrentIndex(0);
    resetQuestionState();
  };

  // Resolve local image path: "images\xxx.jpg" or "images/xxx.jpg" -> "/images/xxx.jpg"
  const resolveImagePath = (localPath: string) => {
    const normalized = localPath.replace(/\\/g, '/');
    if (normalized.startsWith('/')) return normalized;
    if (normalized.startsWith('images/')) return '/' + normalized;
    return '/images/' + normalized;
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-mesh flex items-center justify-center flex-col gap-4">
        <SubjectNavbar subjectName={subject.name} onBack={onBack} />
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary/60 rounded-full animate-spin" />
        <p className="text-primary/40 font-mono text-sm">Loading {subject.name}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-mesh flex items-center justify-center flex-col gap-4">
        <SubjectNavbar subjectName={subject.name} onBack={onBack} />
        <p className="text-accent-red font-mono text-sm">Failed to load questions</p>
        <button onClick={onBack} className="text-primary/60 text-sm underline">Go back</button>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-[100dvh] bg-mesh flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <SubjectNavbar subjectName={subject.name} onBack={onBack} />
        <div className="glass-card max-w-lg w-full p-8 flex flex-col gap-6 text-center relative z-10">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
            {subject.name}
          </h2>
          <div className="flex justify-around py-4 border-y border-border/20">
            <div className="flex flex-col">
              <span className="text-3xl text-accent-green">{correctEids.length}</span>
              <span className="text-xs tracking-widest uppercase text-primary/40 mt-1">Mastered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl text-accent-red">{incorrectEids.length}</span>
              <span className="text-xs tracking-widest uppercase text-primary/40 mt-1">Review</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl text-white">{questions.length - correctEids.length - incorrectEids.length}</span>
              <span className="text-xs tracking-widest uppercase text-primary/40 mt-1">Unseen</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => {
              setSessionCorrectEids(correctEids);
              setSessionIncorrectEids(incorrectEids);
              setMode('all'); setShowDashboard(false); setCurrentIndex(0); resetQuestionState();
            }} className="px-6 py-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/40 text-primary transition-all">
              Continue Unseen Questions
            </button>
            {incorrectEids.length > 0 && (
              <button onClick={() => {
                setSessionCorrectEids(correctEids);
                setSessionIncorrectEids(incorrectEids);
                setMode('incorrect'); setShowDashboard(false); setCurrentIndex(0); resetQuestionState();
              }} className="px-6 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red/20 transition-all">
                Review Incorrect ({incorrectEids.length})
              </button>
            )}
            <button onClick={() => {
              setCorrectEids([]); setIncorrectEids([]);
              setSessionCorrectEids([]); setSessionIncorrectEids([]);
              localStorage.removeItem(storageKey);
              setMode('all'); setCurrentIndex(0); resetQuestionState(); setShowDashboard(false);
            }} className="px-6 py-3 rounded-xl border border-border/20 hover:border-accent-red/50 text-primary/60 hover:text-accent-red transition-all flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Reset Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="min-h-[100dvh] bg-mesh flex items-center justify-center flex-col gap-4">
        <SubjectNavbar subjectName={subject.name} onBack={onBack} />
        {mode === 'incorrect' && activeQuestions.length === 0 && (
          <p className="text-primary/60 font-mono text-sm">No incorrect questions to review!</p>
        )}
        {mode === 'all' && activeQuestions.length === 0 && (
          <p className="text-primary/60 font-mono text-sm">All questions mastered!</p>
        )}
        <button onClick={() => setShowDashboard(true)} className="text-primary/40 text-sm underline">Dashboard</button>
      </div>
    );
  }

  const progress = activeQuestions.length > 0 ? ((currentIndex + 1) / activeQuestions.length) * 100 : 0;
  const globalIndex = questions.findIndex(q => q.eid === currentQ.eid) + 1;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0, filter: 'blur(8px)' }),
    center: { zIndex: 1, x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (d: number) => ({ zIndex: 0, x: d < 0 ? 40 : -40, opacity: 0, filter: 'blur(8px)' }),
  };

  const questionImages = currentQ.images?.filter(img => img.local_path) || [];

  return (
    <div className="min-h-[100dvh] bg-mesh flex flex-col items-center px-4 py-6 sm:p-4 relative overflow-x-hidden">
      <SubjectNavbar subjectName={subject.name} onBack={onBack} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-border/20 z-50">
        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "circOut" }} />
      </div>

      {/* Decorative orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-green/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      <main className="w-full max-w-3xl relative z-10 flex flex-col gap-4 py-2 mt-6 pb-8">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-border/50 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
                {String(globalIndex).padStart(3, '0')}
              </span>
              <span className="text-sm text-primary/40 font-mono tracking-widest">/ {questions.length}</span>
            </div>
            <DifficultyHammers level={currentQ.difficulty} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDashboard(true)} className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40 transition-all duration-500 bg-surface/20 hover:bg-surface text-primary/60 hover:text-primary backdrop-blur-md">
              <LayoutDashboard size={14} />
              <span className="text-xs tracking-widest uppercase font-mono hidden sm:inline-block">Dashboard</span>
            </button>
            <button onClick={resetQuiz} className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40 transition-all duration-500 bg-surface/20 hover:bg-surface text-primary/60 hover:text-primary backdrop-blur-md">
              <RefreshCcw size={14} className="group-hover:-rotate-180 transition-transform duration-700" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="relative flex-1 flex flex-col justify-start">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentQ.eid}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform, opacity, filter", transform: "translateZ(0)" }}
              className="w-full flex flex-col gap-5"
            >
              {/* Toolbar: Hint, Labs */}
              <div className="flex gap-2 flex-wrap">
                {currentQ.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all border",
                      showHint ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-surface/30 border-border/30 text-primary/50 hover:text-primary/80"
                    )}
                  >
                    <Lightbulb size={13} /> Hint
                  </button>
                )}
                {currentQ.lab_values && (
                  <button
                    onClick={() => setShowLabs(!showLabs)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all border",
                      showLabs ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-surface/30 border-border/30 text-primary/50 hover:text-primary/80"
                    )}
                  >
                    <FlaskConical size={13} /> Labs
                  </button>
                )}
              </div>

              {/* Hint panel */}
              <AnimatePresence>
                {showHint && currentQ.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-card p-3 flex items-start gap-2 ring-1 ring-amber-500/10">
                      <Lightbulb size={15} className="text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-primary/70 leading-relaxed">{currentQ.hint}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Labs modal */}
              <AnimatePresence>
                {showLabs && currentQ.lab_values && (
                  <LabValuesModal labValues={currentQ.lab_values} onClose={() => setShowLabs(false)} />
                )}
              </AnimatePresence>

              {/* Question text + images */}
              <div className="flex flex-col sm:flex-row gap-4">
                <h1 className="text-lg sm:text-xl leading-[1.4] tracking-tight font-medium text-white/90 flex-1">
                  {currentQ.question_text}
                </h1>
                {questionImages.length > 0 && (
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {questionImages.map((img, i) => (
                      <ImageThumbnail
                        key={i}
                        src={resolveImagePath(img.local_path)}
                        alt={img.title || 'Question image'}
                        overlaySrc={img.overlay_local_path ? resolveImagePath(img.overlay_local_path) : undefined}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {currentQ.answers.map((ans, idx) => {
                  const isSelected = selectedLetter === ans.letter;
                  const isCorrect = ans.is_correct;
                  const answered = selectedLetter !== null;
                  const isExpanded = expandedAnswers.has(ans.letter);

                  let stateClasses = "border-border/60 hover:border-primary/30 bg-surface/40 hover:bg-surface hover:-translate-y-0.5 hover:shadow-lg";
                  let letterClasses = "text-primary/30";
                  let textClasses = "text-primary/80";

                  if (answered) {
                    if (isSelected && isCorrect) {
                      stateClasses = "border-accent-green bg-accent-green/5 correct-glow";
                      letterClasses = "text-accent-green font-bold";
                      textClasses = "text-accent-green";
                    } else if (isSelected && !isCorrect) {
                      stateClasses = "border-accent-red bg-accent-red/5 incorrect-glow";
                      letterClasses = "text-accent-red font-bold";
                      textClasses = "text-primary/70";
                    } else if (isCorrect) {
                      stateClasses = "border-accent-green/40 bg-accent-green/5";
                      letterClasses = "text-accent-green/60";
                      textClasses = "text-primary/90";
                    } else {
                      // Not grayed out — still visible and clickable for explanation
                      stateClasses = "border-border/30 bg-surface/20 hover:bg-surface/40";
                      letterClasses = "text-primary/30";
                      textClasses = "text-primary/60";
                    }
                  }

                  const toggleExpand = () => {
                    if (!answered) return;
                    setExpandedAnswers(prev => {
                      const next = new Set(prev);
                      next.has(ans.letter) ? next.delete(ans.letter) : next.add(ans.letter);
                      return next;
                    });
                  };

                  return (
                    <motion.div
                      key={ans.letter}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                    >
                      <div
                        onClick={() => {
                          if (!answered) {
                            handleOptionClick(ans.letter);
                          } else {
                            // Post-answer: clicking the row toggles explanation
                            toggleExpand();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={clsx(
                          "w-full text-left px-4 py-3 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-xl flex items-start gap-3 cursor-pointer",
                          stateClasses
                        )}
                      >
                        <div className={clsx(
                          "flex items-center justify-center w-7 h-7 rounded-lg border border-white/5 bg-white/5 shrink-0 font-mono text-sm transition-colors duration-500",
                          letterClasses
                        )}>
                          {ans.letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={clsx("text-sm leading-relaxed tracking-wide transition-colors duration-500", textClasses)}>
                            {ans.content}
                          </span>
                          {answered && (
                            <SelectionRateBar rate={ans.selection_rate} />
                          )}
                        </div>
                        {answered && ans.explanation_why && (
                          <div className="shrink-0 p-1 text-primary/40">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        )}
                      </div>

                      {/* Expanded explanation */}
                      <AnimatePresence>
                        {answered && isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className={clsx(
                              "ml-10 mr-2 mt-1 mb-2 p-3 rounded-lg border",
                              isCorrect
                                ? "bg-accent-green/10 border-accent-green/20"
                                : isSelected
                                  ? "bg-accent-red/10 border-accent-red/20"
                                  : "bg-surface/30 border-border/10"
                            )}>
                              <p className={clsx("text-sm leading-relaxed", isCorrect ? "text-primary/80" : "text-primary/70")}>{ans.explanation_why}</p>
                              {ans.explanation_but && (
                                <p className="text-sm text-primary/50 leading-relaxed mt-2 italic">
                                  However: {ans.explanation_but}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-col gap-3 z-20 pt-3">
          {/* Learning objective */}
          <AnimatePresence>
            {showExplanation && currentQ.learning_objective && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, height: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="glass-card p-3 flex items-start gap-2 ring-1 ring-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-green/40 to-transparent" />
                  <Target className="text-accent-green/60 mt-0.5 shrink-0" size={16} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-mono">Learning Objective</span>
                    <p className="text-primary/70 leading-relaxed text-sm">{currentQ.learning_objective}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="flex items-center gap-4">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border/40 text-primary/60 hover:text-primary hover:border-primary/40 hover:bg-surface/50 backdrop-blur-md transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest hidden sm:inline-block">Prev</span>
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === activeQuestions.length - 1 || selectedLetter === null}
              className={clsx(
                "flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-mono uppercase tracking-widest transition-all duration-500 overflow-hidden relative group",
                selectedLetter === null
                  ? "bg-surface/20 border border-border/20 text-primary/30 pointer-events-none"
                  : "bg-primary text-background hover:scale-[1.02] shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
              )}
            >
              {selectedLetter !== null && (
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              )}
              <span className="relative z-10 w-full text-center">Next</span>
              <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
