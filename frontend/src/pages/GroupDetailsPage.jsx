import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, Trophy, UserPlus, UserMinus, Plus, Minus, X } from 'lucide-react';
import GroupChat from '../components/GroupChat';

const GroupDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add User Modal State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('');

    const fetchGroupData = async () => {
        try {
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading group');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        if (user?.role !== 'Admin') return;
        try {
            const res = await api.get('/users');
            setAllUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch all users", err);
        }
    }

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    useEffect(() => {
        if (showAddUserModal) {
            fetchAllUsers();
        }
    }, [showAddUserModal]);

    const handleAdjustPoints = async (playerId, amount) => {
        try {
            await api.post(`/groups/${id}/points`, {
                userId: playerId,
                pointsChange: amount
            });
            // Refresh to get new sorting
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adjusting points');
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this player from the group?")) return;
        try {
            await api.post(`/groups/${id}/remove-user`, { userId });
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error removing player');
        }
    };

    const handleAddUserToGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${id}/add-user`, { userId: selectedUserIdToAdd });
            setShowAddUserModal(false);
            setSelectedUserIdToAdd('');
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding player');
        }
    };

    const handleApproveRequest = async (userId) => {
        try {
            await api.post(`/groups/${id}/approve-request`, { userId });
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving request');
        }
    };

    const handleRejectRequest = async (userId) => {
        try {
            await api.post(`/groups/${id}/reject-request`, { userId });
            fetchGroupData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting request');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uno-blue"></div></div>;
    if (error) return <div className="text-center mt-20 text-red-400 text-xl">{error}</div>;
    if (!group) return null;

    const isAdmin = user?.role === 'Admin';

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/groups')}
                className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={18} /> Back to Groups
            </button>

            <div className="glass rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-uno-blue/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            {group.name}
                            {isAdmin && <span className="text-xs bg-uno-red/20 text-uno-red border border-uno-red/50 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider"><Shield size={12} /> Admin View</span>}
                        </h1>
                        <p className="text-slate-300 max-w-2xl">{group.description}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-center min-w-[120px]">
                        <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Total Members</span>
                        <span className="text-3xl font-bold text-uno-blue">{group.leaderboard.length}</span>
                    </div>
                </div>
            </div>

            {isAdmin && group.joinRequests && group.joinRequests.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden mb-8">
                    <div className="bg-slate-900/80 p-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <UserPlus className="text-uno-green" /> Pending Join Requests
                        </h2>
                    </div>
                    <div className="p-4 space-y-2">
                        {group.joinRequests.map(reqUser => (
                            <div key={reqUser._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/40 rounded-xl p-4 border border-slate-700 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{reqUser.name}</span>
                                    <span className="text-slate-400 text-sm">{reqUser.email}</span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => handleApproveRequest(reqUser._id)} className="flex-1 sm:flex-none bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center">Approve</button>
                                    <button onClick={() => handleRejectRequest(reqUser._id)} className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass rounded-2xl overflow-hidden">
                <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-uno-yellow" /> Group Leaderboard
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="bg-uno-blue/10 hover:bg-uno-blue/20 text-uno-blue border border-uno-blue/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <UserPlus size={16} /> Add Player
                        </button>
                    )}
                </div>

                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 bg-slate-800/20 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-5">Player</div>
                    <div className="col-span-3 text-center">Group Points</div>
                    <div className="col-span-3 text-center">Master Points</div>
                </div>

                <div className="p-2">
                    <AnimatePresence>
                        {group.leaderboard.map((member, idx) => (
                            <motion.div
                                key={member._id}
                                layout // Highlights that position might change!
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center bg-slate-900/40 rounded-xl mb-2 border border-slate-700 hover:border-slate-500 transition-colors group/row"
                            >
                                <div className="col-span-1 flex justify-center text-xl font-bold text-slate-500">
                                    #{idx + 1}
                                </div>
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-lg hidden sm:flex text-slate-300">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="text-lg font-bold text-white block leading-tight">{member.name}</span>
                                        <span className="text-xs text-slate-400">{member.email}</span>
                                    </div>
                                </div>
                                <div className="col-span-3 flex items-center justify-center gap-4">
                                    {isAdmin && (
                                        <button onClick={() => handleAdjustPoints(member._id, -1)} className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover/row:opacity-100">
                                            <Minus size={16} />
                                        </button>
                                    )}
                                    <span className="text-2xl font-black text-uno-blue w-12 text-center">{member.groupPoints}</span>
                                    {isAdmin && (
                                        <button onClick={() => handleAdjustPoints(member._id, 1)} className="p-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors opacity-0 group-hover/row:opacity-100">
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="col-span-3 flex items-center justify-center gap-2 text-slate-400 font-medium relative">
                                    <span>{member.totalPoints}</span>
                                    {isAdmin && (
                                        <button onClick={() => handleRemoveUser(member._id)} className="absolute right-0 p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover/row:opacity-100" title="Remove Player">
                                            <UserMinus size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {group.leaderboard.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            No players have joined this group yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Live Chat Section */}
            <div className="mt-8">
                <GroupChat groupId={id} />
            </div>

            {/* Admin Add User to Group Modal */}
            <AnimatePresence>
                {showAddUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowAddUserModal(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass p-8 rounded-2xl w-full max-w-md relative z-10 border border-slate-700 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <UserPlus className="text-uno-blue" /> Add Player
                                </h2>
                                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddUserToGroup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Select User</label>
                                    <select
                                        required
                                        value={selectedUserIdToAdd}
                                        onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-blue focus:ring-1 focus:ring-uno-blue text-white"
                                    >
                                        <option value="" disabled>-- Choose a User --</option>
                                        {allUsers
                                            .filter(u => !group.leaderboard.map(m => m._id).includes(u._id))
                                            .map(u => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                            ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={!selectedUserIdToAdd}
                                        className="w-full bg-uno-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all"
                                    >
                                        Add Player
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

export default GroupDetailsPage;
