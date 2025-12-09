
import React, { useState, useEffect } from 'react';
import { User, UserRole, Language, Plan, PTRequest, RequestStatus, ChatMessage } from './types';
import { MOCK_USERS, TRANSLATIONS } from './constants';
import { Navbar, Footer } from './components/Shared';
import Landing from './components/Landing';
import Auth from './components/Auth';
import ClientDashboard from './components/ClientDashboard';
import PTDashboard from './components/PTDashboard';

const App: React.FC = () => {
  // --- Global State (Mock DB) ---
  const [lang, setLang] = useState<Language>(Language.EN);
  const [currentPage, setCurrentPage] = useState('home'); // Simple routing
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [requests, setRequests] = useState<PTRequest[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const t = TRANSLATIONS[lang];

  // --- Handlers ---

  const handleAuth = (data: any, role: UserRole) => {
    // SECURITY: Simulate Hashing - never store or log plain text passwords
    // In a real backend: const hash = await bcrypt.hash(data.password, 10);
    const simulatedHash = `hashed_${data.password.length}_${Date.now()}`; 
    
    // Log safe data only
    console.log(`[Security Log] Auth attempt for: ${data.email} with hash simulation.`);

    const existing = users.find(u => u.email === data.email);
    if (existing) {
      // In real app: verify hash. Here we simulate success for demo if email matches.
      setCurrentUser(existing);
      setCurrentPage(existing.role === UserRole.PT ? 'pt-dashboard' : 'dashboard');
    } else {
      // Register
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: role,
        photoUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
        location: data.location || 'Denmark',
        hourlyRate: role === UserRole.PT ? 500 : undefined,
        bio: '', // Empty bio initially
        specialties: []
        // passwordHash: simulatedHash // Store hash, not plain text
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setCurrentPage(role === UserRole.PT ? 'pt-dashboard' : 'dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleRequestPT = (ptId: string) => {
    if (!currentUser) return setCurrentPage('login');
    
    // Prevent duplicate requests
    const existingReq = requests.find(r => r.clientId === currentUser.id && r.ptId === ptId && r.status === RequestStatus.PENDING);
    if (existingReq) {
        alert("You already have a pending request for this trainer.");
        return;
    }

    const newReq: PTRequest = {
      id: `req_${Date.now()}`,
      clientId: currentUser.id,
      ptId,
      status: RequestStatus.PENDING,
      createdAt: Date.now()
    };
    setRequests([...requests, newReq]);
    alert(t.requestSent);
  };

  const handleAcceptClient = (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;

    // Update request
    const updatedReqs = requests.map(r => r.id === reqId ? { ...r, status: RequestStatus.ACTIVE } : r);
    setRequests(updatedReqs);

    // Update Client Profile to link PT
    const updatedUsers = users.map(u => u.id === req.clientId ? { ...u, activePtId: req.ptId } : u);
    setUsers(updatedUsers);
  };

  const handleRejectClient = (reqId: string) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: RequestStatus.REJECTED } : r));
  };

  const handleCreatePlan = (plan: Partial<Plan>) => {
    // 1. Mark old plans as completed for this client
    const otherPlans = plans.map(p => 
      p.clientId === plan.clientId 
        ? { ...p, status: 'completed' as const } 
        : p
    );

    // 2. Create new active plan
    const newPlan: Plan = {
        ...plan as Plan,
        id: `plan_${Date.now()}`,
        status: 'active'
    };
    
    // 3. Update State
    setPlans([...otherPlans, newPlan]);
  };

  // UPDATED: Accepts receiverId for bi-directional chat
  const handleSendMessage = (text: string, receiverId: string) => {
    if(!currentUser) return;
    const msg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: currentUser.id,
        receiverId: receiverId,
        body: text,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    
    // Update global users list
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // Allow PT to update client data (specifically notes)
  const handleUpdateClient = (clientId: string, updatedData: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === clientId ? { ...u, ...updatedData } : u);
    setUsers(updatedUsers);
  };

  // --- Data Flow Logic: Filter PTs for Landing Page ---
  const publishedPTs = users.filter(u => u.role === UserRole.PT);

  // --- Router Switch ---
  
  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return (
          <Landing 
            t={t} 
            featuredPTs={publishedPTs}
            onCtaClick={() => setCurrentPage(currentUser ? 'dashboard' : 'login')}
            onViewProfile={(id) => console.log('View profile', id)}
          />
        );
      case 'login':
        return <Auth mode="login" t={t} onAuth={handleAuth} toggleMode={() => setCurrentPage('register')} />;
      case 'register':
        return <Auth mode="register" t={t} onAuth={handleAuth} toggleMode={() => setCurrentPage('login')} />;
      case 'dashboard':
        return currentUser && currentUser.role === UserRole.CLIENT ? (
          <ClientDashboard 
            user={currentUser} 
            t={t}
            allPTs={users}
            plans={plans}
            requests={requests} // PASS REQUESTS HERE
            // Pass filtered messages for the client (either sent by them or sent to them)
            messages={messages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)}
            onRequestPT={handleRequestPT}
            onSendMessage={handleSendMessage}
            onUpdateProfile={handleUpdateUser}
          />
        ) : <div className="pt-20 text-center text-white">Access Denied</div>;
      case 'pt-dashboard':
        return currentUser && currentUser.role === UserRole.PT ? (
          <PTDashboard 
            user={currentUser}
            t={t}
            clients={users} // pass all users, component filters my clients
            requests={requests}
            plans={plans}
            // Pass all messages relevant to this PT
            messages={messages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)}
            onAcceptClient={handleAcceptClient}
            onRejectClient={handleRejectClient}
            onCreatePlan={handleCreatePlan}
            onUpdateProfile={handleUpdateUser}
            onUpdateClient={handleUpdateClient}
            onSendMessage={handleSendMessage}
          />
        ) : <div className="pt-20 text-center text-white">Access Denied</div>;
      default:
        return <Landing t={t} featuredPTs={publishedPTs} onCtaClick={() => {}} onViewProfile={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-brand-dark">
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        user={currentUser} 
        onLogout={handleLogout} 
        navigate={setCurrentPage}
        t={t}
      />
      
      {renderPage()}
      
      <Footer />
    </div>
  );
};

export default App;
