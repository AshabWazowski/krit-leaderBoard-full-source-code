import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Users, PlusCircle, X } from 'lucide-react';

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
            console.log("Groups: ", res.data);
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleRequestJoin = async (groupId) => {
        try {
            await api.post(`/groups/${groupId}/request-join`);
            fetchGroups(); // refresh groups to show pending state
        } catch (err) {
            alert(err.response?.data?.message || 'Error requesting to join group');
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', { name: newGroupName, description: newGroupDesc });
            setShowModal(false);
            setNewGroupName('');
            setNewGroupDesc('');
            fetchGroups();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating group');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uno-green"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-uno-green to-uno-blue"
                    >
                        Game Groups
                    </motion.h1>
                    <p className="text-slate-400">Join a group to start earning points on its specific leaderboard.</p>
                </div>
                {user?.role === 'Admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-uno-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Create Group
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, idx) => {
                    const isMember = group.members.includes(user?._id) || group.adminId?._id === user?.id || user?.role === 'Admin';
                    const hasRequested = group.joinRequests?.includes(user?._id);
                    console.log("Requested:", hasRequested);
                    // console.log("USER: ",user);
                    
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={group._id}
                            className={`glass rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${isMember ? 'hover:border-uno-green/50 cursor-pointer hover:-translate-y-1 hover:shadow-uno-green/10' : 'opacity-80'}`}
                            onClick={() => isMember ? navigate(`/groups/${group._id}`) : null}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isMember ? 'bg-uno-green' : 'bg-slate-500'}`}></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h3 className="text-2xl font-bold text-white">{group.name}</h3>
                                {isMember ? (
                                    <div className="bg-uno-green/20 text-uno-green p-2 rounded-full">
                                        <Unlock size={20} />
                                    </div>
                                ) : (
                                    <div className="bg-slate-700/50 text-slate-400 p-2 rounded-full">
                                        <Lock size={20} />
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-300 mb-6 min-h-[48px] line-clamp-2 relative z-10">
                                {group.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between mt-auto relative z-10">
                                <div className="flex items-center gap-2 text-slate-400 font-medium bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <Users size={16} />
                                    <span>{group.members.length} players</span>
                                </div>

                                {!isMember && !hasRequested && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRequestJoin(group._id); }}
                                        className="bg-uno-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                    >
                                        Join to Play
                                    </button>
                                )}

                                {!isMember && hasRequested && (
                                    <button
                                        disabled
                                        className="bg-slate-700/50 text-slate-400 px-4 py-2 rounded-lg font-medium border border-slate-600 cursor-not-allowed"
                                    >
                                        Pending
                                    </button>
                                )}
                                {isMember && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group._id}`); }}
                                        className="bg-uno-green/20 hover:bg-uno-green/30 text-uno-green border border-uno-green/30 px-4 py-2 rounded-lg font-medium transition-all"
                                    >
                                        {user?.role === 'Admin' ? 'Manage Group' : 'View Group'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                {groups.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-slate-500">
                        No groups available yet. Ask an admin to create one!
                    </div>
                )}
            </div>

            {/* Admin Create Group Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass p-8 rounded-2xl w-full max-w-md relative z-10 border border-slate-700 shadow-2xl"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                <PlusCircle className="text-uno-green" /> Create New Group
                            </h2>

                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-green focus:ring-1 focus:ring-uno-green transition-colors text-white"
                                        placeholder="e.g. Weekend Warriors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newGroupDesc}
                                        onChange={(e) => setNewGroupDesc(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-green focus:ring-1 focus:ring-uno-green transition-colors text-white min-h-[100px]"
                                        placeholder="Describe the group..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-uno-green hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                >
                                    Confirm & Create
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroupsPage;
