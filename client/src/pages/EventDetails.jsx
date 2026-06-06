import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, Users, CreditCard, CheckCircle } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Seat Selection State
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Modal & Payment State
  const [showModal, setShowModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const [reserveError, setReserveError] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`http://${import.meta.env.VITE_API_URL}/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const toggleSeat = (seatNumber, status) => {
    if (status !== 'available') return;
    setReserveError(''); // Clear errors
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBookClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (selectedSeats.length === 0) {
      setReserveError('Please select at least one seat to proceed.');
      return;
    }

    try {
      setReserveError('');
      const token = sessionStorage.getItem('token');
      
      // Step 1: Temporarily Reserve Seats
      await axios.post('http://${import.meta.env.VITE_API_URL}/api/bookings/reserve', {
        eventId: id,
        selectedSeats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Open Payment Modal
      setShowModal(true);
    } catch (err) {
      setReserveError(err.response?.data?.message || 'Failed to reserve seats. They may have just been taken!');
      // Refresh event to get latest seat map
      fetchEvent();
      setSelectedSeats([]);
    }
  };

  const handleCloseModal = async () => {
    setShowModal(false);
    setError('');
    
    // Release seats back to available
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://${import.meta.env.VITE_API_URL}/api/bookings/release', {
        eventId: id,
        selectedSeats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to release seats', err);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Finalize Booking
      const res = await axios.post('http://${import.meta.env.VITE_API_URL}/api/bookings', {
        eventId: id,
        tickets: selectedSeats.length,
        selectedSeats,
        paymentSimulationId: `sim_txn_${Math.random().toString(36).substr(2, 9)}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(false);
        navigate('/booking-success', { 
          state: { 
            booking: res.data, 
            event: event, 
            tickets: selectedSeats.length, 
            amount: event.price * selectedSeats.length 
          } 
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  const generateSimulatedCard = (userId) => {
    if (!userId) return { number: '4242 4242 4242 4242', expiry: '12/25', cvc: '123' };
    
    let numericStr = '';
    for (let i = 0; i < userId.length; i++) {
      numericStr += userId.charCodeAt(i).toString();
    }
    
    const rawNumber = numericStr.slice(0, 16).padEnd(16, '4');
    const number = rawNumber.match(/.{1,4}/g).join(' ');
    
    const month = (parseInt(numericStr.slice(16, 18)) % 12) + 1;
    const year = (parseInt(numericStr.slice(18, 20)) % 6) + 25; 
    const expiry = `${month.toString().padStart(2, '0')}/${year}`;
    
    const cvc = numericStr.slice(20, 23).padEnd(3, '1');
    
    return { number, expiry, cvc };
  };

  const simCard = generateSimulatedCard(user?._id);

  if (loading) return <div className="text-center mt-20 text-xl text-slate-500">Loading details...</div>;
  if (!event) return <div className="text-center mt-20 text-xl text-slate-500">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row relative border border-slate-200 shadow-xl mb-12">
        
        <div className="w-full md:w-1/2 h-80 md:h-auto relative z-10">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
        
        <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col relative z-20 bg-white">
          <div className="mb-6">
             <span className="bg-brand-50 text-brand-700 font-bold px-4 py-1.5 rounded-full text-sm tracking-wide uppercase">
                {event.category}
             </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy-900 mb-6 leading-tight">{event.title}</h1>
          <p className="text-slate-600 mb-10 leading-relaxed flex-grow text-lg">{event.description}</p>
          
          <div className="space-y-5 mb-10 text-navy-900">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="p-3 bg-brand-100 rounded-xl"><Calendar className="w-6 h-6 text-brand-600" /></div>
              <span className="font-medium text-lg">
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {event.endDate && event.durationDays > 1 && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
              </span>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="p-3 bg-brand-100 rounded-xl"><MapPin className="w-6 h-6 text-brand-600" /></div>
              <span className="font-medium text-lg">{event.location}</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="p-3 bg-brand-100 rounded-xl"><Users className="w-6 h-6 text-brand-600" /></div>
              <span className="font-medium text-lg">{event.availableSeats} / {event.totalSeats} Available Seats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection Map */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl mb-12">
        <h2 className="text-3xl font-extrabold text-navy-900 mb-2">Select Your Seats</h2>
        <p className="text-slate-500 mb-8">Choose your preferred seats from the interactive map below.</p>
        
        {/* Screen/Stage Indicator */}
        <div className="w-full max-w-[90%] mx-auto mb-12">
          <div className="h-2 w-full bg-slate-200 rounded-t-full relative mb-6">
            <div className="absolute inset-x-0 bottom-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Stage</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1/2 h-10 bg-gradient-to-b from-brand-100/50 to-transparent blur-md"></div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-white border-2 border-slate-200"></div><span className="text-sm font-semibold text-slate-600">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-brand-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] border-2 border-brand-500"></div><span className="text-sm font-semibold text-slate-600">Selected</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-slate-200 border-2 border-slate-300 opacity-50 cursor-not-allowed"></div><span className="text-sm font-semibold text-slate-600">Booked/Reserved</span></div>
        </div>

        {reserveError && <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center font-bold mb-8 animate-shake">{reserveError}</div>}

        {/* Seat Grid */}
        <div className="w-full mx-auto pb-8 overflow-x-auto custom-scrollbar">
          {event.seats && event.seats.length > 0 ? (
            <div className="flex flex-col gap-2 md:gap-4 w-full px-1 sm:px-4 min-w-[800px] md:min-w-0">
              {(() => {
                // Group seats by row letter
                const seatsByRow = event.seats.reduce((acc, seat) => {
                  const rowMatch = seat.seatNumber.match(/[A-Za-z]+/);
                  const row = rowMatch ? rowMatch[0] : 'Other';
                  if (!acc[row]) acc[row] = [];
                  acc[row].push(seat);
                  return acc;
                }, {});

                return Object.keys(seatsByRow).sort().map(rowLetter => (
                  <div key={rowLetter} className="flex items-center gap-4">
                    {/* Row Label */}
                    <div className="w-6 sm:w-8 text-center font-bold text-slate-400 text-sm md:text-lg flex-shrink-0">
                      {rowLetter}
                    </div>
                    {/* Seats in Row */}
                    <div className="flex gap-[2px] sm:gap-1 md:gap-2 flex-1 justify-center">
                      {seatsByRow[rowLetter].map((seat) => {
                        const isSelected = selectedSeats.includes(seat.seatNumber);
                        const isUnavailable = seat.status !== 'available';
                        
                        let seatStyles = "flex-1 aspect-square min-w-0 max-w-[40px] rounded-t-sm sm:rounded-t-lg rounded-b-sm flex items-center justify-center text-[8px] sm:text-[10px] md:text-xs font-bold transition-all duration-200 overflow-hidden ";
                        
                        if (isSelected) {
                          seatStyles += "bg-brand-500 text-white border border-brand-600 shadow-md transform -translate-y-1";
                        } else if (isUnavailable) {
                          seatStyles += "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60";
                        } else {
                          seatStyles += "bg-white text-navy-900 border border-slate-300 hover:border-brand-400 hover:bg-brand-50 cursor-pointer shadow-sm hover:shadow-md";
                        }

                        return (
                          <button
                            key={seat.seatNumber}
                            disabled={isUnavailable}
                            onClick={() => toggleSeat(seat.seatNumber, seat.status)}
                            className={seatStyles}
                            title={`Seat ${seat.seatNumber} - ${seat.status}`}
                          >
                            <span className="truncate">{seat.seatNumber.replace(/[A-Za-z]+/, '')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
              No seat layout available for this event. (This is an older event before the seating module was added)
            </div>
          )}
        </div>

        {/* Checkout Bar */}
        <div className="max-w-4xl mx-auto bg-slate-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between mt-8 border border-slate-200 shadow-sm">
          <div className="mb-4 sm:mb-0">
            <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Seats</span>
            <div className="text-navy-900 font-bold flex flex-wrap gap-2">
              {selectedSeats.length === 0 ? <span className="text-slate-400 font-normal">None selected</span> : selectedSeats.join(', ')}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</span>
              <span className="text-3xl font-extrabold text-brand-600">₹{event.price * selectedSeats.length}</span>
            </div>
            <button 
              onClick={handleBookClick}
              disabled={selectedSeats.length === 0 || !event.seats || event.seats.length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-md ${selectedSeats.length === 0 || !event.seats ? 'bg-slate-400 cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 hover:shadow-lg hover:-translate-y-1'}`}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-scale-up">
            
            {bookingSuccess ? (
              <div className="text-center py-10 relative z-10">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-navy-900 mb-3">Payment Successful!</h3>
                <p className="text-slate-600 text-lg">Your tickets are secured.</p>
              </div>
            ) : (
              <div className="relative z-10">
                <button onClick={handleCloseModal} className="absolute top-0 right-0 text-slate-400 hover:text-red-500 text-3xl font-light transition-colors">&times;</button>
                <h3 className="text-3xl font-extrabold text-navy-900 mb-8 flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-brand-600" /> Checkout
                </h3>
                
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-6 font-medium">{error}</div>}
                
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <div>
                       <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tickets</span>
                       <span className="font-extrabold text-navy-900">{selectedSeats.length}</span>
                    </div>
                    <div>
                       <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seats</span>
                       <span className="font-bold text-brand-600 text-sm truncate block">{selectedSeats.join(', ')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Card Number (Simulated)</label>
                    <input 
                      type="text" 
                      defaultValue={simCard.number} 
                      className="w-full px-5 py-4 bg-white border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Expiry</label>
                      <input 
                        type="text" 
                        defaultValue={simCard.expiry} 
                        className="w-full px-5 py-4 bg-white border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">CVC</label>
                      <input 
                        type="text" 
                        defaultValue={simCard.cvc} 
                        className="w-full px-5 py-4 bg-white border border-slate-300 text-navy-900 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-200 mt-8 flex justify-between items-center">
                    <span className="text-slate-600 text-lg">Total Amount:</span>
                    <span className="text-3xl font-bold text-navy-900">₹{event.price * selectedSeats.length}</span>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Confirm Payment
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
