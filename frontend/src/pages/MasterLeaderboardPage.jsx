import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const MasterLeaderboardPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/users/leaderboard');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uno-yellow"></div>
            </div>
        );
    }

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50', icon: <Trophy className="w-6 h-6 text-yellow-400" /> };
            case 1: return { color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/50', icon: <Medal className="w-6 h-6 text-slate-300" /> };
            case 2: return { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/50', icon: <Award className="w-6 h-6 text-amber-600" /> };
            default: return { color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-700/50', icon: null };
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-uno-yellow/20 rounded-full blur-3xl"></div>
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-uno-yellow via-uno-red to-uno-yellow inline-block relative z-10"
                >
                    Global Master Leaderboard
                </motion.h1>
                <p className="text-slate-400 relative z-10">The ultimate ranking of all UNO champions.</p>
            </div>

            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-uno-yellow/5">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-900/80 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-6">Player Name</div>
                    <div className="col-span-4 text-right pr-4">Total Points</div>
                </div>

                <div className="divide-y divide-slate-800">
                    {users.map((user, idx) => {
                        const style = getRankStyle(idx);
                        return (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={user._id}
                                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-slate-800/80 ${style.bg} ${idx < 3 ? 'border-l-4 ' + style.border : 'border-l-4 border-transparent'}`}
                            >
                                <div className="col-span-2 flex justify-center items-center">
                                    {style.icon ? (
                                        style.icon
                                    ) : (
                                        <span className="text-xl font-bold text-slate-500">#{idx + 1}</span>
                                    )}
                                </div>
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg hidden sm:flex border border-slate-700">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-lg font-bold ${idx < 3 ? 'text-white' : 'text-slate-300'}`}>{user.name}</span>
                                </div>
                                <div className="col-span-4 text-right pr-4">
                                    <span className={`text-2xl font-black ${style.color}`}>{user.totalPoints}</span>
                                </div>
                            </motion.div>
                        );
                    })}

                    {users.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No players currently ranked. Play some games!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MasterLeaderboardPage;
