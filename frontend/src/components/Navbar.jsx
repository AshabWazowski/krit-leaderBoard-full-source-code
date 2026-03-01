import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Settings } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green">
                UNO.io
            </Link>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <Link to="/groups" className="text-slate-300 hover:text-white transition-colors">Groups</Link>
                        <Link to="/master" className="text-slate-300 hover:text-white transition-colors">Global Rank</Link>
                        <div className="h-6 w-px bg-slate-700 mx-2"></div>

                        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            {user.avatar ? (
                                <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full border border-slate-600 bg-slate-800" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-8 h-8 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-uno-blue">
                                    <UserIcon size={16} />
                                </div>
                            )}
                            <span className="max-w-[100px] truncate text-uno-blue font-medium">{user.name}</span>
                        </Link>

                        <Link to="/settings" className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 ml-2" title="Settings">
                            <Settings size={18} />
                        </Link>

                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-800" title="Log Out">
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-slate-300 hover:text-white transition-colors mr-4">Sign In</Link>
                        <Link to="/signup" className="bg-uno-blue hover:bg-blue-600 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20">
                            Play Now
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
