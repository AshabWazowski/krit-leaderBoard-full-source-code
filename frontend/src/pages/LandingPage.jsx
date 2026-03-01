import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers, Zap, Trophy, ArrowRight, User } from 'lucide-react';
import Creator from '../assets/Creator.jpg';
import Creator1 from '../assets/Creator1.jpg';
import Creator2 from '../assets/Creator2.jpg';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CreatorBlock = ({ name, role, placeholderColor, image, reverse, angleClass }) => {
    const ref = useRef(null);    
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "0.6 1"]
    });
    const translateY = useTransform(scrollYProgress, [0, 1], [150, 0]);
    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const filter = useTransform(scrollYProgress, [0, 1], ["blur(15px) brightness(0.2)", "blur(0px) brightness(1)"]);

    return (
        <motion.div
            ref={ref}
            style={{ y: translateY, opacity, filter }}
            className={`w-[110vw] md:w-[70vw] mx-auto flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} justify-between items-center gap-12 md:gap-24 mb-32 group`}
        >
            {/* Image Side */}
            <div className={`flex-1 flex ${reverse ? 'justify-start' : 'justify-end'} w-full`}>
                <div className={`w-full max-w-sm md:max-w-md aspect-square rounded-[3rem] bg-gradient-to-br flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${angleClass} hover:rotate-0 transition-all duration-700 ease-out relative overflow-hidden`}>
                    <img src={image} alt={name} className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
                </div>
            </div>

            {/* Content Side */}
            <div className={`flex-1 flex flex-col ${reverse ? 'items-end text-right' : 'items-start text-left'} w-full`}>
                <h3 className="text-5xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight block">{name}</h3>
                <p className="text-3xl md:text-4xl font-bold text-uno-blue mb-6">{role}</p>
                <div className="w-20 h-2 bg-uno-blue/50 rounded-full mb-6"></div>
                <p className="text-xl md:text-2xl text-slate-400 max-w-lg leading-relaxed">
                    Passionate about creating modern, responsive, and breathtaking digital experiences. Pushing the boundaries of web technologies to deliver the ultimate UX.
                </p>
            </div>
        </motion.div>
    );
};

const CreatorsSection = () => {
    return (
        <section className="py-32 relative z-10 overflow-hidden border-t border-slate-800/50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl bg-uno-blue/5 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="text-center mb-32 relative z-10">
                <h2 className="text-5xl md:text-7xl font-black mb-6">Meet the Creators</h2>
                <p className="text-2xl text-slate-400 max-w-2xl mx-auto">The masterminds behind the platform.</p>
            </div>

            <div className="flex flex-col relative z-10">
                <CreatorBlock name="Owner" role="Project Lead" placeholderColor="from-uno-red to-red-900" angleClass="-rotate-6" reverse={false} image={Creator}/>
                <CreatorBlock name="CTO" role="Design & UX" placeholderColor="from-uno-blue to-blue-900" angleClass="rotate-6" reverse={true} image={Creator1}/>
                <CreatorBlock name="Developer" role="Backend Ninja" placeholderColor="from-uno-green to-green-900" angleClass="-rotate-3" reverse={false} image={Creator2}/>
            </div>
        </section>
    );
};

const LandingPage = () => {
    const {user} = useContext(AuthContext);
    return (
        <div className="min-h-[calc(100vh-80px)] overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-uno-red/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-uno-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 center w-72 h-72 bg-uno-yellow/10 rounded-full blur-[100px] pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 text-uno-green mb-8 shadow-lg shadow-uno-green/10">
                        <Zap size={16} className="fill-uno-green" />
                        <span className="text-sm font-bold tracking-wide uppercase">The Ultimate UNO Experience</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        Claim Your Spot on the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green inline-block mt-2">
                            Master Leaderboard
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Create groups with your friends, track your wins, and compete for global dominance in the most intense UNO ranking system ever built.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to={user !== null ? "/groups" : "/signup"} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-uno-blue to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-full transition-all shadow-lg shadow-uno-blue/20 hover:shadow-uno-blue/40 flex items-center justify-center gap-2 group text-lg">
                            Start Playing Now
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/master" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-all shadow-lg shadow-slate-900/50 flex items-center justify-center gap-2 text-lg border border-slate-700">
                            View Global Ranks
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Parallax Creators Section */}
            {/* <CreatorsSection /> */}

            {/* How it works */}
            <section className="py-24 bg-slate-900/50 border-t border-slate-800/50 relative z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to start tracking your UNO supremacy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="glass p-8 rounded-2xl border-t-4 border-t-uno-red text-center"
                        >
                            <div className="w-16 h-16 bg-uno-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Layers className="text-uno-red w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">1. Join a Group</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Find your friend's group or have an Admin create a new one for your game nights.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="glass p-8 rounded-2xl border-t-4 border-t-uno-yellow text-center"
                        >
                            <div className="w-16 h-16 bg-uno-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Zap className="text-uno-yellow w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">2. Win Games</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Play UNO IRL or online. When you win, Admins add points to your profile globally and locally.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="glass p-8 rounded-2xl border-t-4 border-t-uno-green text-center"
                        >
                            <div className="w-16 h-16 bg-uno-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trophy className="text-uno-green w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">3. Rank Up</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Watch your name climb the Master Leaderboard in real-time as you destroy your friendships.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Rules Banner */}
            <section className="py-24 max-w-7xl mx-auto px-4 relative z-10">
                <div className="glass rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-uno-blue/20 to-transparent pointer-events-none"></div>

                    <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">House Rules Apply.</h2>
                        <ul className="space-y-4 text-lg text-slate-300">
                            <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-uno-red"></div> Stacking +2 and +4 is allowed (don't lie to yourself).</li>
                            <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-uno-blue"></div> Jump-ins are strictly enforced.</li>
                            <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-uno-green"></div> Forgetting to say "UNO" costs you 2 cards and your dignity.</li>
                            <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-uno-yellow"></div> 1 Win = 1 Master Point. Simple.</li>
                        </ul>
                    </div>

                    <div className="w-full md:w-1/3 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-uno-blue/30 blur-2xl rounded-full"></div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/UNO_Logo.svg" alt="UNO Logo" className="relative z-10 w-48 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
