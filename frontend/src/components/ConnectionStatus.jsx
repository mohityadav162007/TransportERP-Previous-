import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';
import api from '../services/api';

const ConnectionStatus = () => {
    const [status, setStatus] = useState('CHECKING'); // CHECKING | CONNECTED | DISCONNECTED

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Short timeout to avoid hanging UI
                await api.get('/health', { timeout: 3000 });
                setStatus('CONNECTED');
            } catch (err) {
                console.error("Health Check Failed:", err);
                setStatus('DISCONNECTED');
            }
        };

        // Initial check
        checkHealth();

        // Poll every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (status === 'CHECKING') return null;

    return (
        <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
            transition-colors duration-300
            ${status === 'CONNECTED'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'}
        `}>
            {status === 'CONNECTED' ? (
                <>
                    <Database size={12} />
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="tracking-wide">DB ONLINE</span>
                </>
            ) : (
                <>
                    <WifiOff size={12} />
                    <span>OFFLINE</span>
                </>
            )}
        </div>
    );
};

export default ConnectionStatus;
