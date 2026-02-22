import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, User } from 'lucide-react';
import guildLogo from '../../image.png';

interface LoginPageProps {
    onAuthenticated: (username: string, pass: string, initialData: any) => void;
}

export default function LoginPage({ onAuthenticated }: LoginPageProps) {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (password.toUpperCase() === 'THEGUILD' && username.trim() !== '' && userPassword.trim() !== '') {
            setLoading(true);
            try {
                // We're inside Vite, but it's deployed on Vercel which routes /api automatically
                const res = await fetch('/api/get-progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username.trim(), password: userPassword.trim() })
                });

                if (!res.ok) throw new Error("Failed");

                const data = await res.json();
                onAuthenticated(username.trim(), userPassword.trim(), data);
            } catch (err) {
                // Fallback to empty if missing or error
                onAuthenticated(username.trim(), userPassword.trim(), { correct: [], incorrect: [] });
            } finally {
                setLoading(false);
            }
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setTimeout(() => setError(false), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-green/[0.03] rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-8 max-w-sm w-full"
            >
                {/* Logo Image */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl scale-150 pointer-events-none" />
                    <img
                        src={guildLogo}
                        alt="The Guild"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-cover object-top rounded-full ring-2 ring-white/10 shadow-2xl relative z-10"
                    />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none z-20" />
                </motion.div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                        The Guild
                    </h1>
                    <p className="text-sm tracking-[0.2em] uppercase text-primary/30 font-mono">
                        Members Only
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <motion.div
                        animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-3 relative"
                    >
                        <div className="relative">
                            <User
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 z-10"
                            />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/40 text-primary/90 placeholder:text-primary/20 font-mono text-sm tracking-wider outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all duration-500"
                                autoFocus
                            />
                        </div>

                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 z-10"
                            />
                            <input
                                type="password"
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                                placeholder="Personal PIN / Password"
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/40 text-primary/90 placeholder:text-primary/20 font-mono text-sm tracking-wider outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all duration-500"
                            />
                        </div>

                        <div className="relative mt-2">
                            <Lock
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 z-10"
                            />
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Guild Passcode"
                                className="w-full pl-11 pr-14 py-3.5 rounded-2xl bg-primary/5 backdrop-blur-xl border border-primary/20 text-primary/90 placeholder:text-primary/30 font-mono text-sm tracking-wider outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary hover:bg-primary/80 flex items-center justify-center transition-all duration-300 group disabled:opacity-50"
                            >
                                <ArrowRight
                                    size={16}
                                    className="text-background group-hover:translate-x-0.5 transition-all duration-300"
                                />
                            </button>
                        </div>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                                className="flex items-center gap-2 justify-center text-accent-red text-xs font-mono tracking-wider"
                            >
                                <AlertCircle size={12} />
                                <span>Access Denied / Missing Info</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </motion.div>

            {/* Subtle footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute bottom-6 text-[10px] text-primary/15 font-mono tracking-[0.3em] uppercase"
            >
                Study Platform
            </motion.p>
        </div>
    );
}
