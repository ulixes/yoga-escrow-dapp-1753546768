import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import YogaClassCard from './components/YogaClassCard';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import type { YogaClass, Booking } from './types';
import './App.css';

// Sample yoga classes data
const sampleClasses: YogaClass[] = [
  {
    id: '1',
    name: 'Morning Flow Yoga',
    instructor: 'Sarah Chen',
    duration: 60,
    price: parseEther('0.001'),
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    maxParticipants: 10,
    currentParticipants: 3,
  },
  {
    id: '2',
    name: 'Sunset Yin Yoga',
    instructor: 'Michael Rivera',
    duration: 75,
    price: parseEther('0.0015'),
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    maxParticipants: 8,
    currentParticipants: 5,
  },
  {
    id: '3',
    name: 'Power Vinyasa',
    instructor: 'Emma Thompson',
    duration: 90,
    price: parseEther('0.002'),
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    maxParticipants: 12,
    currentParticipants: 12,
  },
];

function App() {
  const { isConnected, address } = useAccount();
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'bookings'>('classes');

  // Load bookings from localStorage on component mount
  useEffect(() => {
    if (address) {
      const savedBookings = localStorage.getItem(`bookings_${address}`);
      if (savedBookings) {
        try {
          const parsedBookings = JSON.parse(savedBookings).map((booking: any) => ({
            ...booking,
            transactionId: BigInt(booking.transactionId),
            amount: BigInt(booking.amount),
            createdAt: new Date(booking.createdAt),
            deadline: new Date(booking.deadline),
          }));
          setBookings(parsedBookings);
        } catch (error) {
          console.error('Error loading bookings from localStorage:', error);
        }
      }
    }
  }, [address]);

  // Save bookings to localStorage whenever bookings change
  useEffect(() => {
    if (address && bookings.length > 0) {
      const serializableBookings = bookings.map(booking => ({
        ...booking,
        transactionId: booking.transactionId.toString(),
        amount: booking.amount.toString(),
        createdAt: booking.createdAt.toISOString(),
        deadline: booking.deadline.toISOString(),
      }));
      localStorage.setItem(`bookings_${address}`, JSON.stringify(serializableBookings));
    }
  }, [address, bookings]);

  const handleBookClass = (classId: string) => {
    const yogaClass = sampleClasses.find(c => c.id === classId);
    if (yogaClass) {
      setSelectedClass(yogaClass);
    }
  };

  const handleBookingSuccess = (transactionId: bigint) => {
    if (selectedClass) {
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        classId: selectedClass.id,
        transactionId,
        buyer: address || '', // Current user is the buyer
        seller: '0xb07bb9D7Be773CD996cd092EF8b249Da49ec6ec6', // Instructor address
        amount: selectedClass.price,
        status: 'pending',
        createdAt: new Date(),
        deadline: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      };
      setBookings([...bookings, newBooking]);
    }
  };

  const handleCancelBooking = (transactionId: bigint) => {
    setBookings(bookings.map(booking => 
      booking.transactionId === transactionId 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🧘 Yoga Class Booking</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="app-main">
        {!isConnected ? (
          <div className="connect-prompt">
            <h2>Welcome to Yoga Class Booking</h2>
            <p>Connect your wallet to book yoga classes securely with escrow protection.</p>
            <p className="info">✨ 5-minute cancellation window for full refund</p>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
                onClick={() => setActiveTab('classes')}
              >
                Available Classes
              </button>
              <button 
                className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                My Bookings ({bookings.length})
              </button>
            </div>

            {activeTab === 'classes' ? (
              <div className="classes-grid">
                {sampleClasses.map(yogaClass => (
                  <YogaClassCard
                    key={yogaClass.id}
                    yogaClass={yogaClass}
                    onBook={handleBookClass}
                  />
                ))}
              </div>
            ) : (
              <MyBookings 
                bookings={bookings} 
                onCancel={handleCancelBooking}
              />
            )}
          </>
        )}
      </main>

      {selectedClass && (
        <BookingModal
          yogaClass={selectedClass}
          onClose={() => setSelectedClass(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

export default App;