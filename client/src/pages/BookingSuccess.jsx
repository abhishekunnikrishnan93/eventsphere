import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Calendar, MapPin, QrCode } from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Destructure the state passed from EventDetails
  const { booking, event, tickets, amount } = location.state || {};

  useEffect(() => {
    // If someone tries to access this page directly without booking data, redirect them
    if (!booking || !event) {
      navigate('/');
    }
  }, [booking, event, navigate]);

  if (!booking || !event) return null;

  const handleDownload = () => {
    window.print(); // Simple way to let users save as PDF via browser print dialog
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up print:py-0 print:px-0">
      <div className="text-center mb-12 print:hidden">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight mb-4">Booking Confirmed!</h1>
        <p className="text-lg text-slate-600">
          Thank you for your purchase. Your payment of <span className="font-bold text-brand-600">₹{amount}</span> was successful.
        </p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative mb-12 print:shadow-none print:border-none print:m-0 print:break-inside-avoid">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 blur-3xl rounded-full pointer-events-none opacity-40 print:hidden"></div>
        
        {/* Ticket Header Image */}
        <div className="h-48 w-full relative print:h-32">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full print:p-6">
             <span className="bg-brand-500 text-white font-bold px-3 py-1 rounded-md text-xs tracking-wide uppercase mb-2 inline-block">
                {event.category}
             </span>
             <h2 className="text-3xl font-bold text-white line-clamp-1">{event.title}</h2>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 relative z-10 print:p-6 print:gap-6">
          {/* Ticket Details */}
          <div className="flex-grow space-y-6 border-b pb-8 md:pb-0 md:border-b-0 md:border-r border-dashed border-slate-300 md:pr-8 print:border-r print:pr-6 print:pb-0 print:border-b-0">
            <div className="grid grid-cols-2 gap-6 print:gap-4">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</span>
                <div className="flex items-center gap-2 text-navy-900 font-semibold">
                  <Calendar className="w-5 h-5 text-brand-500" />
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  {event.endDate && event.durationDays > 1 && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`}
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</span>
                <div className="flex items-center gap-2 text-navy-900 font-semibold truncate">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-6 print:pt-4 print:gap-4">
               <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity & Seats</span>
                <span className="text-2xl font-extrabold text-navy-900 print:text-xl">{tickets} <span className="text-base font-medium text-slate-500">Ticket(s)</span></span>
                {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                  <div className="text-sm font-bold text-brand-600 mt-1">Seats: {booking.selectedSeats.join(', ')}</div>
                )}
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</span>
                <span className="text-2xl font-extrabold text-brand-600 print:text-xl">₹{amount}</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 print:pt-4">
               <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</span>
               <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{booking._id}</span>
            </div>
          </div>

          {/* QR Code / Right Side */}
          <div className="flex flex-col items-center justify-center min-w-[200px] bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-none print:p-0 print:min-w-[150px]">
             <QrCode className="w-32 h-32 text-navy-900 mb-4 opacity-90 print:w-24 print:h-24 print:mb-2" />
             <p className="text-xs text-center text-slate-500 font-medium">Scan at the entrance<br/>to verify your ticket.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 print:hidden">
        <button 
          onClick={handleDownload}
          className="bg-white border border-slate-300 text-navy-900 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Download className="w-5 h-5" /> Download / Print Ticket
        </button>
        <Link 
          to="/my-tickets"
          className="bg-navy-900 hover:bg-navy-800 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
        >
          View All My Tickets <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
