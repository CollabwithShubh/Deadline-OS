import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, ChevronDown, ChevronUp, Cpu, Activity, RefreshCw } from 'lucide-react';

interface AIExplainabilityCardProps {
  topic: string;
  details: string;
  className?: string;
}

export const AIExplainabilityCard: React.FC<AIExplainabilityCardProps> = ({ topic, details, className = '' }) => {
  const { apiFetch, aiPersonality } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    factors: { name: string; importance: string; description: string }[];
    alternativeDecisions: string[];
    expectedOutcome: string;
    tradeOffs: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    if (explanation) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          details,
          personality: aiPersonality
        })
      });
      if (res.success) {
        setExplanation(res);
      } else {
        throw new Error('Failed to compile explanation');
      }
    } catch (err: any) {
      console.error('Explanation fetch error:', err);
      setError(err.message || 'Cognitive link error');
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchExplanation();
    }
  };

  return (
    <div className={`font-sans ${className}`}>
      <button
        onClick={toggleOpen}
        className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded transition-all cursor-pointer select-none"
      >
        <HelpCircle size={10} className="animate-pulse" />
        <span>WHY?</span>
        {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-[#07070a] border border-blue-500/15 rounded-xl text-[11px] text-zinc-300 space-y-2.5 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-blue-500/5 blur-[30px] rounded-full pointer-events-none" />
          
          {loading && (
            <div className="flex items-center gap-2 py-2 text-zinc-400 font-mono text-[10px]">
              <RefreshCw size={12} className="animate-spin text-blue-400" />
              <span>RETRIEVING COGNITIVE REASONING...</span>
            </div>
          )}

          {error && (
            <div className="text-zinc-500 font-sans text-xs italic text-center py-2">
              Explanation temporarily unavailable. Please try again later.
            </div>
          )}

          {!loading && !error && explanation && (
            <div className="space-y-3 relative z-10">
              {/* Factors Considered */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <Cpu size={10} className="text-blue-400" />
                  <span>Factors Considered</span>
                </div>
                <div className="space-y-1.5 pl-1">
                  {explanation.factors.map((f, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="font-semibold text-zinc-200">{f.name}</span>{' '}
                      <span className={`text-[9px] px-1 rounded font-mono ${
                        f.importance === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        f.importance === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-900 text-zinc-500'
                      }`}>
                        {f.importance}
                      </span>
                      <p className="text-[10px] text-zinc-400">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade-offs */}
              {explanation.tradeOffs && explanation.tradeOffs.length > 0 && (
                <div className="space-y-1 border-t border-zinc-900 pt-2">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Decision Trade-offs</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400 text-[10px]">
                    {explanation.tradeOffs.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {explanation.alternativeDecisions && explanation.alternativeDecisions.length > 0 && (
                <div className="space-y-1 border-t border-zinc-900 pt-2">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Alternatives Rejected</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {explanation.alternativeDecisions.map((a, i) => (
                      <span key={i} className="bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Outcome */}
              <div className="space-y-0.5 border-t border-zinc-900 pt-2">
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  <Activity size={10} />
                  <span>Expected Outcome</span>
                </div>
                <p className="text-zinc-300 italic pl-1 text-[10px] leading-relaxed">
                  "{explanation.expectedOutcome}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
