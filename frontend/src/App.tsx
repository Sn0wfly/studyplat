import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Info, Activity, RefreshCcw, LayoutDashboard, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import questionsData from './questions.json';
import LoginPage from './LoginPage';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userPassword, setUserPassword] = useState<string | null>(null);

  // Progress tracking
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [mode, setMode] = useState<'all' | 'incorrect'>('all');
  const [showDashboard, setShowDashboard] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [direction, setDirection] = useState(1);

  // 'all' Mode skips correctly answered questions so we don't repeat them
  const activeQuestions = mode === 'all'
    ? questionsData.filter(q => !correctIds.includes(q.id))
    : questionsData.filter(q => incorrectIds.includes(q.id));

  if (!authenticated || !username) {
    return <LoginPage onAuthenticated={(user, pass, initialData) => {
      setUsername(user);
      setUserPassword(pass);
      setAuthenticated(true);

      // Use remote data if populated, else fallback to local storage
      if ((initialData.correct && initialData.correct.length > 0) || (initialData.incorrect && initialData.incorrect.length > 0)) {
        setCorrectIds(initialData.correct || []);
        setIncorrectIds(initialData.incorrect || []);
        // sync to local just in case
        localStorage.setItem(`studyplat_${user}`, JSON.stringify(initialData));
      } else {
        const saved = localStorage.getItem(`studyplat_${user}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCorrectIds(parsed.correct || []);
            setIncorrectIds(parsed.incorrect || []);
          } catch (e) { }
        }
      }
    }} />;
  }

  const currentQ = activeQuestions[currentIndex];

  // Helper method to save securely
  const saveProgressRemote = async (correct: number[], incorrect: number[]) => {
    fetch('/api/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: userPassword, correct, incorrect })
    }).catch(() => console.error("Failed to sync remotely"));
  };

  // Reset current index if we run out of active questions or if the activeQuestions list changes
  useEffect(() => {
    if (activeQuestions.length > 0 && currentIndex >= activeQuestions.length) {
      setCurrentIndex(0);
    } else if (activeQuestions.length === 0 && currentIndex !== 0) {
      // If there are no active questions, reset index to 0
      setCurrentIndex(0);
    }
  }, [activeQuestions.length, currentIndex, mode, correctIds, incorrectIds]);

  const handleOptionClick = (index: number) => {
    if (selectedLetter !== null) return;
    const letter = String.fromCharCode(65 + index);
    setSelectedLetter(letter);
    setTimeout(() => setShowExplanation(true), 400); // Stagger explanation

    // Track Progress
    const isCorrect = currentQ.answer === letter;
    let newC = [...correctIds];
    let newI = [...incorrectIds];

    if (isCorrect && !newC.includes(currentQ.id)) {
      newC.push(currentQ.id);
      newI = newI.filter(id => id !== currentQ.id);
    } else if (!isCorrect && !newI.includes(currentQ.id)) {
      newI.push(currentQ.id);
      newC = newC.filter(id => id !== currentQ.id);
    }

    setCorrectIds(newC);
    setIncorrectIds(newI);
    localStorage.setItem(`studyplat_${username}`, JSON.stringify({ correct: newC, incorrect: newI }));
    saveProgressRemote(newC, newI);
  };

  const nextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setDirection(1);
      setCurrentIndex(c => c + 1);
      setSelectedLetter(null);
      setShowExplanation(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(c => c - 1);
      setSelectedLetter(null);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setDirection(-1);
    setCurrentIndex(0);
    setSelectedLetter(null);
    setShowExplanation(false);
  };

  if (!currentQ) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center flex-col gap-4">
      <Activity className="animate-spin text-primary/40" size={32} />
      {mode === 'incorrect' && activeQuestions.length === 0 && (
        <p className="text-primary/60 font-mono text-sm tracking-wider">No incorrect questions to review! Great job!</p>
      )}
      {mode === 'all' && activeQuestions.length === 0 && (
        <p className="text-primary/60 font-mono text-sm tracking-wider">All questions mastered! Reset progress to review.</p>
      )}
    </div>
  );

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="glass-card max-w-lg w-full p-8 flex flex-col gap-6 text-center relative z-10">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
            {username}'s Progress
          </h2>
          <div className="flex justify-around py-4 border-y border-border/20">
            <div className="flex flex-col">
              <span className="text-3xl text-accent-green">{correctIds.length}</span>
              <span className="text-xs tracking-widest uppercase text-primary/40 mt-1">Mastered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl text-accent-red">{incorrectIds.length}</span>
              <span className="text-xs tracking-widest uppercase text-primary/40 mt-1">Review</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl text-white">{questionsData.length - correctIds.length - incorrectIds.length}</span>
              <span className="text-xs tracking-widest uppercase text-primary/40 mt-1">Unseen</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => {
              setMode('all'); setShowDashboard(false); setCurrentIndex(0); setSelectedLetter(null); setShowExplanation(false);
            }} className="px-6 py-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/40 text-primary transition-all">
              Continue Unseen Questions
            </button>
            {incorrectIds.length > 0 && (
              <button onClick={() => { setMode('incorrect'); setShowDashboard(false); setCurrentIndex(0); setSelectedLetter(null); setShowExplanation(false); }} className="px-6 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red/20 transition-all">
                Review Incorrect ({incorrectIds.length})
              </button>
            )}
            <button onClick={() => {
              setCorrectIds([]); setIncorrectIds([]);
              localStorage.removeItem(`studyplat_${username}`);
              saveProgressRemote([], []);
              setMode('all'); setCurrentIndex(0); setSelectedLetter(null); setShowExplanation(false); setShowDashboard(false);
            }} className="px-6 py-3 rounded-xl border border-border/20 hover:border-accent-red/50 text-primary/60 hover:text-accent-red transition-all flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Reset All Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = activeQuestions.length > 0 ? ((currentIndex + 1) / activeQuestions.length) * 100 : 0;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(8px)',
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(8px)',
    })
  };

  return (
    <div className="min-h-screen max-h-screen bg-mesh flex flex-col items-center justify-between p-2 sm:p-4 relative overflow-hidden">

      {/* Avant-Garde Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-border/20 z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-green/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      <main className="w-full max-w-3xl relative z-10 flex flex-col h-full justify-between gap-4 py-2">

        {/* Header Suite */}
        <header className="flex justify-between items-end border-b border-border/50 pb-4 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-4 font-mono"
          >
            <span className="text-4xl lg:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
              {String(currentIndex + 1).padStart(3, '0')}
            </span>
            <span className="text-lg tracking-[0.2em] text-primary/40 uppercase">
              / {String(activeQuestions.length).padStart(3, '0')}
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDashboard(true)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40 transition-all duration-500 bg-surface/20 hover:bg-surface text-primary/60 hover:text-primary backdrop-blur-md"
            >
              <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform duration-500" />
              <span className="text-xs tracking-widest uppercase font-mono hidden sm:inline-block">Dashboard</span>
            </button>
            <button
              onClick={resetQuiz}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40 transition-all duration-500 bg-surface/20 hover:bg-surface text-primary/60 hover:text-primary backdrop-blur-md"
            >
              <RefreshCcw size={14} className="group-hover:-rotate-180 transition-transform duration-700" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="relative flex-1 flex flex-col justify-center min-h-[350px]">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentQ.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col gap-6 lg:gap-8"
            >
              {/* Question */}
              <h1 className="text-lg sm:text-xl lg:text-2xl leading-[1.3] tracking-tight font-medium text-white/90 drop-shadow-xl">
                {currentQ.question}
              </h1>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {currentQ.options.map((optionText, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedLetter === letter;
                  const isCorrect = currentQ.answer === letter;

                  let stateClasses = "border-border/60 hover:border-primary/30 bg-surface/40 hover:bg-surface hover:-translate-y-1 hover:shadow-xl";
                  let letterClasses = "text-primary/30";
                  let textClasses = "text-primary/80";

                  if (selectedLetter !== null) {
                    if (isSelected && isCorrect) {
                      stateClasses = "border-accent-green bg-accent-green/5 correct-glow translate-x-2";
                      letterClasses = "text-accent-green font-bold";
                      textClasses = "text-accent-green";
                    }
                    else if (isSelected && !isCorrect) {
                      stateClasses = "border-accent-red bg-accent-red/5 incorrect-glow translate-x-2";
                      letterClasses = "text-accent-red font-bold";
                      textClasses = "text-width/60";
                    }
                    else if (isCorrect) {
                      stateClasses = "border-accent-green/40 bg-accent-green/5";
                      letterClasses = "text-accent-green/60";
                      textClasses = "text-primary/90";
                    }
                    else {
                      stateClasses = "border-transparent bg-surface/10 opacity-30 scale-[0.98]";
                      textClasses = "text-primary/40";
                    }
                  }

                  return (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={selectedLetter !== null}
                      className={clsx(
                        "group text-left px-4 py-3 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-xl flex items-start sm:items-center gap-4",
                        stateClasses
                      )}
                    >
                      <div className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm shrink-0 font-mono text-sm transition-colors duration-500",
                        letterClasses
                      )}>
                        {letter}
                      </div>
                      <span className={clsx("text-sm sm:text-base leading-relaxed tracking-wide transition-colors duration-500", textClasses)}>
                        {optionText.replace(/^[a-e]\.\s/i, '')}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Footer */}
        <div className="shrink-0 flex flex-col gap-4 z-20 pt-4">
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, height: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="glass-card p-3 sm:p-4 flex items-start gap-3 ring-1 ring-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/40 to-transparent" />
                  <Info className="text-primary/60 mt-0.5 shrink-0" size={18} />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-mono">Analysis</span>
                    <p className="text-primary/80 leading-relaxed text-sm font-light">
                      {currentQ.explanation.replace('Warning: ', '')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="flex items-center gap-4">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border/40 text-primary/60 hover:text-primary hover:border-primary/40 hover:bg-surface/50 backdrop-blur-md transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest hidden sm:inline-block">Prev</span>
            </button>
            <button
              onClick={nextQuestion}
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
              <span className="relative z-10 w-full text-center">Next Module</span>
              <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </footer>
        </div>

      </main>
    </div>
  );
}
