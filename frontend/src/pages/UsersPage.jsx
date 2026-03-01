import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Shield, UserPlus, X } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState('');

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            navigate('/profile'); // Redirect if not admin
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [usersRes, groupsRes] = await Promise.all([
                api.get('/users'), // The admin route we just created
                api.get('/groups')
            ]);
            setUsers(usersRes.data);
            setGroups(groupsRes.data);
        } catch (err) {
            console.error(err);
            setActionMessage({ text: 'Failed to load data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const openAddToGroupModal = (userItem) => {
        setSelectedUser(userItem);
        setSelectedGroupId('');
        setShowModal(true);
    };

    const handleAddToGroup = async (e) => {
        e.preventDefault();
        if (!selectedGroupId) return;

        try {
            await api.post(`/groups/${selectedGroupId}/add-user`, { userId: selectedUser._id });
            setActionMessage({ text: `Successfully added ${selectedUser.name} to the group.`, type: 'success' });
            setShowModal(false);
            // Automatically clear success message after 3 seconds
            setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setActionMessage({ text: err.response?.data?.message || 'Failed to add user', type: 'error' });
            setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uno-red"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
            <div className="mb-12">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black mb-2 flex items-center gap-3 text-white"
                >
                    <Shield className="text-uno-red w-10 h-10" />
                    User Management
                </motion.h1>
                <p className="text-slate-400">View all registered users and assign them to specific game groups.</p>
            </div>

            <AnimatePresence>
                {actionMessage.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-lg border ${actionMessage.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}
                    >
                        {actionMessage.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-uno-red/5">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-900/80 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-4">User Details</div>
                    <div className="col-span-3 text-center">Role</div>
                    <div className="col-span-2 text-center">Total Points</div>
                    <div className="col-span-3 text-right pr-4">Actions</div>
                </div>

                <div className="divide-y divide-slate-800">
                    {users.map((u, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={u._id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-slate-800/80"
                        >
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg hidden sm:flex border border-slate-700">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-white block">{u.name}</span>
                                    <span className="text-xs text-slate-400">{u.email}</span>
                                </div>
                            </div>
                            <div className="col-span-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'Admin' ? 'bg-uno-red/20 text-uno-red border border-uno-red/50' : 'bg-slate-700/50 text-slate-300'}`}>
                                    {u.role}
                                </span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-uno-yellow to-uno-red">
                                    {u.totalPoints}
                                </span>
                            </div>
                            <div className="col-span-3 flex justify-end pr-2">
                                <button
                                    onClick={() => openAddToGroupModal(u)}
                                    className="bg-uno-blue/10 hover:bg-uno-blue/20 text-uno-blue border border-uno-blue/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <UserPlus size={16} /> Add to Group
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {users.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No users found.
                        </div>
                    )}
                </div>
            </div>

            {/* Add to Group Modal */}
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

                            <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                                <UserPlus className="text-uno-blue" /> Assign Player
                            </h2>
                            <p className="text-slate-400 mb-6 text-sm">Select a group for <strong className="text-white">{selectedUser?.name}</strong> to join.</p>

                            <form onSubmit={handleAddToGroup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Select Target Group</label>
                                    <select
                                        required
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-blue focus:ring-1 focus:ring-uno-blue transition-colors text-white"
                                    >
                                        <option value="" disabled>-- Choose a Group --</option>
                                        {groups.map(g => (
                                            <option key={g._id} value={g._id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors border border-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!selectedGroupId}
                                        className="flex-1 bg-uno-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default UsersPage;
