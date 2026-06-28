import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  User, 
  Bell, 
  Sliders, 
  Lock, 
  Calendar, 
  Cpu, 
  Check, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    notificationPermission, 
    requestNotificationPermission, 
    sendDesktopNotification,
    aiPersonality,
    setAiPersonality
  } = useApp();

  const [notifSound, setNotifSound] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [autoRescue, setAutoRescue] = useState(false);
  const [sensitivity, setSensitivity] = useState('medium');
  const [calSynced, setCalSynced] = useState(true);
  const [gitSynced, setGitSynced] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'workspace'>('general');

  return (
    <div id="settings-viewport" className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto text-left font-sans">
      
      {/* HEADER SECTION */}
      <div className="space-y-1.5 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
            <Settings size={16} />
          </div>
          <h2 className="font-sans font-bold text-lg md:text-xl text-zinc-100 uppercase tracking-wider">OS Configurations</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-normal max-w-md">Configure your local security keys, AI thresholds, and background workspace synchronization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Navigation Menu Left */}
        <div className="md:col-span-1 space-y-1 bg-[#040407]/40 border border-zinc-900 p-3 rounded-2xl h-fit">
          <span className="font-mono text-[9px] text-zinc-500 block px-3 py-1 uppercase tracking-wider mb-2">SETTINGS CONTEXTS</span>
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-3 py-2 font-sans text-xs rounded-lg transition-colors ${
              activeTab === 'general' 
                ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            General Preferences
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left px-3 py-2 font-sans text-xs rounded-lg transition-colors ${
              activeTab === 'ai' 
                ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            AI Engine Thresholds
          </button>
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`w-full text-left px-3 py-2 font-sans text-xs rounded-lg transition-colors ${
              activeTab === 'workspace' 
                ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            Workspace Integrations
          </button>
        </div>

        {/* Configurations Forms Right */}
        <div className="md:col-span-2 space-y-6">
          
          {/* General Preferences */}
          {activeTab === 'general' && (
            <div className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Bell size={14} className="text-amber-400" />
                <h3 className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">Desktop Notification Service</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-300 block">System-Level Desktop Alerts</span>
                    <span className="text-[11px] text-zinc-500 block leading-relaxed">
                      Get instant banners on task completion, scheduling optimizations, and focus session completions even when in the background.
                    </span>
                    <span className="text-[10px] font-mono mt-1 block">
                      CURRENT STATUS:{' '}
                      {notificationPermission === 'granted' ? (
                        <span className="text-emerald-400">GRANTED • ACTIVE</span>
                      ) : notificationPermission === 'denied' ? (
                        <span className="text-rose-400">DENIED • BLOCKED BY BROWSER</span>
                      ) : (
                        <span className="text-amber-400">PENDING REQUEST</span>
                      )}
                    </span>
                  </div>
                  <div>
                    {notificationPermission === 'granted' ? (
                      <button
                        onClick={() => sendDesktopNotification('Test Notification 🧪', { body: 'Desktop notification channel is fully active!' })}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] px-3.5 py-2 rounded-lg transition-colors cursor-pointer font-medium font-sans whitespace-nowrap"
                      >
                        Send Test Alert
                      </button>
                    ) : (
                      <button
                        onClick={requestNotificationPermission}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-[11px] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI Settings Section */}
          {activeTab === 'ai' && (
            <div className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Cpu size={14} className="text-purple-400" />
              <h3 className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">AI Engine Thresholds</h3>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-300 block">Automated Backlog Rescue Triage</span>
                  <span className="text-[11px] text-zinc-500">Auto-triage non-critical backlog when compliance score slips below 50%.</span>
                </div>
                <button 
                  onClick={() => setAutoRescue(!autoRescue)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {autoRescue ? (
                    <ToggleRight size={28} className="text-blue-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-zinc-700" />
                  )}
                </button>
              </div>

              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase">RESCUE MODE OVERRIDE SENSITIVITY</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSensitivity(level)}
                      className={`flex-1 font-mono text-[10px] py-1.5 px-3 rounded-lg border uppercase transition-all ${
                        sensitivity === level
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                          : 'bg-zinc-950/60 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Personality Selector */}
              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <label className="block font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-wider">AI Cockpit Personality Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'professional', label: 'Professional', desc: 'Analytical, metrics-driven' },
                    { id: 'friendly', label: 'Friendly', desc: 'Encouraging, supportive' },
                    { id: 'motivational', label: 'Motivational', desc: 'Energetic, urgent focus' },
                    { id: 'roast', label: 'Roast Mode 🔥', desc: 'Sarcastic, direct audit' }
                  ].map((pStyle) => (
                    <button
                      key={pStyle.id}
                      type="button"
                      onClick={() => setAiPersonality(pStyle.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        aiPersonality === pStyle.id 
                          ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                          : 'bg-[#050508]/40 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold block">{pStyle.label}</span>
                      <span className="text-[8px] text-zinc-500 font-mono block leading-tight mt-0.5 uppercase">{pStyle.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Integration Sync settings */}
          {activeTab === 'workspace' && (
            <div className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Calendar size={14} className="text-blue-400" />
                <h3 className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">Workspace Sync</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-xl">
                  <div>
                    <span className="font-semibold text-zinc-200 block">Google Calendar Sync</span>
                    <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">CONNECTED • READY</span>
                  </div>
                  <button 
                    onClick={() => setCalSynced(!calSynced)}
                    className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {calSynced ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-xl">
                  <div>
                    <span className="font-semibold text-zinc-200 block">GitHub Webhooks Activity Stream</span>
                    <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">DISCONNECTED</span>
                  </div>
                  <button 
                    onClick={() => setGitSynced(!gitSynced)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {gitSynced ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
