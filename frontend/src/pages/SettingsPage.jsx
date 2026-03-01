import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Save, User as UserIcon, Lock, CheckCircle, AlertCircle } from 'lucide-react';

// A predefined list of accessible default avatars from DiceBear
const AVATAR_OPTIONS = [
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Liam',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Jude',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Mia',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Zoe'
];

const SettingsPage = () => {
    const { user, login } = useContext(AuthContext); // We use login to update the context user

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const res = await api.put('/users/profile', { name, avatar });

            // Re-authenticate silently to update Context token/user data if our backend supported that.
            // Since our backend login returns the token, and profile update does not return a new token,
            // we will simulate the context update by fetching profile or manually forcing reload.
            // Best approach for now: alert success and instruct user.

            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes globally
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Error updating profile' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            await api.put('/users/password', { currentPassword, newPassword });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Error updating password' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-uno-blue to-uno-green">
                    Account Settings
                </h1>
                <p className="text-slate-400">Manage your profile details, avatar, and security preferences.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-uno-blue/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <UserIcon className="text-uno-blue" /> Profile Info
                    </h2>

                    {profileMessage.text && (
                        <div className={`p-3 rounded-lg mb-6 flex items-center gap-2 text-sm ${profileMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {profileMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {profileMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-blue focus:ring-1 focus:ring-uno-blue text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Choose Avatar</label>
                            <div className="grid grid-cols-4 gap-3">
                                {AVATAR_OPTIONS.map((opt, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setAvatar(opt)}
                                        className={`cursor-pointer rounded-xl p-2 transition-all duration-200 border-2 ${avatar === opt ? 'border-uno-blue bg-uno-blue/10 scale-105' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
                                    >
                                        <img src={opt} alt={`Avatar ${idx}`} className="w-full h-auto rounded-lg" referrerPolicy="no-referrer" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full bg-uno-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all flex justify-center items-center gap-2"
                        >
                            {profileLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <><Save size={18} /> Save Profile</>}
                        </button>
                    </form>
                </motion.div>

                {/* Password Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-8 rounded-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-uno-red/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Lock className="text-uno-red" /> Change Password
                    </h2>

                    {passwordMessage.text && (
                        <div className={`p-3 rounded-lg mb-6 flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {passwordMessage.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-red focus:ring-1 focus:ring-uno-red text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-red focus:ring-1 focus:ring-uno-red text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-uno-red focus:ring-1 focus:ring-uno-red text-white"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full bg-uno-red hover:bg-red-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all flex justify-center items-center gap-2"
                            >
                                {passwordLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <><Save size={18} /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </motion.div>

            </div>
        </div>
    );
};

export default SettingsPage;
