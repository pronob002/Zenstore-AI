import { useEffect, useRef } from 'react';

export default function LiveLogs({ logs }) {
    const logsEndRef = useRef(null);
    const containerRef = useRef(null);

    // Guaranteed auto-scroll to bottom whenever logs change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    // Reverse logs so the oldest is at the top, newest at the bottom for the terminal view
    const terminalLogs = [...logs].reverse();

    return (
        <div className="bg-[#0D1117] rounded-2xl shadow-xl border border-slate-800 flex flex-col h-64 overflow-hidden">
            <div className="bg-[#161B22] px-4 py-2.5 flex items-center gap-2 border-b border-slate-800 flex-shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-4 text-xs font-mono text-slate-500 font-semibold tracking-wider">SYSTEM_TERMINAL</span>
            </div>
            
            <div 
                ref={containerRef}
                className="p-4 overflow-y-auto flex-1 font-mono text-sm space-y-1.5 scroll-smooth"
            >
                {terminalLogs.length === 0 && <div className="text-slate-500 italic">Waiting for backend activity...</div>}
                {terminalLogs.map((log, i) => (
                    <div key={i} className={`flex gap-3 ${
                        log.toLowerCase().includes('error') ? 'text-red-400' : 
                        log.toLowerCase().includes('success') ? 'text-emerald-400' : 
                        log.toLowerCase().includes('redis') ? 'text-purple-400' : 'text-slate-300'
                    }`}>
                        <span className="text-slate-600 select-none">❯</span>
                        <span className="break-all">{log}</span>
                    </div>
                ))}
                {/* Dummy div to scroll to */}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}