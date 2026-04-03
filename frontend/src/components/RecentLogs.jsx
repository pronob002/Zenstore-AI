import { Clock, Activity } from 'lucide-react';

export default function RecentLogs({ logs }) {
    // Take only the 5 most recent logs
    const latestLogs = logs.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={16} className="text-blue-500"/> Latest Activity
            </h3>
            
            <div className="space-y-4 flex-1">
                {latestLogs.length === 0 ? (
                    <div className="text-slate-400 text-sm italic text-center py-4">No recent activity</div>
                ) : (
                    latestLogs.map((log, i) => {
                        // Extract time from the log string e.g., "[17:45:16]"
                        const timeMatch = log.match(/\[(.*?)\]/);
                        const time = timeMatch ? timeMatch[1] : '';
                        const message = log.replace(/\[.*?\] /, '');
                        
                        const isError = message.toLowerCase().includes('error');
                        const isSuccess = message.toLowerCase().includes('success');

                        return (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="mt-1 flex-shrink-0">
                                    <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : isSuccess ? 'bg-emerald-500' : 'bg-blue-400'}`}></div>
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${isError ? 'text-red-600' : 'text-slate-700'} line-clamp-2 leading-snug`}>
                                        {message}
                                    </p>
                                    {time && (
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Clock size={10} /> {time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}