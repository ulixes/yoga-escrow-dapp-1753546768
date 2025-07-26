import { useState } from 'react';
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
    price: parseEther('0.01'),
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    maxParticipants: 10,
    currentParticipants: 3,
  },
  {
    id: '2',
    name: 'Sunset Yin Yoga',
    instructor: 'Michael Rivera',
    duration: 75,
    price: parseEther('0.015'),
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    maxParticipants: 8,
    currentParticipants: 5,
  },
  {
    id: '3',
    name: 'Power Vinyasa',
    instructor: 'Emma Thompson',
    duration: 90,
    price: parseEther('0.02'),
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    maxParticipants: 12,
    currentParticipants: 12,
  },
];

function App() {
  const { isConnected } = useAccount();
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'bookings'>('classes');

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
        buyer: '', // Will be filled from contract
        seller: '', // Will be filled from contract
        amount: selectedClass.price,
        status: 'pending',
        createdAt: new Date(),
        deadline: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
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