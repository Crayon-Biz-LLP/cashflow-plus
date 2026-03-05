"use client";

import React, { useState, useEffect } from "react";
import { api, fetchWithAuth } from "@/lib/api";
import { AlertCircle, Bell, X, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: "medium" | "high" | "critical";
}

export default function TimelineAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const data = await fetchWithAuth("/notifications/alerts");
                if (Array.isArray(data) && data.length > 0) {
                    // Show only new alerts or just show them once per session
                    setAlerts(data);
                    setVisibleAlerts(data.slice(0, 3)); // Show first 3
                }
            } catch (error) {
                console.error("Failed to check alerts:", error);
            }
        };

        checkAlerts();
        const interval = setInterval(checkAlerts, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const removeAlert = (id: string) => {
        setVisibleAlerts(prev => prev.filter(a => a.id !== id));
    };

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
            <AnimatePresence>
                {visibleAlerts.map((alert) => (
                    <motion.div
                        key={`${alert.id}-${alert.title}`}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="glass-card overflow-hidden shadow-2xl relative"
                        style={{
                            borderLeft: `4px solid ${alert.priority === 'critical' ? 'var(--danger)' :
                                    alert.priority === 'high' ? 'var(--warning)' :
                                        'var(--info)'
                                }`,
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)"
                        }}
                    >
                        <div className="p-4 flex gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${alert.priority === 'critical' ? 'bg-red-50 text-red-600' :
                                    alert.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                                        'bg-blue-50 text-blue-600'
                                }`}>
                                {alert.priority === 'critical' ? <AlertCircle size={18} /> : <Bell size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{alert.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                    {alert.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeAlert(alert.id)}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors self-start"
                            >
                                <X size={14} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="h-1 bg-gray-100 w-full overflow-hidden">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 10, ease: "linear" }}
                                onAnimationComplete={() => removeAlert(alert.id)}
                                className={`h-full ${alert.priority === 'critical' ? 'bg-red-500' :
                                        alert.priority === 'high' ? 'bg-orange-500' :
                                            'bg-blue-500'
                                    }`}
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
