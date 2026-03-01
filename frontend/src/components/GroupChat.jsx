import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Send } from 'lucide-react';

const GroupChat = ({ groupId }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Default Avatar component if user has no avatar img
    const UserAvatar = ({ name, avatar }) => {
        if (avatar) {
            return <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />;
        }
        return (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-sm text-slate-300">
                {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
        );
    };

    useEffect(() => {
        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/groups/${groupId}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();

        // Initialize socket
        // Note: the backend runs on port 5000 in dev
        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('joinGroup', groupId);

        newSocket.on('newMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        socket.emit('sendMessage', {
            groupId,
            userId: user._id || user.id, // Support different token payloads
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900/40 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-900/80 p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Live Chat
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 h-full flex items-center justify-center">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : null}

                {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender?._id === (user?._id || user?.id);

                    return (
                        <div key={msg._id || index} className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                <UserAvatar name={msg.sender?.name} avatar={msg.sender?.avatar} />

                                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs text-slate-400 mb-1 px-1">
                                        {msg.sender?.name}
                                    </span>
                                    <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                            ? 'bg-uno-blue text-white rounded-tr-sm'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                        }`}>
                                        <p className="whitespace-pre-wrap word-break">{msg.content}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900/80 border-t border-slate-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-uno-blue transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-uno-blue hover:bg-blue-600 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GroupChat;
