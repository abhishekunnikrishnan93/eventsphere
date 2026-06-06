import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://${import.meta.env.VITE_API_URL}/api/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl">Loading events...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="bg-brand-50 rounded-3xl p-10 md:p-16 text-center mb-16 relative overflow-hidden border border-brand-100">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-navy-900 mb-6 tracking-tight animate-fade-in-up">
            Discover <span className="text-brand-600">Amazing</span> Events
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Book tickets for the best concerts, workshops, and meetups happening around you.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-2xl font-bold text-navy-900">Featured Events</h2>
        <div className="h-px bg-slate-200 flex-grow"></div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <Link to={`/events/${event._id}`} key={event._id} className="group block animate-fade-in-up" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-full hover:-translate-y-1">
              
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-navy-900 shadow-sm">
                  ₹{event.price}
                </div>
              </div>
              
              <div className="ticket-cutout">
                <div className="dashed-divider"></div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 flex-grow flex flex-col bg-white rounded-b-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-4 line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-3 mb-6 mt-auto text-slate-600 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-500" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      {event.endDate && event.durationDays > 1 && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                
                <button className="w-full bg-slate-50 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-700 font-bold py-3 rounded-xl transition-colors border border-slate-200 group-hover:border-brand-200">
                  Get Tickets
                </button>
              </div>
            </div>
          </Link>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-16 text-lg">
            No events found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
