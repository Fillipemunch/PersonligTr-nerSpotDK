
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Plan, ChatMessage, FitnessLevel, ClientHealthData, UserRole, PTRequest, RequestStatus } from '../types';
import { Button, Card, Input, FileUpload } from './Shared';

interface ClientDashboardProps {
  user: User;
  t: any;
  allPTs: User[];
  plans: Plan[];
  requests: PTRequest[];
  messages: ChatMessage[];
  onRequestPT: (ptId: string) => void;
  onSendMessage: (text: string, receiverId: string) => void;
  onUpdateProfile: (data: Partial<User>) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, t, allPTs, plans, requests, messages, onRequestPT, onSendMessage, onUpdateProfile }) => {
  // Navigation Logic
  const hasActivePT = !!user.activePtId;
  
  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'chat' | 'search' | 'profile'>(hasActivePT ? 'workout' : 'search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [chatInput, setChatInput] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [healthData, setHealthData] = useState<ClientHealthData>(user.healthData || {});
  const [tempPhotoUrl, setTempPhotoUrl] = useState(user.photoUrl || '');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.healthData) {
        setHealthData(user.healthData);
    }
    setTempPhotoUrl(user.photoUrl || '');
    if (user.activePtId && activeTab === 'search') {
        setActiveTab('chat');
    }
  }, [user, user.activePtId]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(allPTs.filter(u => u.role === UserRole.PT).map(pt => pt.location).filter(Boolean))) as string[];
  }, [allPTs]);

  const uniqueSpecialties = useMemo(() => {
    const specs = allPTs.filter(u => u.role === UserRole.PT).flatMap(pt => pt.specialties || []);
    return Array.from(new Set(specs));
  }, [allPTs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user.activePtId) return;

    // Send Real Message to Active PT
    onSendMessage(chatInput, user.activePtId);
    setChatInput('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ 
        healthData,
        photoUrl: tempPhotoUrl 
    });
    setIsEditingProfile(false);
  };

  const toggleEditProfile = () => {
    if (isEditingProfile) {
        setHealthData(user.healthData || {});
        setTempPhotoUrl(user.photoUrl || '');
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const filteredPTs = allPTs.filter(pt => {
    if (pt.role !== UserRole.PT) return false;
    if (pt.id === user.id) return false;
    const matchesName = pt.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation ? pt.location === selectedLocation : true;
    const matchesSpecialty = selectedSpecialty ? pt.specialties?.includes(selectedSpecialty) : true;
    return matchesName && matchesLocation && matchesSpecialty;
  });

  const activePlan = plans.find(p => p.clientId === user.id && p.status === 'active');
  const activeTrainer = allPTs.find(u => u.id === user.activePtId);

  // ALWAYS Show Workout and Diet Tabs, plus dynamic Search/Chat
  const tabs = [
    { 
      id: hasActivePT ? 'chat' : 'search', 
      label: hasActivePT ? t.myTrainer : t.findPt 
    },
    { id: 'workout', label: t.workoutTab },
    { id: 'diet', label: t.dietTab },
    { id: 'profile', label: t.myProfile }
  ];

  const getRequestStatus = (ptId: string) => {
    if (user.activePtId === ptId) return 'ACTIVE';
    const req = requests.find(r => r.ptId === ptId && r.clientId === user.id && r.status === RequestStatus.PENDING);
    if (req) return 'PENDING';
    const rejected = requests.find(r => r.ptId === ptId && r.clientId === user.id && r.status === RequestStatus.REJECTED);
    if (rejected) return 'REJECTED';
    return 'NONE';
  };

  // Helper for Locked State
  const LockedState = () => (
    <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 animate-fade-in">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-white mb-2">Feature Locked</h3>
        <p className="text-slate-400 mb-6">Find and connect with a Personal Trainer to unlock your custom plans.</p>
        <Button onClick={() => setActiveTab('search')}>
            {t.findPt}
        </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {t.welcome}, <span className="text-brand-accent">{user.name}</span>
        </h1>
        <p className="text-slate-400 mt-2">Here is your fitness overview.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-700 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id 
                ? 'text-brand-accent border-brand-accent' 
                : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        
        {/* TAB: WORKOUT */}
        {activeTab === 'workout' && (
          hasActivePT ? (
             <div>
                <h2 className="text-2xl font-bold text-white mb-6">{t.workoutTab}</h2>
                {activePlan && activePlan.workouts.length > 0 ? (
                    <Card>
                        <h3 className="text-xl font-bold text-brand-accent mb-4">🏋️ {activePlan.title}</h3>
                        <div className="space-y-4">
                            {activePlan.workouts.map(w => (
                            <div key={w.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-white text-lg">{w.dayOfWeek}</span>
                                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">{w.title}</span>
                                </div>
                                <div className="h-px bg-slate-800 my-2"></div>
                                <ul className="space-y-2">
                                {w.exercises.map((ex, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                                        {ex}
                                    </li>
                                ))}
                                </ul>
                                {w.mediaLink && (
                                <a href={w.mediaLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-xs text-brand-highlight hover:underline">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    Watch Video Guide
                                </a>
                                )}
                            </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <p className="text-slate-400 mb-2 text-lg">{t.workoutPlaceholder}</p>
                    <p className="text-sm text-slate-500">Waiting for {activeTrainer?.name} to assign a plan.</p>
                </div>
                )}
             </div>
          ) : <LockedState />
        )}

        {/* TAB: DIET */}
        {activeTab === 'diet' && (
           hasActivePT ? (
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">{t.dietTab}</h2>
                {activePlan && activePlan.diet ? (
                    <Card>
                    <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-brand-highlight">🥗 {activePlan.diet.title}</h3>
                            <span className="text-xs uppercase bg-slate-900 px-3 py-1 rounded text-slate-400 tracking-wider">Focus: {activePlan.diet.focus}</span>
                    </div>
                    <div className="space-y-4">
                        {activePlan.diet.meals.map(m => (
                            <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="w-full sm:w-20 sm:h-20 h-40 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden relative group">
                                {m.photoUrl ? (
                                    <img src={m.photoUrl} className="w-full h-full object-cover" alt={m.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">🍎</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-lg">{m.name}</h4>
                                <p className="text-sm text-brand-accent font-mono mt-1">{m.calories} kcal</p>
                            </div>
                            </div>
                        ))}
                    </div>
                    </Card>
                ) : (
                <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <p className="text-slate-400 mb-2 text-lg">{t.dietPlaceholder}</p>
                    <p className="text-sm text-slate-500">Waiting for {activeTrainer?.name} to assign a plan.</p>
                </div>
                )}
            </div>
           ) : <LockedState />
        )}

        {/* TAB: CHAT (Active PT) */}
        {activeTab === 'chat' && hasActivePT && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
             <div className="hidden lg:block">
               <Card className="h-full">
                  <div className="flex flex-col items-center text-center">
                    <img src={activeTrainer?.photoUrl} alt={activeTrainer?.name} className="w-32 h-32 rounded-full border-4 border-brand-accent mb-4 object-cover" />
                    <h3 className="text-xl font-bold text-white">{activeTrainer?.name}</h3>
                    <p className="text-brand-accent text-sm mb-2">{activeTrainer?.location}</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {activeTrainer?.specialties?.map(s => (
                        <span key={s} className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">{s}</span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 text-left w-full mt-4 p-3 bg-slate-900 rounded-lg">{activeTrainer?.bio}</p>
                  </div>
               </Card>
             </div>

             <div className="lg:col-span-2 h-full flex flex-col">
               <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
                  <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <span className="lg:hidden text-xs bg-brand-accent text-brand-dark px-2 py-0.5 rounded">{activeTrainer?.name}</span>
                      Chat
                    </h3>
                    <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>Online</span>
                  </div>
                  
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                     {messages.length > 0 ? messages.map(msg => {
                         const isMe = msg.senderId === user.id;
                         return (
                           <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-brand-accent text-brand-dark rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                               {msg.body}
                             </div>
                           </div>
                         )
                       }) : <p className="text-center text-slate-500 mt-10">{t.noMessages}</p>
                     }
                  </div>

                  <div className="p-4 bg-slate-900 border-t border-slate-700">
                     <form onSubmit={handleSend} className="flex gap-2">
                       <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t.typeMessage} />
                       <Button type="submit" disabled={!chatInput.trim()}>{t.sendMessage}</Button>
                     </form>
                  </div>
               </Card>
             </div>
          </div>
        )}

        {/* TAB: SEARCH (No PT) */}
        {activeTab === 'search' && !hasActivePT && (
          <div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder={t.filterName} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <div className="relative">
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent appearance-none" value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
                  <option value="">{t.allLocations}</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
              <div className="relative">
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent appearance-none" value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}>
                  <option value="">{t.allSpecialties}</option>
                  {uniqueSpecialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPTs.length > 0 ? (
                filteredPTs.map(pt => {
                  const reqStatus = getRequestStatus(pt.id);
                  const isPending = reqStatus === 'PENDING';
                  const isRejected = reqStatus === 'REJECTED';

                  return (
                    <Card key={pt.id} className="flex flex-col h-full hover:border-brand-accent/50 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={pt.photoUrl} className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent shadow-[0_0_10px_rgba(34,211,238,0.2)]" alt={pt.name} />
                        <div>
                          <h3 className="font-bold text-white text-lg">{pt.name}</h3>
                          <p className="text-xs text-brand-accent uppercase font-bold tracking-wide">{pt.location}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {pt.specialties?.map(s => (
                            <span key={s} className="text-[10px] bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600">{s}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3 italic">"{pt.bio || 'Professional trainer ready to help you.'}"</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                        <span className="font-bold text-white">{pt.hourlyRate} DKK<span className="text-xs font-normal text-slate-500">/hr</span></span>
                        <Button 
                          variant={isRejected ? "danger" : "secondary"} 
                          onClick={() => !isPending && !isRejected && onRequestPT(pt.id)} 
                          disabled={isPending || isRejected}
                          className="!py-1.5 !px-4 text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? t.pending : isRejected ? t.rejected : t.requestCoach}
                        </Button>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-slate-500 py-20 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                  <p>No Personal Trainers found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
             <Card>
                <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                  <h2 className="text-2xl font-bold text-white">{t.healthData}</h2>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-xs text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full">{t.visibleToPt}</span>
                    {!isEditingProfile && (
                        <Button variant="outline" onClick={toggleEditProfile} className="!px-4 !py-1 text-sm">{t.editData}</Button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center mb-8">
                     <div className="relative">
                         <img 
                            src={isEditingProfile ? tempPhotoUrl || user.photoUrl : user.photoUrl} 
                            alt="Profile" 
                            className="w-28 h-28 rounded-full border-4 border-brand-accent object-cover shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                         />
                         {isEditingProfile && (
                             <div className="mt-4 flex justify-center">
                                <FileUpload label="Change Photo" accept="image/*" onFileSelect={(url) => setTempPhotoUrl(url)} />
                             </div>
                         )}
                     </div>
                </div>

                {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">{t.weight}</label>
                                <Input type="number" value={healthData.weight || ''} onChange={e => setHealthData({...healthData, weight: parseFloat(e.target.value)})} placeholder="75" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">{t.height}</label>
                                <Input type="number" value={healthData.height || ''} onChange={e => setHealthData({...healthData, height: parseFloat(e.target.value)})} placeholder="180" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">{t.fitnessLevel}</label>
                            <div className="relative">
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent appearance-none" value={healthData.fitnessLevel || FitnessLevel.BEGINNER} onChange={e => setHealthData({...healthData, fitnessLevel: e.target.value as FitnessLevel})}>
                                    <option value={FitnessLevel.BEGINNER}>{t.beginner}</option>
                                    <option value={FitnessLevel.INTERMEDIATE}>{t.intermediate}</option>
                                    <option value={FitnessLevel.ADVANCED}>{t.advanced}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">{t.fitnessGoals}</label>
                            <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent min-h-[100px]" value={healthData.goals || ''} onChange={e => setHealthData({...healthData, goals: e.target.value})} placeholder="e.g., Lose 5kg..." />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">{t.medicalHistory}</label>
                            <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent min-h-[80px]" value={healthData.medicalHistory || ''} onChange={e => setHealthData({...healthData, medicalHistory: e.target.value})} placeholder="Any conditions..." />
                        </div>
                        <div className="pt-4 flex gap-4">
                            <Button type="button" variant="outline" onClick={toggleEditProfile} className="flex-1 py-3 text-lg">{t.cancel}</Button>
                            <Button type="submit" className="flex-1 py-3 text-lg shadow-lg shadow-brand-accent/20">{t.saveData}</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">{t.weight}</span>
                                <span className="text-2xl font-mono text-white">{user.healthData?.weight || '--'} kg</span>
                             </div>
                             <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">{t.height}</span>
                                <span className="text-2xl font-mono text-white">{user.healthData?.height || '--'} cm</span>
                             </div>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                             <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">{t.fitnessLevel}</span>
                             <span className="text-xl text-brand-highlight">{user.healthData?.fitnessLevel || 'Not set'}</span>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                             <span className="block text-slate-500 text-xs uppercase tracking-wider mb-2">{t.fitnessGoals}</span>
                             <p className="text-slate-300 leading-relaxed">{user.healthData?.goals || <span className="text-slate-600 italic">No goals defined yet.</span>}</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                             <span className="block text-slate-500 text-xs uppercase tracking-wider mb-2">{t.medicalHistory}</span>
                             <p className="text-slate-300 leading-relaxed">{user.healthData?.medicalHistory || <span className="text-slate-600 italic">None reported.</span>}</p>
                        </div>
                    </div>
                )}
             </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
