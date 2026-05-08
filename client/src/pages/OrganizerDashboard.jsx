import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Edit, Trash2, Calendar, MapPin, Users, X } from 'lucide-react';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [currentEventAttendees, setCurrentEventAttendees] = useState([]);
  const [currentEventTitle, setCurrentEventTitle] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    durationDays: 1,
    location: '',
    price: '',
    totalSeats: '',
    category: 'General',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  });

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const [eventsRes, bookingsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/events/organizer/${user._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/bookings/organizer`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setEvents(eventsRes.data);
      setAllBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-calculate endDate based on durationDays and start date
    if (name === 'durationDays' || name === 'date') {
      const days = parseInt(newFormData.durationDays || 1, 10);
      if (days > 1 && newFormData.date) {
        const startDate = new Date(newFormData.date);
        startDate.setDate(startDate.getDate() + (days - 1));
        newFormData.endDate = startDate.toISOString().split('T')[0];
      } else if (days <= 1) {
        newFormData.endDate = '';
      }
    }

    setFormData(newFormData);
  };

  const handleEditClick = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      durationDays: event.durationDays || 1,
      location: event.location,
      price: event.price,
      totalSeats: event.totalSeats,
      category: event.category || 'General',
      imageUrl: event.imageUrl
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '', description: '', date: '', endDate: '', durationDays: 1, location: '', price: '', totalSeats: '', category: 'General',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      if (editingId) {
        await axios.put(`http://localhost:5000/api/events/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/events', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      handleCancelForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAttendees = (eventId, eventTitle) => {
    const attendees = allBookings.filter(b => b.eventId?._id === eventId);
    setCurrentEventAttendees(attendees);
    setCurrentEventTitle(eventTitle);
    setShowAttendeesModal(true);
  };

  if (loading) return <div className="text-center mt-20 text-xl text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Organizer Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage your events and track bookings</p>
        </div>
        <button 
          onClick={showForm ? handleCancelForm : () => setShowForm(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {showForm ? 'Cancel Form' : <><PlusCircle className="w-5 h-5"/> Create Event</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl mb-12 relative overflow-hidden animate-slide-in border border-brand-200 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 blur-3xl rounded-full pointer-events-none opacity-60"></div>
          
          <h2 className="text-2xl font-bold text-navy-900 mb-8 relative z-10">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input type="text" name="title" value={formData.title} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <input type="text" name="category" value={formData.category} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" placeholder="e.g. Workshop, Concert" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} required onChange={handleChange} rows="3" className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Days)</label>
              <input type="number" name="durationDays" min="1" value={formData.durationDays} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
            </div>
            {formData.durationDays > 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
                  <input type="date" name="date" value={formData.date} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
                  <input type="date" name="endDate" value={formData.endDate} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input type="date" name="date" value={formData.date} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <input type="text" name="location" value={formData.location} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
              <input type="number" name="price" value={formData.price} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Seats</label>
              <input type="number" name="totalSeats" value={formData.totalSeats} required onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" />
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                {editingId ? 'Update Event' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-xl font-bold text-navy-900">Your Active Events</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {events.length === 0 ? (
             <div className="p-12 text-center text-slate-500 text-lg">You haven't created any events yet.</div>
          ) : (
            events.map(event => (
              <div key={event._id} className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-navy-900">{event.title}</h4>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        event.status === 'approved' ? 'bg-green-100 text-green-700' :
                        event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.status || 'pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-brand-500"/> {new Date(event.date).toLocaleDateString()} {event.endDate && event.durationDays > 1 ? `- ${new Date(event.endDate).toLocaleDateString()}` : ''}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-brand-500"/> {event.location}</span>
                    </div>
                    <button 
                      onClick={() => handleViewAttendees(event._id, event.title)}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                    >
                      <Users className="w-4 h-4" /> View Attendees ({allBookings.filter(b => b.eventId?._id === event._id).length})
                    </button>
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
                  <div className="flex gap-2 pt-4 mt-2 border-t md:border-t-0 md:pt-0 md:mt-0 w-full md:w-auto justify-center md:justify-end border-slate-200">
                    <button onClick={() => handleEditClick(event)} className="p-3 bg-white text-slate-500 hover:text-brand-600 border border-slate-200 hover:border-brand-200 shadow-sm rounded-xl transition-all" title="Edit Event"><Edit className="w-5 h-5"/></button>
                    <button onClick={() => handleDelete(event._id)} className="p-3 bg-white text-red-400 hover:text-red-600 border border-slate-200 hover:border-red-200 shadow-sm rounded-xl transition-all" title="Delete Event"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-navy-900">Attendees: {currentEventTitle}</h3>
              <button onClick={() => setShowAttendeesModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
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

export default OrganizerDashboard;
