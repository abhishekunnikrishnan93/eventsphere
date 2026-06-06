import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Ticket, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTickets = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchBookings = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://${import.meta.env.VITE_API_URL}/api/bookings/mybookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://${import.meta.env.VITE_API_URL}/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking cancelled successfully.');
      fetchBookings(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error cancelling booking.');
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl text-slate-500">Loading your tickets...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">My Tickets</h1>
          <p className="text-slate-500 mt-2">Manage and view your upcoming event bookings</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
          <Ticket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't booked any events yet.</p>
          <Link to="/" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md inline-block">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-2xl flex flex-col sm:flex-row border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {/* Left Side (Event Details) */}
              <div className="p-6 flex-grow border-b sm:border-b-0 sm:border-r border-dashed border-slate-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    {booking.eventId?.category || 'Event'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {booking.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-navy-900 mb-4 line-clamp-1">
                  {booking.eventId?.title || 'Event no longer exists'}
                </h3>
                
                {booking.eventId && (
                  <div className="space-y-3 mb-4 text-slate-600 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-brand-500" />
                      <span className="font-medium">{new Date(booking.eventId.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-brand-500" />
                      <span className="truncate">{booking.eventId.location}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-4 flex gap-4">
                  <div className="flex-1">
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Tickets & Seats</span>
                    <span className="font-bold text-navy-900">{booking.tickets}</span>
                    {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                      <div className="text-xs font-bold text-brand-600 mt-0.5 break-words">Seats: {booking.selectedSeats.join(', ')}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Paid</span>
                    <span className="font-bold text-brand-600">₹{booking.totalPrice}</span>
                  </div>
                </div>
              </div>
              
              {/* Right Side (Ticket Stub / QR) */}
              <div className="bg-slate-50 p-6 flex flex-col justify-center items-center min-w-[160px]">
                <QrCode className="w-24 h-24 text-navy-900 mb-3 opacity-80" />
                <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 border border-slate-200 rounded">
                  {booking._id.slice(-8).toUpperCase()}
                </span>
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleCancel(booking._id)}
                    className="mt-4 text-xs font-bold text-slate-500 hover:text-red-600 uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
