import { ArrowLeft } from 'lucide-react';

interface SubjectNavbarProps {
  subjectName: string;
  onBack: () => void;
}

export default function SubjectNavbar({ subjectName, onBack }: SubjectNavbarProps) {
  return (
    <div className="fixed top-1 left-0 w-full z-40 flex justify-center pointer-events-none">
      <button
        onClick={onBack}
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/60 backdrop-blur-xl border border-border/30 shadow-lg mt-1 hover:bg-surface/80 transition-colors cursor-pointer"
        title="Volver a la selección"
      >
        <ArrowLeft size={14} className="text-primary/50" />
        <span className="text-[11px] font-mono tracking-wider text-primary/60 uppercase max-w-[200px] sm:max-w-none truncate">
          {subjectName}
        </span>
      </button>
    </div>
  );
}
