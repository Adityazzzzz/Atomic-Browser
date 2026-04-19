"use client";

import { useNetworkStore } from '@/store/useNetworkStore';
import { Network, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function NetworkDevTools() {
    const { logs, isOpen, toggleDevTools, clearLogs } = useNetworkStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    className="absolute bottom-0 left-0 right-0 h-80 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-20px_50px_rgba(0,0,0,0.3)] z-50 flex flex-col font-mono text-xs"
                >
                    <div className="flex items-center justify-between p-2 border-b border-border/50 bg-muted/50">
                        <div className="flex items-center gap-3 px-2 text-muted-foreground">
                            <Network className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-sm uppercase tracking-widest text-primary/80">Network Intercept</h3>
                            <div className="px-2 py-0.5 bg-background border border-border rounded text-[10px]">
                                {logs.length} Requests Found
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={clearLogs} className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={toggleDevTools} className="h-7 w-7 text-muted-foreground">
                                <ChevronDown className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-card custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-muted/90 backdrop-blur-md shadow-sm z-10 border-b border-border/50">
                                <tr>
                                    <th className="p-2.5 font-semibold w-20 text-center">Status</th>
                                    <th className="p-2.5 font-semibold w-20">Method</th>
                                    <th className="p-2.5 font-semibold">Resource Allocation Path</th>
                                    <th className="p-2.5 font-semibold w-24 text-right">Time</th>
                                    <th className="p-2.5 font-semibold w-24 text-center">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    let statusColor = 'text-muted-foreground';
                                    if (log.status) {
                                        if (log.status >= 200 && log.status < 300) statusColor = 'text-green-500';
                                        else if (log.status >= 300 && log.status < 400) statusColor = 'text-yellow-500';
                                        else if (log.status >= 400) statusColor = 'text-destructive';
                                    }

                                    let pathDisplay = log.url;
                                    try {
                                        const urlObj = new URL(log.url.startsWith('/') ? 'http://l' + log.url : log.url);
                                        pathDisplay = urlObj.pathname + urlObj.search;
                                    } catch(e){}

                                    return (
                                        <tr key={log.id} className="border-b border-border/10 hover:bg-muted/40 transition-colors">
                                            <td className={`p-2.5 text-center font-bold flex items-center justify-center gap-2 ${statusColor}`}>
                                                <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')}`} />
                                                {log.status === 0 ? 'ERR' : (log.status || '...')}
                                            </td>
                                            <td className="p-2.5 font-bold text-primary/70">{log.method}</td>
                                            <td className="p-2.5 truncate max-w-lg text-foreground/80 cursor-default" title={log.url}>
                                                {pathDisplay}
                                            </td>
                                            <td className="p-2.5 text-right text-muted-foreground/80">{log.latencyMs ? `${log.latencyMs}ms` : 'Pending'}</td>
                                            <td className="p-2.5 text-center text-[10px] uppercase text-muted-foreground tracking-wider">{log.type}</td>
                                        </tr>
                                    );
                                })}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground/50 text-sm">
                                            Recording browser activity loop... perform a proxy navigation search to intercept telemetry.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
