
import React, { useState } from 'react';
import { Button, Input, Card } from './Shared';
import { UserRole } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
  t: any;
  onAuth: (data: any, type: UserRole) => void;
  toggleMode: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, t, onAuth, toggleMode }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pass data to parent handler
    onAuth(formData, role);

    // SECURITY FIX: Clear sensitive fields immediately after submission
    setFormData(prev => ({
      ...prev,
      password: '',
      email: mode === 'login' ? '' : prev.email // Optional: keep email for UX on error, but usually clear on success. For safety we clear.
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' 
              ? (role === UserRole.PT ? 'Trainer Login' : 'Client Login')
              : t.register
            }
          </h2>
          <p className="text-slate-400">
            {mode === 'login' 
              ? `Welcome back, ${role === UserRole.PT ? 'Coach' : 'future athlete'}` 
              : 'Create your account today'}
          </p>
        </div>

        {/* Role Selection Tabs - Now Visible for BOTH Login and Register */}
        <div className="flex bg-slate-900 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.CLIENT ? 'bg-brand-accent text-brand-dark shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setRole(UserRole.CLIENT)}
          >
            {t.roleClient}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.PT ? 'bg-brand-highlight text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setRole(UserRole.PT)}
          >
            {t.rolePt}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="animate-fade-in">
                <label className="block text-slate-400 text-sm mb-1">{t.name}</label>
                <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              </div>
              {role === UserRole.PT && (
                <div className="animate-fade-in">
                   <label className="block text-slate-400 text-sm mb-1">{t.location}</label>
                   <Input name="location" placeholder="Copenhagen" value={formData.location} onChange={handleChange} required />
                </div>
              )}
            </>
          )}
          
          <div>
            <label className="block text-slate-400 text-sm mb-1">{t.email}</label>
            <Input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm mb-1">{t.password}</label>
            <Input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          <Button variant="primary" type="submit" className="w-full mt-4">
            {mode === 'login' ? t.login : t.register}
          </Button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleMode} className="text-brand-accent hover:underline font-bold">
            {mode === 'login' ? t.register : t.login}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
