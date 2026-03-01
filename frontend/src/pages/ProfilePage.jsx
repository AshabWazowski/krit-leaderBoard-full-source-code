import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Trophy, Users, Bell, Award } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setProfileData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uno-blue"></div>
            </div>
        );
    }

    if (!profileData) return <div className="text-center p-8 text-xl">Error loading profile data</div>;

    const { user: userData, groups } = profileData;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-6 mb-8"
            >
                {/* Profile Card */}
                <div className="glass flex-1 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-uno-blue/10 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-4 mb-6">
                        {userData.avatar ? (
                            <img src={userData.avatar} alt="User Avatar" className="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-800 object-cover shadow-lg shadow-uno-blue/20" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-uno-blue to-uno-green rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-uno-blue/20">
                                {userData.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">{userData.name}</h1>
                            <p className="text-slate-400">{userData.role}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                        <div className="flex items-center gap-3">
                            <Trophy className="text-uno-yellow w-6 h-6" />
                            <span className="text-lg text-slate-300">Master Points</span>
                        </div>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-uno-yellow to-uno-red">
                            {userData.totalPoints}
                        </span>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass flex-1 p-6 rounded-2xl flex flex-col h-64 md:h-auto max-h-80">
                    <div className="flex items-center gap-2 mb-4 text-uno-red">
                        <Bell className="w-5 h-5" />
                        <h2 className="text-xl font-bold text-white">Notifications</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {userData.notifications.length === 0 ? (
                            <p className="text-slate-500 italic text-center py-4">No recent activity</p>
                        ) : (
                            userData.notifications.map((note, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-sm flex gap-3 items-start">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-uno-red shrink-0"></div>
                                    <div className="flex flex-col">
                                        <p className="text-slate-300">
                                            {typeof note === 'string' ? note : note.message}
                                        </p>
                                        {typeof note !== 'string' && note.date && (
                                            <span className="text-xs text-slate-500 mt-1">{note.date}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Joined Groups */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-2 mb-6 text-uno-green">
                    <Users className="w-6 h-6" />
                    <h2 className="text-2xl font-bold text-white">Joined Groups</h2>
                </div>

                {groups.length === 0 ? (
                    <div className="glass p-8 rounded-2xl text-center">
                        <p className="text-slate-400 mb-4">You haven't joined any groups yet.</p>
                        <a href="/groups" className="inline-block bg-uno-green hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-green-500/20">
                            Browse Groups
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <div key={group.groupId} className="glass p-6 rounded-xl hover:border-uno-green/50 transition-colors group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-uno-green/5 rounded-full blur-2xl group-hover:bg-uno-green/10 transition-colors"></div>
                                <h3 className="text-xl font-bold mb-4">{group.name}</h3>
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Group Points</span>
                                        <span className="text-xl font-bold text-uno-blue">{group.points}</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-700"></div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Rank</span>
                                        <div className="flex items-center gap-1 text-uno-yellow font-bold text-xl">
                                            <Award className="w-4 h-4" />
                                            #{group.rank || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProfilePage;
