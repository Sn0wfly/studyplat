import { ArrowLeft } from 'lucide-react';

interface SubjectNavbarProps {
  subjectName: string;
  onBack: () => void;
}

export default function SubjectNavbar({ subjectName, onBack }: SubjectNavbarProps) {
  return (
    <div className="fixed top-1 left-0 w-full z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/60 backdrop-blur-xl border border-border/30 shadow-lg mt-1">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-white/10 transition-colors text-primary/50 hover:text-primary"
          title="Back to subjects"
        >
          <ArrowLeft size={14} />
        </button>
        <span className="text-[11px] font-mono tracking-wider text-primary/60 uppercase max-w-[200px] sm:max-w-none truncate">
          {subjectName}
        </span>
      </div>
    </div>
  );
}
