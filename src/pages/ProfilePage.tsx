import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AchievementsWidget } from '../components/AchievementsWidget';
import { User, Shield, Key, Calendar, Cpu, Check, AlertCircle, ImageIcon, Upload } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || '');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 6);
  const [saved, setSaved] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 300;
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          updateProfile({ avatar: dataUrl });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    setIsMenuOpen(false);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      timezone,
      dailyGoal: Number(dailyGoal)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div id="profile-viewport" className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto text-left font-sans">
      
      {/* HEADER SECTION */}
      <div className="space-y-1.5 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
            <User size={16} />
          </div>
          <h2 className="font-sans font-bold text-lg md:text-xl text-zinc-100 uppercase tracking-wider">Operator File Identity</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-normal max-w-md">Sync, manage, and secure your authorized developer credentials and personal objectives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Left */}
        <div className="md:col-span-1 border border-zinc-900 bg-[#040407]/40 p-5 rounded-2xl flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
              className="relative cursor-pointer rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'} 
                alt={user?.name} 
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/30 p-1 bg-zinc-950"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1.5 w-48 z-10"
                >
                  <button 
                    type="button"
                    onClick={() => {
                      setIsViewingImage(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
                  >
                    <ImageIcon size={14} />
                    View Profile Image
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
                  >
                    <Upload size={14} />
                    Change Profile Image
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 justify-center">
              <h3 className="font-sans font-bold text-sm text-zinc-200">{user?.name}</h3>
              <span className="font-mono text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/30">
                {user?.tier}
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 block">{user?.email}</span>
          </div>

          <div className="w-full border-t border-zinc-900/60 pt-4 text-left space-y-3 font-mono text-[9px] text-zinc-500">
            <div className="flex justify-between">
              <span>SECURITY STATUS:</span>
              <span className="text-emerald-400">ENCRYPTED</span>
            </div>
            <div className="flex justify-between">
              <span>WORK STATION ID:</span>
              <span>4F2C91B860</span>
            </div>
          </div>
        </div>

        {/* Profile Editing Form Right */}
        <form onSubmit={handleProfileSubmit} className="md:col-span-2 border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="font-mono text-[10px] text-zinc-500 uppercase font-medium">EDIT IDENTITY PARAMETERS</span>
            {saved && (
              <span className="font-sans text-[10px] text-emerald-400 flex items-center gap-1">
                <Check size={12} />
                <span>Saved successfully</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Operator Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Daily Goal (Hours)</label>
                <input 
                  type="number" 
                  required
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Operating Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="UTC-7 (Pacific Standard Time)">UTC-7 (Pacific Standard Time)</option>
                  <option value="UTC+0 (Greenwich Mean Time)">UTC+0 (Greenwich Mean Time)</option>
                  <option value="UTC+5.5 (Indian Standard Time)">UTC+5.5 (Indian Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
          >
            Save Profile Identifiers
          </button>
        </form>
      </div>

      {/* Dynamic Achievements Widget rendering */}
      <div className="border border-zinc-900 bg-[#050508]/25 p-5 rounded-3xl mt-4">
        <AchievementsWidget />
      </div>

      <AnimatePresence>
        {isViewingImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsViewingImage(false)}
          >
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'}
              alt={user?.name}
              className="max-w-full max-h-full rounded-2xl object-contain border border-zinc-800"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
