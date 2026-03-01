import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const floatingCards = [
  // Each card: position, size, timing, rotation, content
  { left: '3%',   w: 160, duration: 24, delay: 0,   rotStart: -6,  rotEnd: 3,   opacity: 0.55, options: ['A', 'B', 'C', 'D'], correct: 1 },
  { left: '82%',  w: 140, duration: 28, delay: 2,   rotStart: 4,   rotEnd: -5,  opacity: 0.45, options: ['A', 'B', 'C'], correct: 2 },
  { left: '18%',  w: 130, duration: 30, delay: 5,   rotStart: -3,  rotEnd: 6,   opacity: 0.40, options: ['A', 'B', 'C', 'D'], correct: 0 },
  { left: '68%',  w: 150, duration: 26, delay: 1,   rotStart: 5,   rotEnd: -3,  opacity: 0.50, options: ['A', 'B', 'C', 'D'], correct: 3 },
  { left: '42%',  w: 120, duration: 32, delay: 8,   rotStart: -2,  rotEnd: 4,   opacity: 0.35, options: ['A', 'B'], correct: 0 },
  { left: '92%',  w: 110, duration: 22, delay: 3,   rotStart: 6,   rotEnd: -7,  opacity: 0.50, options: ['A', 'B', 'C'], correct: 1 },
  { left: '55%',  w: 145, duration: 34, delay: 10,  rotStart: -5,  rotEnd: 2,   opacity: 0.38, options: ['A', 'B', 'C', 'D'], correct: 2 },
  { left: '8%',   w: 135, duration: 27, delay: 6,   rotStart: 3,   rotEnd: -4,  opacity: 0.50, options: ['A', 'B', 'C'], correct: 0 },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-green/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Floating quiz cards */}
      {floatingCards.map((card, i) => (
        <div
          key={i}
          className="login-card"
          style={{
            left: card.left,
            width: card.w,
            '--duration': `${card.duration}s`,
            '--delay': `${card.delay}s`,
            '--rotate-start': `${card.rotStart}deg`,
            '--rotate-end': `${card.rotEnd}deg`,
            '--max-opacity': card.opacity,
          } as React.CSSProperties}
        >
          <div className="rounded-xl border border-white/20 bg-white/[0.07] backdrop-blur-sm p-3 space-y-1.5">
            {/* Fake question line */}
            <div className="space-y-1 mb-2.5">
              <div className="h-1.5 rounded-full bg-white/20 w-full" />
              <div className="h-1.5 rounded-full bg-white/15 w-3/4" />
            </div>
            {/* Options */}
            {card.options.map((letter, j) => {
              const isCorrect = j === card.correct;
              const isWrong = j === (card.correct + 1) % card.options.length;
              return (
                <div
                  key={letter}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-mono border ${
                    isCorrect
                      ? 'border-accent-green/40 bg-accent-green/20 text-accent-green/80'
                      : isWrong
                        ? 'border-accent-red/30 bg-accent-red/15 text-accent-red/60'
                        : 'border-white/15 text-white/40'
                  }`}
                >
                  <span className="shrink-0">{letter}</span>
                  <div className={`h-1 rounded-full flex-1 ${
                    isCorrect ? 'bg-accent-green/40' : isWrong ? 'bg-accent-red/25' : 'bg-white/15'
                  }`} />
                  {isCorrect && <Check size={10} className="shrink-0" />}
                  {isWrong && <X size={10} className="shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-10 max-w-sm w-full relative z-10"
      >
        {/* Brand */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40">
            THE GUILD
          </h1>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent mx-auto mt-3" />
        </div>

        {/* Clerk SignIn */}
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none border-none !p-0',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-surface/60 border border-border/40 text-primary/80 hover:bg-surface hover:border-primary/30 transition-all duration-300',
              socialButtonsBlockButtonText: 'font-mono text-sm',
              dividerLine: 'bg-border/30',
              dividerText: 'text-primary/30 font-mono text-xs',
              formFieldLabel: 'text-primary/50 font-mono text-xs tracking-wider',
              formFieldInput: 'bg-surface/60 border-border/40 text-primary/90 font-mono text-sm rounded-xl focus:border-primary/30 focus:ring-primary/10',
              formButtonPrimary: 'bg-primary text-background hover:bg-primary/80 rounded-xl font-mono text-sm tracking-wider',
              footerAction: 'hidden',
              footer: 'hidden',
            }
          }}
        />
      </motion.div>
    </div>
  );
}
