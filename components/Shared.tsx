import React, { useRef, useState } from 'react';

// --- UI Primitives ---

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyle = "px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-accent text-brand-dark hover:bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
    secondary: "bg-brand-highlight text-white hover:bg-orange-600",
    outline: "border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-dark",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
    {...props}
  />
);

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-brand-accent/30 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

// --- File Upload Component ---

interface FileUploadProps {
  label: string;
  accept: string;
  type?: 'image' | 'video';
  currentPreviewUrl?: string;
  onFileSelect: (url: string, file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, type = 'image', currentPreviewUrl, onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(currentPreviewUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(objectUrl, file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Hidden Input */}
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept={accept}
          onChange={handleFileChange}
        />
        
        {/* Custom Button */}
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => inputRef.current?.click()}
          className="!px-4 !py-2 text-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          {label}
        </Button>

        <span className="text-xs text-slate-500 italic">
          {preview ? 'File selected' : 'No file selected'}
        </span>
      </div>

      {/* Preview Area */}
      {preview && (
        <div className="relative mt-2 w-full max-w-xs rounded-lg overflow-hidden border border-slate-600 bg-slate-900">
          {type === 'image' ? (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          ) : (
            <video src={preview} controls className="w-full h-48 bg-black" />
          )}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setPreview(null); if(inputRef.current) inputRef.current.value = ''; }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

// --- Layout ---

export const Navbar: React.FC<{
  lang: 'EN' | 'DK';
  setLang: (l: 'EN' | 'DK') => void;
  user: any;
  onLogout: () => void;
  navigate: (page: string) => void;
  t: any;
}> = ({ lang, setLang, user, onLogout, navigate, t }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleNavigate = (page: string) => {
    navigate(page);
    closeMenu();
  };

  const handleLogout = () => {
    onLogout();
    closeMenu();
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-brand-dark/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo - Always Visible */}
            <div 
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-brand-accent to-brand-highlight bg-clip-text text-transparent cursor-pointer truncate"
              onClick={() => handleNavigate('home')}
            >
              Personlig Træner Spot DK
            </div>
            
            {/* Desktop Menu (Hidden on Mobile) */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setLang(lang === 'EN' ? 'DK' : 'EN')}
                className="text-sm font-medium text-slate-300 hover:text-brand-accent transition-colors"
              >
                {lang}
              </button>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm">Hi, {user.name}</span>
                  <Button variant="outline" onClick={() => handleNavigate(user.role === 'PT' ? 'pt-dashboard' : 'dashboard')} className="!px-4 !py-1 text-sm">
                    {t.dashboard}
                  </Button>
                  <button onClick={onLogout} className="text-slate-400 hover:text-white" title={t.logout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                   <button onClick={() => handleNavigate('login')} className="text-white hover:text-brand-accent font-medium px-3 py-2 transition-colors">
                     {t.login}
                   </button>
                   <Button variant="primary" onClick={() => handleNavigate('register')} className="!px-4 !py-1.5 text-sm">
                     {t.register}
                   </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button (Visible only on Mobile) */}
            <div className="md:hidden flex items-center">
               <button onClick={toggleMenu} className="text-white focus:outline-none">
                 {isMobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                 )}
               </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Sidebar / Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-xl flex flex-col pt-20 px-6 pb-6 md:hidden animate-fade-in">
           <div className="flex flex-col space-y-6 h-full">
              
              {/* Language Toggle in Sidebar */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <span className="text-slate-400 text-lg">Language / Sprog</span>
                  <div className="flex bg-slate-800 rounded-lg p-1">
                      <button 
                        onClick={() => setLang('EN')} 
                        className={`px-4 py-1 rounded-md text-sm font-bold ${lang === 'EN' ? 'bg-brand-accent text-brand-dark' : 'text-slate-400'}`}
                      >
                        EN
                      </button>
                      <button 
                        onClick={() => setLang('DK')} 
                        className={`px-4 py-1 rounded-md text-sm font-bold ${lang === 'DK' ? 'bg-brand-highlight text-white' : 'text-slate-400'}`}
                      >
                        DK
                      </button>
                  </div>
              </div>

              {/* User Controls */}
              {user ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     {user.photoUrl && <img src={user.photoUrl} alt="User" className="w-10 h-10 rounded-full border border-brand-accent" />}
                     <div>
                       <p className="text-white font-bold">{user.name}</p>
                       <p className="text-slate-500 text-xs">{user.email}</p>
                     </div>
                  </div>
                  
                  <Button variant="primary" onClick={() => handleNavigate(user.role === 'PT' ? 'pt-dashboard' : 'dashboard')} className="w-full justify-center">
                    {t.dashboard}
                  </Button>
                  
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-center border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    {t.logout}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 mt-4">
                  <Button variant="primary" onClick={() => handleNavigate('login')} className="w-full text-center text-lg py-3">
                    {t.login}
                  </Button>
                  <Button variant="outline" onClick={() => handleNavigate('register')} className="w-full text-center text-lg py-3">
                    {t.register}
                  </Button>
                </div>
              )}

              <div className="mt-auto text-center text-slate-600 text-sm">
                 <p>&copy; 2024 Personlig Træner Spot DK</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export const Footer: React.FC = () => (
  <footer className="bg-brand-dark border-t border-slate-800 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
      <p>&copy; {new Date().getFullYear()} Personlig Træner Spot DK. All rights reserved.</p>
    </div>
  </footer>
);

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}