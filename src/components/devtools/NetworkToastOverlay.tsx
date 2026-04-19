"use client";

import { useNetworkStore, NetworkLog } from '@/store/useNetworkStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ServerCrash, CheckCircle2 } from 'lucide-react';

function ToastItem({ log }: { log: NetworkLog }) {
    const removeToast = useNetworkStore(state => state.removeToast);
    const setDevToolsOpen = useNetworkStore(state => state.setDevToolsOpen);
    
    useEffect(() => {
        // Auto-dismiss the toast after 4 seconds
        const t = setTimeout(() => removeToast(log.id), 4000);
        return () => clearTimeout(t);
    }, [log.id, removeToast]);

    const isSuccess = log.status && log.status >= 200 && log.status < 400;
    const isError = log.status === 0 || (log.status && log.status >= 400);

    let pathDisplay = log.url;
    try {
        const urlObj = new URL(log.url.startsWith('/') ? 'http://l' + log.url : log.url);
        pathDisplay = urlObj.pathname + urlObj.search;
    } catch(e){}

    const handleClick = () => {
        setDevToolsOpen(true);
        removeToast(log.id); // dismiss on click
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            onClick={handleClick}
            className={`w-80 p-3 rounded-xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-[1.02] transition-transform ${
                isSuccess ? 'bg-green-500/10 border-green-500/20' : 
                isError ? 'bg-red-500/10 border-red-500/20' : 
                'bg-card border-border'
            }`}
        >
            <div className={`mt-0.5 shrink-0 ${isSuccess ? 'text-green-500' : isError ? 'text-red-500' : 'text-primary'}`}>
                {isError ? <ServerCrash className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                        isSuccess ? 'bg-green-500/20 text-green-500' : isError ? 'bg-red-500/20 text-red-500' : 'bg-muted text-muted-foreground'
                    }`}>
                        {log.method}
                    </span>
                    <span className={`text-xs font-bold leading-none ${isSuccess ? 'text-green-500' : isError ? 'text-red-500' : 'text-foreground'}`}>
                        {log.status === 0 ? 'FAIL' : log.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground/80 ml-auto uppercase tracking-wider">{log.type}</span>
                </div>
                <span className="text-xs text-foreground/80 truncate w-full font-mono" title={log.url}>{pathDisplay}</span>
            </div>
        </motion.div>
    );
}

export function NetworkToastOverlay() {
    const recentToasts = useNetworkStore(state => state.recentToasts);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {recentToasts.map(toast => (
                    <ToastItem key={toast.id} log={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
