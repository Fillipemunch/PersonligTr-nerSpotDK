
import React, { useState, useEffect, useRef } from 'react';
import { User, Plan, PTRequest, RequestStatus, ChatMessage } from '../types';
import { Button, Card, Input, Modal, FileUpload } from './Shared';

interface PTDashboardProps {
  user: User;
  t: any;
  clients: User[];
  requests: PTRequest[];
  plans: Plan[];
  messages: ChatMessage[];
  onAcceptClient: (reqId: string) => void;
  onRejectClient: (reqId: string) => void;
  onCreatePlan: (plan: Partial<Plan>) => void;
  onUpdateProfile: (data: Partial<User>) => void;
  onUpdateClient: (clientId: string, data: Partial<User>) => void;
  onSendMessage: (text: string, receiverId: string) => void;
}

const PTDashboard: React.FC<PTDashboardProps> = ({ user, t, clients, requests, plans, messages, onAcceptClient, onRejectClient, onCreatePlan, onUpdateProfile, onUpdateClient, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'content' | 'chat' | 'profile'>('overview');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Chat State
  const [selectedChatClient, setSelectedChatClient] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // New Plan State Form
  const [planForm, setPlanForm] = useState({
    title: '',
    workoutDay: 'Monday',
    workoutTitle: '',
    exercises: '', // Textarea input (line separated)
    dietTitle: '',
    dietFocus: '',
    meals: '' // Textarea input (line separated)
  });

  // Resource Creator State (Meal/Workout)
  const [resourceType, setResourceType] = useState<'meal' | 'workout'>('meal');
  const [resourceName, setResourceName] = useState('');
  const [resourceFile, setResourceFile] = useState<string | null>(null);

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    bio: user.bio || '',
    location: user.location || '',
    hourlyRate: user.hourlyRate || 0,
    specialties: user.specialties ? user.specialties.join(', ') : '',
    photoUrl: user.photoUrl || ''
  });

  // Client Notes State
  const [clientNotes, setClientNotes] = useState('');

  const myRequests = requests.filter(r => r.ptId === user.id && r.status === RequestStatus.PENDING);
  const myClients = clients.filter(c => c.activePtId === user.id);

  const selectedClientData = myClients.find(c => c.id === selectedClient);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, selectedChatClient, activeTab]);

  // Load client notes when selected client changes
  useEffect(() => {
    if (selectedClientData) {
        setClientNotes(selectedClientData.ptNotes || '');
    }
  }, [selectedClientData]);

  const handleCreatePlan = () => {
    if(!selectedClient) return;

    // Parse Text Areas into Arrays
    const exerciseList = planForm.exercises.split('\n').filter(line => line.trim() !== '');
    const mealList = planForm.meals.split('\n').filter(line => line.trim() !== '').map((m, i) => ({
        id: `meal_${Date.now()}_${i}`,
        name: m,
        calories: 0 // Default for MVP
    }));

    onCreatePlan({
        clientId: selectedClient,
        ptId: user.id,
        title: planForm.title || 'Custom Plan',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: 'active',
        workouts: [{ 
            id: Date.now().toString(), 
            dayOfWeek: planForm.workoutDay || 'Monday', 
            title: planForm.workoutTitle || 'Routine', 
            exercises: exerciseList.length > 0 ? exerciseList : ['Rest Day']
        }],
        diet: { 
            id: Date.now().toString(), 
            title: planForm.dietTitle || 'Nutrition Plan', 
            focus: planForm.dietFocus || 'General Health', 
            meals: mealList 
        }
    });
    
    setShowPlanModal(false);
    // Reset Form
    setPlanForm({
        title: '',
        workoutDay: 'Monday',
        workoutTitle: '',
        exercises: '',
        dietTitle: '',
        dietFocus: '',
        meals: ''
    });
    alert("Plan Assigned to Client!");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      bio: profileData.bio,
      location: profileData.location,
      hourlyRate: Number(profileData.hourlyRate),
      specialties: profileData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      photoUrl: profileData.photoUrl
    });
    alert(t.profileSaved);
  };

  const handleSaveClientNotes = () => {
    if (selectedClient) {
        onUpdateClient(selectedClient, { ptNotes: clientNotes });
        alert(t.notesSaved);
    }
  };

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Added ${resourceType === 'meal' ? 'Meal' : 'Workout'}: ${resourceName} with media attachment.`);
    setResourceName('');
    setResourceFile(null);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChatClient) return;
    onSendMessage(chatInput, selectedChatClient);
    setChatInput('');
  };

  // Filter messages for the selected chat conversation
  const activeConversation = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === selectedChatClient) || 
    (m.senderId === selectedChatClient && m.receiverId === user.id)
  ).sort((a,b) => a.timestamp - b.timestamp);

  const tabs = [
    { id: 'overview', label: t.overview },
    { id: 'clients', label: t.myClients },
    { id: 'content', label: t.content },
    { id: 'chat', label: t.chat },
    { id: 'profile', label: t.ptProfileTab }
  ];

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* 1. MOBILE NAVIGATION */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar border-b border-slate-700 mb-2 pb-2">
         <div className="flex space-x-4">
            {tabs.map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors border ${
                     activeTab === tab.id 
                     ? 'bg-brand-accent text-brand-dark border-brand-accent' 
                     : 'text-slate-400 border-slate-700 hover:bg-slate-800'
                   }`}
                 >
                   {tab.label}
                 </button>
            ))}
         </div>
      </div>

      {/* 2. DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-72 flex-shrink-0">
         <div className="sticky top-24">
            <Card className="p-3">
                <div className="flex flex-col gap-2">
                {tabs.map(tab => (
                    <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id ? 'bg-brand-accent text-brand-dark shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                    >
                    {tab.label}
                    </button>
                ))}
                </div>
            </Card>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-h-[80vh] items-start">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t.overview}</h2>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="text-center">
                 <div className="text-3xl font-bold text-brand-accent">{myClients.length}</div>
                 <div className="text-sm text-slate-400">Active Clients</div>
              </Card>
              <Card className="text-center">
                 <div className="text-3xl font-bold text-brand-highlight">{myRequests.length}</div>
                 <div className="text-sm text-slate-400">Pending Requests</div>
              </Card>
            </div>

            {/* Requests List */}
            {myRequests.length > 0 && (
              <Card>
                <h3 className="font-bold text-white mb-4">New Client Requests</h3>
                <div className="space-y-4">
                  {myRequests.map(req => {
                    const requester = clients.find(c => c.id === req.clientId);
                    return (
                      <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 p-4 rounded-lg gap-3">
                        <div>
                          <p className="font-semibold text-white">{requester ? requester.name : `Client ID: ${req.clientId.substring(0,8)}`}</p>
                          <p className="text-xs text-slate-500">Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                           <Button variant="secondary" onClick={() => onAcceptClient(req.id)} className="flex-1 sm:flex-none !px-3 !py-1 text-xs">{t.accept}</Button>
                           <Button variant="danger" onClick={() => onRejectClient(req.id)} className="flex-1 sm:flex-none !px-3 !py-1 text-xs">{t.reject}</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
            {myRequests.length === 0 && (
                 <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
                    No new requests pending.
                 </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.myClients}</h2>
            <div className="grid gap-4">
               {myClients.map(client => (
                 <Card key={client.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <img src={client.photoUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                      <div>
                        <h3 className="font-bold text-white">{client.name}</h3>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => { setSelectedClient(client.id); setActiveTab('content'); }}>
                      Manage
                    </Button>
                 </Card>
               ))}
               {myClients.length === 0 && <p className="text-slate-500">No active clients.</p>}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
           <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">{t.content}</h2>
              
              {!selectedClient ? (
                <div className="p-10 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
                  {t.selectClient} via the Clients tab.
                </div>
              ) : (
                <div className="animate-fade-in">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Managing:</span>
                        <div className="flex items-center gap-2">
                           <img src={selectedClientData?.photoUrl} className="w-8 h-8 rounded-full border border-brand-accent" />
                           <span className="text-brand-accent font-bold text-lg">{selectedClientData?.name}</span>
                        </div>
                      </div>
                      <Button onClick={() => setShowPlanModal(true)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                         + Create New Plan
                      </Button>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* CLIENT HEALTH DATA */}
                        <Card className="border-l-4 border-brand-accent bg-slate-800/80">
                            <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2 flex justify-between items-center">
                                <span>📊 Client Health Profile</span>
                                <span className="text-xs text-brand-accent font-normal">Read-only view</span>
                            </h3>
                            {selectedClientData?.healthData ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="bg-slate-900 p-2 rounded"><span className="block text-slate-500 text-xs uppercase">Weight</span><span className="text-white font-mono">{selectedClientData.healthData.weight || '--'} kg</span></div>
                                        <div className="bg-slate-900 p-2 rounded"><span className="block text-slate-500 text-xs uppercase">Height</span><span className="text-white font-mono">{selectedClientData.healthData.height || '--'} cm</span></div>
                                        <div className="bg-slate-900 p-2 rounded"><span className="block text-slate-500 text-xs uppercase">Level</span><span className="text-brand-highlight text-xs">{selectedClientData.healthData.fitnessLevel || '--'}</span></div>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded">
                                        <span className="block text-slate-500 text-xs uppercase mb-1">Goals</span>
                                        <p className="text-slate-300 text-sm line-clamp-3">{selectedClientData.healthData.goals || 'No goals stated.'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">This client has not filled out their health data yet.</p>
                            )}
                        </Card>

                        {/* PRIVATE NOTES SECTION */}
                        <Card className="border-l-4 border-yellow-500 bg-slate-800/80">
                            <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2 flex justify-between items-center">
                                <span>🔒 {t.privateNotes}</span>
                                <span className="text-xs text-yellow-500 font-normal">Internal Only</span>
                            </h3>
                            <div className="space-y-4">
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 min-h-[150px] text-sm"
                                    value={clientNotes}
                                    onChange={(e) => setClientNotes(e.target.value)}
                                    placeholder={t.notesPlaceholder}
                                />
                                <Button variant="secondary" onClick={handleSaveClientNotes} className="w-full !bg-yellow-600 hover:!bg-yellow-700 text-white">
                                    {t.saveNotes}
                                </Button>
                            </div>
                        </Card>
                   </div>
                   
                   {/* Quick Resource Creator */}
                   <Card className="mb-6 border-slate-600 opacity-75 hover:opacity-100 transition-opacity">
                      <h3 className="font-bold text-white mb-4">Quick Add: Library Resources</h3>
                      <form onSubmit={handleResourceSubmit} className="space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="resourceType" value="meal" checked={resourceType === 'meal'} onChange={() => setResourceType('meal')} />
                                <span className="text-slate-300 text-sm">Meal (Photo)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="resourceType" value="workout" checked={resourceType === 'workout'} onChange={() => setResourceType('workout')} />
                                <span className="text-slate-300 text-sm">Workout (Video)</span>
                            </label>
                        </div>
                        <Input placeholder="Resource Name (e.g. Chicken Salad)" value={resourceName} onChange={(e) => setResourceName(e.target.value)} required />
                        <FileUpload label={resourceType === 'meal' ? "Upload Meal Photo" : "Upload Workout Video"} accept={resourceType === 'meal' ? "image/*" : "video/*"} type={resourceType === 'meal' ? 'image' : 'video'} currentPreviewUrl={resourceFile || undefined} onFileSelect={(url) => setResourceFile(url)} />
                        <Button type="submit" variant="secondary" className="w-full">Add to Library</Button>
                      </form>
                   </Card>
                </div>
              )}
           </div>
        )}

        {/* TAB: CHAT (Real Time) */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
             {/* Left: Client List */}
             <div className="h-full flex flex-col">
               <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
                  <div className="bg-slate-900 p-4 border-b border-slate-700">
                    <h3 className="font-bold text-white">{t.myClients}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {myClients.length > 0 ? myClients.map(client => (
                        <button 
                          key={client.id}
                          onClick={() => setSelectedChatClient(client.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedChatClient === client.id ? 'bg-brand-accent/20 border border-brand-accent/50' : 'hover:bg-slate-800'}`}
                        >
                            <img src={client.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="text-left">
                                <p className={`font-medium ${selectedChatClient === client.id ? 'text-white' : 'text-slate-300'}`}>{client.name}</p>
                                <p className="text-xs text-slate-500 truncate">Tap to chat</p>
                            </div>
                        </button>
                    )) : <p className="text-slate-500 p-4 text-center">No active clients yet.</p>}
                  </div>
               </Card>
             </div>

             {/* Right: Chat Window */}
             <div className="lg:col-span-2 h-full flex flex-col">
               <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
                  {selectedChatClient ? (
                    <>
                        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                Chatting with <span className="text-brand-accent">{myClients.find(c => c.id === selectedChatClient)?.name}</span>
                            </h3>
                        </div>
                        
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                            {activeConversation.length > 0 ? activeConversation.map(msg => {
                                const isMe = msg.senderId === user.id;
                                return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-brand-accent text-brand-dark rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                                    {msg.body}
                                    </div>
                                </div>
                                )
                            }) : <p className="text-center text-slate-500 mt-10">Start the conversation...</p>}
                        </div>

                        <div className="p-4 bg-slate-900 border-t border-slate-700">
                            <form onSubmit={handleSendChatMessage} className="flex gap-2">
                                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." />
                                <Button type="submit" disabled={!chatInput.trim()}>Send</Button>
                            </form>
                        </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 p-10 text-center">
                        <div>
                            <p className="text-4xl mb-4">💬</p>
                            <p>Select a client from the list to start chatting.</p>
                        </div>
                    </div>
                  )}
               </Card>
             </div>
          </div>
        )}

        {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">{t.ptProfileTab}</h2>
                <Card>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 border-b border-slate-700 pb-6">
                        <div className="shrink-0">
                             <div className="w-32 h-32 mb-2">
                                <img src={profileData.photoUrl || user.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-brand-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
                             </div>
                             <FileUpload label={t.uploadPhoto} accept="image/*" onFileSelect={(url) => setProfileData({...profileData, photoUrl: url})} />
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="text-xl font-bold text-white">{user.name}</h3>
                            <p className="text-brand-accent">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-brand-highlight/10 text-brand-highlight text-xs rounded-full border border-brand-highlight/20">Personal Trainer</span>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div><label className="block text-slate-400 text-sm mb-2">{t.bio}</label><textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent min-h-[120px]" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder={t.bioPlaceholder} required /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-slate-400 text-sm mb-2">{t.location}</label><Input value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} required /></div>
                            <div><label className="block text-slate-400 text-sm mb-2">{t.rate}</label><Input type="number" value={profileData.hourlyRate} onChange={e => setProfileData({...profileData, hourlyRate: Number(e.target.value)})} required /></div>
                        </div>
                        <div><label className="block text-slate-400 text-sm mb-2">{t.specialties}</label><Input value={profileData.specialties} onChange={e => setProfileData({...profileData, specialties: e.target.value})} /></div>
                        <div className="pt-4 flex justify-end"><Button type="submit" className="w-full md:w-auto text-lg shadow-lg shadow-brand-accent/20">{t.saveProfile}</Button></div>
                    </form>
                </Card>
            </div>
        )}
      </main>

      {/* PLAN CREATION MODAL */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Create Custom Plan">
         <div className="space-y-6">
            
            {/* General */}
            <div>
                <label className="text-sm text-brand-accent font-bold uppercase tracking-wide mb-1 block">General Plan Info</label>
                <Input value={planForm.title} onChange={e => setPlanForm({...planForm, title: e.target.value})} placeholder="Plan Title (e.g. Summer Shred)" />
            </div>

            <div className="h-px bg-slate-700 my-4"></div>

            {/* Workout Section */}
            <div className="bg-slate-800/50 p-3 rounded-lg">
                <label className="text-sm text-brand-accent font-bold uppercase tracking-wide mb-2 block">🏋️ Workout Routine</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input value={planForm.workoutDay} onChange={e => setPlanForm({...planForm, workoutDay: e.target.value})} placeholder="Day (e.g. Mon/Wed/Fri)" />
                    <Input value={planForm.workoutTitle} onChange={e => setPlanForm({...planForm, workoutTitle: e.target.value})} placeholder="Focus (e.g. Upper Body)" />
                </div>
                <label className="text-xs text-slate-400 mb-1 block">Exercises (One per line):</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-accent min-h-[100px] text-sm font-mono"
                    value={planForm.exercises} 
                    onChange={e => setPlanForm({...planForm, exercises: e.target.value})} 
                    placeholder="Bench Press 3x10&#10;Incline Fly 3x12&#10;Tricep Pushdown 3x15"
                />
            </div>

            {/* Diet Section */}
            <div className="bg-slate-800/50 p-3 rounded-lg">
                <label className="text-sm text-brand-highlight font-bold uppercase tracking-wide mb-2 block">🥗 Diet Plan</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input value={planForm.dietTitle} onChange={e => setPlanForm({...planForm, dietTitle: e.target.value})} placeholder="Diet Name (e.g. Keto)" />
                    <Input value={planForm.dietFocus} onChange={e => setPlanForm({...planForm, dietFocus: e.target.value})} placeholder="Goal (e.g. Fat Loss)" />
                </div>
                <label className="text-xs text-slate-400 mb-1 block">Meals (One per line):</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-highlight min-h-[100px] text-sm font-mono"
                    value={planForm.meals} 
                    onChange={e => setPlanForm({...planForm, meals: e.target.value})} 
                    placeholder="Breakfast: Oatmeal & Eggs&#10;Lunch: Chicken Salad&#10;Dinner: Salmon & Asparagus"
                />
            </div>

            <Button className="w-full py-3 bg-brand-accent text-brand-dark font-bold hover:bg-cyan-300" onClick={handleCreatePlan}>Assign Plan to Client</Button>
         </div>
      </Modal>
    </div>
  );
};

export default PTDashboard;
