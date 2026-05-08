import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Trash2, Users, Shield, CalendarDays, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'users'
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [currentEventAttendees, setCurrentEventAttendees] = useState([]);
  const [currentEventTitle, setCurrentEventTitle] = useState('');
  const { user } = useContext(AuthContext);

  const fetchAllEvents = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/events/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings/organizer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAllEvents(), fetchAllUsers(), fetchAllBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this event as an Admin?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(prevEvents => prevEvents.filter(ev => ev._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting event.');
    }
  };

  const handleUpdateEventStatus = async (id, status) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/events/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(prevEvents => prevEvents.map(ev => ev._id === id ? { ...ev, status: res.data.status } : ev));
    } catch (err) {
      console.error(err);
      alert('Error updating event status.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? All their data will be lost.')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      alert('Error deleting user.');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/auth/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      alert('Error updating user role.');
    }
  };

  const handleViewAttendees = (eventId, eventTitle) => {
    const attendees = allBookings.filter(b => b.eventId?._id === eventId);
    setCurrentEventAttendees(attendees);
    setCurrentEventTitle(eventTitle);
    setShowAttendeesModal(true);
  };

  if (loading) return <div className="text-center mt-20 text-xl font-medium text-slate-500">Loading admin dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage and monitor platform events and users</p>
        </div>
        <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-brand-200 shadow-sm">
          <Shield className="w-5 h-5" />
          Admin Access
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 md:gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'events' ? 'bg-navy-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
        >
          <CalendarDays className="w-5 h-5" /> Manage Events
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'users' ? 'bg-navy-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Users className="w-5 h-5" /> Manage Users
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm animate-fade-in">
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-navy-900">All Events Overview</h3>
            <span className="text-sm font-medium text-slate-500">{events.length} Total Events</span>
          </div>
          <div className="divide-y divide-slate-100">
            {events.length === 0 ? (
               <div className="p-12 text-center text-slate-500 text-lg">No events exist on the platform.</div>
            ) : (
              events.map(event => (
                <div key={event._id} className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-navy-900 mb-2">{event.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-brand-500"/> 
                          {new Date(event.date).toLocaleDateString()}
                          {event.endDate && event.durationDays > 1 && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-brand-500"/> {event.location}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          event.status === 'approved' ? 'bg-green-100 text-green-700' :
                          event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status || 'pending'}
                        </span>
                        <button 
                          onClick={() => handleViewAttendees(event._id, event.title)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                        >
                          <Users className="w-4 h-4" /> View Bookings ({allBookings.filter(b => b.eventId?._id === event._id).length})
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-8 w-full md:w-auto justify-between md:justify-end bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-center">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seats</span>
                      <span className="text-lg font-extrabold text-navy-900">{event.availableSeats}/{event.totalSeats}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price</span>
                      <span className="text-lg font-extrabold text-brand-600">₹{event.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 mt-2 w-full border-t border-slate-200 md:w-auto md:pt-0 md:mt-0 md:pl-4 md:border-t-0 md:border-l justify-center md:justify-start">
                      {event.status !== 'approved' && (
                        <button 
                          onClick={() => handleUpdateEventStatus(event._id, 'approved')} 
                          className="p-3 bg-green-50 text-green-600 hover:text-green-700 hover:bg-green-100 border border-green-100 hover:border-green-200 shadow-sm rounded-xl transition-all flex items-center gap-2"
                          title="Approve Event"
                        >
                          <CheckCircle className="w-5 h-5"/>
                        </button>
                      )}
                      {event.status !== 'rejected' && (
                        <button 
                          onClick={() => handleUpdateEventStatus(event._id, 'rejected')} 
                          className="p-3 bg-orange-50 text-orange-600 hover:text-orange-700 hover:bg-orange-100 border border-orange-100 hover:border-orange-200 shadow-sm rounded-xl transition-all flex items-center gap-2"
                          title="Reject Event"
                        >
                          <XCircle className="w-5 h-5"/>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteEvent(event._id)} 
                        className="p-3 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border border-red-100 hover:border-red-200 shadow-sm rounded-xl transition-all flex items-center gap-2"
                        title="Delete Event as Admin"
                      >
                        <Trash2 className="w-5 h-5"/>
                        <span className="hidden md:inline font-bold text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm animate-fade-in">
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-navy-900">User Management</h3>
            <span className="text-sm font-medium text-slate-500">{usersList.length} Registered Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 pl-8">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-8 font-bold text-navy-900">{u.name} {u._id === user._id && <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">You</span>}</td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        disabled={u._id === user._id}
                        className="bg-white border border-slate-300 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none disabled:opacity-50"
                      >
                        <option value="user">Attendee</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-8 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u._id === user._id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-navy-900">Attendees: {currentEventTitle}</h3>
              <button onClick={() => setShowAttendeesModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {currentEventAttendees.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No bookings yet for this event.</div>
              ) : (
                <div className="space-y-4">
                  {currentEventAttendees.map(booking => (
                    <div key={booking._id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-slate-50">
                      <div>
                        <p className="font-bold text-navy-900">{booking.userId?.name || 'Unknown User'}</p>
                        <p className="text-sm text-slate-500">{booking.userId?.email || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-brand-600">{booking.tickets} Tickets</span>
                        <span className={`text-xs font-bold uppercase ${booking.status === 'cancelled' ? 'text-red-500' : 'text-green-500'}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
