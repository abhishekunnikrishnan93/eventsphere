import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CalendarDays, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="p-2 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors duration-300">
                <CalendarDays className="h-7 w-7 text-brand-600" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-navy-900 group-hover:text-brand-600 transition-colors">EventSphere</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <span className="text-slate-600 font-medium">Hi, <span className="text-navy-900 font-bold">{user.name}</span></span>
                
                <Link to="/my-tickets" className="text-slate-600 hover:text-brand-600 font-semibold transition-colors">
                  My Tickets
                </Link>

                {user.role === 'organizer' && (
                  <Link to="/organizer" className="text-slate-600 hover:text-brand-600 font-semibold transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-brand-600 font-semibold transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-semibold bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-navy-900 font-semibold transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-navy-900 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            {user ? (
              <>
                <div className="px-3 py-3 border-b border-slate-100 mb-2">
                  <span className="text-slate-500 text-sm">Signed in as</span>
                  <div className="font-bold text-navy-900">{user.name}</div>
                </div>
                <Link to="/my-tickets" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50">
                  My Tickets
                </Link>
                {user.role === 'organizer' && (
                  <Link to="/organizer" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50">
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center gap-2 text-red-600 font-semibold bg-red-50 px-4 py-3 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50">
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
