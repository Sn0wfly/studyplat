import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Info, Activity, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import questionsData from './questions.json';

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setQuestions(questionsData.slice(0, 340)); // Load questions
  }, []);

  const currentQ = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (selectedLetter !== null) return;
    const letter = String.fromCharCode(65 + index);
    setSelectedLetter(letter);
    setTimeout(() => setShowExplanation(true), 400); // Stagger explanation
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
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
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <Activity className="animate-spin text-primary/40" size={32} />
    </div>
  );

  const progress = ((currentIndex + 1) / questions.length) * 100;

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
    <div className="min-h-screen max-h-screen bg-mesh flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden">

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

      <main className="w-full max-w-4xl relative z-10 flex flex-col h-full justify-between gap-6 py-4">

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
              / {String(questions.length).padStart(3, '0')}
            </span>
          </motion.div>

          <button
            onClick={resetQuiz}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40 transition-all duration-500 bg-surface/20 hover:bg-surface text-primary/60 hover:text-primary backdrop-blur-md"
          >
            <RefreshCcw size={14} className="group-hover:-rotate-180 transition-transform duration-700" />
            <span className="text-xs tracking-widest uppercase font-mono hidden sm:inline-block">Reset</span>
          </button>
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl leading-[1.3] tracking-tight font-medium text-white/90 drop-shadow-xl">
                {currentQ.question}
              </h1>

              {/* Options */}
              <div className="flex flex-col gap-3">
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
                        "group text-left px-5 py-4 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-xl flex items-start sm:items-center gap-5",
                        stateClasses
                      )}
                    >
                      <div className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm shrink-0 font-mono text-sm transition-colors duration-500",
                        letterClasses
                      )}>
                        {letter}
                      </div>
                      <span className={clsx("text-base sm:text-lg leading-relaxed tracking-wide transition-colors duration-500", textClasses)}>
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
                <div className="glass-card p-4 sm:p-5 flex items-start gap-3 ring-1 ring-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/40 to-transparent" />
                  <Info className="text-primary/60 mt-0.5 shrink-0" size={20} />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-mono">Analysis</span>
                    <p className="text-primary/80 leading-relaxed text-sm sm:text-base font-light">
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
              disabled={currentIndex === questions.length - 1 || selectedLetter === null}
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
