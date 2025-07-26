import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import type { Booking } from '../types';
import { escrowAbi, ESCROW_CONTRACT_ADDRESS } from '../config/escrowAbi';

interface MyBookingsProps {
  bookings: Booking[];
  onCancel: (transactionId: bigint) => void;
}

export default function MyBookings({ bookings }: MyBookingsProps) {
  const { address } = useAccount();
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCancelBooking = async (booking: Booking) => {
    if (!address || booking.status !== 'pending') return;

    try {
      // First, verify we can actually cancel by checking the contract deadline
      const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      
      console.log('Attempting cancellation:', {
        transactionId: booking.transactionId.toString(),
        amount: booking.amount.toString(),
        currentTime: currentTime,
      });

      // Check if still within 5-minute cancellation window (local check)
      const now = new Date();
      const bookingTime = booking.createdAt;
      const timeDiff = (now.getTime() - bookingTime.getTime()) / 1000; // in seconds
      
      if (timeDiff > 300) {
        alert('Cancellation period has expired (5 minutes)');
        return;
      }

      // The reimburse function requires (transactionID, amountReimbursed)
      // For cancellation within the deadline, reimburse the full amount
      writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: escrowAbi,
        functionName: 'reimburse',
        args: [booking.transactionId, booking.amount],
        gas: BigInt(300000), // Set explicit gas limit for cancellation
      });
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Cancellation failed. The deadline may have passed or the transaction may not exist. Please check the contract state.');
    }
  };

  const handleExecuteTransaction = async (transactionId: bigint) => {
    try {
      writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: escrowAbi,
        functionName: 'executeTransaction',
        args: [transactionId],
        gas: BigInt(200000), // Set explicit gas limit for execution
      });
    } catch (error) {
      console.error('Error executing transaction:', error);
      alert('Transaction execution failed. Please try again.');
    }
  };

  const getTimeRemaining = (booking: Booking) => {
    const now = new Date();
    const bookingTime = booking.createdAt;
    const timeDiff = 300 - (now.getTime() - bookingTime.getTime()) / 1000; // remaining seconds
    
    if (timeDiff <= 0) return 'Expired';
    
    const mins = Math.floor(timeDiff / 60);
    const secs = Math.floor(timeDiff % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      
      {bookings.length === 0 ? (
        <p className="no-bookings">You have no bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const canCancel = booking.status === 'pending' && 
              (new Date().getTime() - booking.createdAt.getTime()) / 1000 < 300;
            
            return (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <h3>Class ID: {booking.classId}</h3>
                  <p>Transaction ID: {booking.transactionId.toString()}</p>
                  <p>Amount: {formatEther(booking.amount)} ETH ({booking.amount.toString()} wei)</p>
                  <p>Status: <span className={`status ${booking.status}`}>{booking.status}</span></p>
                  <p>Booked: {booking.createdAt.toLocaleString()}</p>
                  <p>Buyer: {booking.buyer}</p>
                  <p>Seller: {booking.seller}</p>
                  {booking.status === 'pending' && (
                    <p>Cancellation window: {getTimeRemaining(booking)}</p>
                  )}
                  {booking.status === 'pending' && getTimeRemaining(booking) === 'Expired' && (
                    <p className="info-text">💡 After cancellation period expires, funds are held in escrow until the instructor claims them.</p>
                  )}
                  <p className="debug-info" style={{fontSize: '0.8em', color: '#999'}}>
                    Debug: Current user: {address} | Is buyer: {address?.toLowerCase() === booking.buyer.toLowerCase() ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div className="booking-actions">
                  {canCancel && (
                    <button
                      className="cancel-booking-btn"
                      onClick={() => handleCancelBooking(booking)}
                      disabled={isPending || isConfirming}
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.status === 'confirmed' && new Date() > booking.deadline && (
                    <button
                      className="execute-btn"
                      onClick={() => handleExecuteTransaction(booking.transactionId)}
                      disabled={isPending || isConfirming}
                    >
                      Complete Transaction
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}