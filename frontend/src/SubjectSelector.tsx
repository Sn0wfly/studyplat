import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, GraduationCap, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Subject } from './types';

interface SubjectSelectorProps {
  username: string;
  onSelectTerapeutica: () => void;
  onSelectAmboss: (subject: Subject) => void;
  onLogout: () => void;
}

export default function SubjectSelector({ username, onSelectTerapeutica, onSelectAmboss, onLogout }: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/data/subjects.json')
      .then(r => r.json())
      .then((data: Subject[]) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Filter: match parent name OR any child name
  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.children?.some(c => c.name.toLowerCase().includes(q))) return true;
    return false;
  });

  // Auto-expand groups when searching and a child matches
  useEffect(() => {
    if (!search) return;
    const q = search.toLowerCase();
    const toExpand = new Set<string>();
    for (const s of subjects) {
      if (s.children?.some(c => c.name.toLowerCase().includes(q))) {
        toExpand.add(s.id);
      }
    }
    if (toExpand.size > 0) setExpandedGroups(toExpand);
  }, [search, subjects]);

  return (
    <div className="min-h-[100dvh] bg-mesh flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-green/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Plataforma de Estudio
            </h1>
            <p className="text-xs text-primary/40 font-mono tracking-wider mt-0.5">
              Bienvenido, {username}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-surface/60 text-primary/40 hover:text-primary transition-all"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 relative z-10">
        {/* Terapéutica Clínica — Featured */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary/40 font-mono mb-3 flex items-center gap-2">
            <BookOpen size={14} /> Tus Cursos
          </h2>
          <button
            onClick={onSelectTerapeutica}
            className="w-full text-left glass-card p-5 sm:p-6 hover:border-accent-green/30 transition-all duration-500 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-accent-green transition-colors">
                  Terapéutica Clínica
                </h3>
                <p className="text-sm text-primary/50 mt-1">645 preguntas · Español</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
            </div>
          </button>
        </motion.section>

        {/* AMBOSS Subjects */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary/40 font-mono mb-3 flex items-center gap-2">
            <GraduationCap size={14} /> Biblioteca
          </h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar disciplinas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface/60 backdrop-blur-xl border border-border/40 text-primary/90 placeholder:text-primary/20 font-mono text-sm tracking-wider outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary/60 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filtered.map((subject, idx) => {
                const hasChildren = subject.children && subject.children.length > 0;
                const isExpanded = expandedGroups.has(subject.id);

                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.5) }}
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-1.5">
                      {hasChildren && (
                        <button
                          onClick={() => toggleGroup(subject.id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-primary/40 hover:text-primary/70 transition-colors shrink-0"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                      <button
                        onClick={() => onSelectAmboss(subject)}
                        className={clsx(
                          "flex-1 text-left px-4 py-3 rounded-xl bg-surface/30 border border-border/20 hover:border-primary/20 hover:bg-surface/60 transition-all duration-300 group",
                          !hasChildren && "ml-8"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary/80 group-hover:text-white transition-colors truncate pr-2">
                            {subject.name}
                          </span>
                          <span className="text-[11px] text-primary/30 font-mono shrink-0">
                            {subject.count}
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Children (sub-disciplines) */}
                    <AnimatePresence>
                      {hasChildren && isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="ml-8 pl-3 border-l border-border/20 flex flex-col gap-1 mt-1 mb-1">
                            {subject.children!
                              .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || subject.name.toLowerCase().includes(search.toLowerCase()))
                              .map(child => (
                                <button
                                  key={child.id}
                                  onClick={() => onSelectAmboss(child)}
                                  className="text-left px-4 py-2.5 rounded-lg bg-surface/20 border border-border/10 hover:border-primary/20 hover:bg-surface/50 transition-all duration-300 group"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-primary/60 group-hover:text-white transition-colors truncate pr-2">
                                      {child.name}
                                    </span>
                                    <span className="text-[11px] text-primary/25 font-mono shrink-0">
                                      {child.count}
                                    </span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-primary/40 text-sm font-mono text-center py-8">
                  No se encontraron disciplinas
                </p>
              )}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
