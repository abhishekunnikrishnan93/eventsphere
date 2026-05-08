import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-fade-in-up">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-200 blur-3xl rounded-full pointer-events-none opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-yellow-200 blur-3xl rounded-full pointer-events-none opacity-50 mix-blend-multiply"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl relative z-10 border border-slate-200 shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-navy-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Join EventSphere today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm text-center font-medium">{error}</div>}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-5 py-4 bg-slate-50 border border-slate-300 placeholder-slate-400 text-navy-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-5 py-4 bg-slate-50 border border-slate-300 placeholder-slate-400 text-navy-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-5 py-4 bg-slate-50 border border-slate-300 placeholder-slate-400 text-navy-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
              <select
                className="appearance-none relative block w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Attendee</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-brand-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
