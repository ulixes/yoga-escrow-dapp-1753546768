import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, decodeEventLog } from 'viem';
import type { YogaClass } from '../types';
import { escrowAbi, ESCROW_CONTRACT_ADDRESS, YOGA_INSTRUCTOR_ADDRESS } from '../config/escrowAbi';

interface BookingModalProps {
  yogaClass: YogaClass | null;
  onClose: () => void;
  onSuccess: (transactionId: bigint) => void;
}

export default function BookingModal({ yogaClass, onClose, onSuccess }: BookingModalProps) {
  const { address } = useAccount();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!yogaClass) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [yogaClass]);

  const handleBooking = async () => {
    if (!yogaClass || !address) return;

    // Calculate deadline: current time + 5 minutes
    const deadline = Math.floor(Date.now() / 1000) + 300;
    
    // Create transaction URI with class details
    const transactionUri = JSON.stringify({
      type: 'yoga_class_booking',
      classId: yogaClass.id,
      className: yogaClass.name,
      instructor: yogaClass.instructor,
      date: yogaClass.date.toISOString(),
      duration: yogaClass.duration,
    });

    try {
      writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: escrowAbi,
        functionName: 'createNativeTransaction',
        args: [
          BigInt(deadline),
          transactionUri,
          YOGA_INSTRUCTOR_ADDRESS,
        ],
        value: yogaClass.price,
        gas: BigInt(500000), // Set explicit gas limit to prevent estimation issues
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Transaction failed. Please try again or check your wallet balance.');
    }
  };

  useEffect(() => {
    if (isSuccess && receipt) {
      try {
        // Extract transaction ID from the NativeTransactionCreated event
        const logs = receipt.logs;
        for (const log of logs) {
          try {
            const decodedLog = decodeEventLog({
              abi: escrowAbi,
              data: log.data,
              topics: log.topics,
            });
            
            if (decodedLog.eventName === 'NativeTransactionCreated') {
              const transactionId = decodedLog.args._transactionID as bigint;
              onSuccess(transactionId);
              onClose();
              return;
            }
          } catch (error) {
            // Skip logs that don't match our ABI
            continue;
          }
        }
        
        // Fallback if no event found
        console.warn('NativeTransactionCreated event not found in logs');
        const fallbackId = BigInt(Date.now());
        onSuccess(fallbackId);
        onClose();
      } catch (error) {
        console.error('Error parsing transaction receipt:', error);
        const fallbackId = BigInt(Date.now());
        onSuccess(fallbackId);
        onClose();
      }
    }
  }, [isSuccess, receipt, onSuccess, onClose]);

  if (!yogaClass) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Book Yoga Class</h2>
        
        <div className="booking-details">
          <h3>{yogaClass.name}</h3>
          <p>Instructor: {yogaClass.instructor}</p>
          <p>Date: {yogaClass.date.toLocaleDateString()}</p>
          <p>Time: {yogaClass.date.toLocaleTimeString()}</p>
          <p>Duration: {yogaClass.duration} minutes</p>
          <p className="price">Price: {formatEther(yogaClass.price)} ETH</p>
        </div>

        <div className="cancellation-info">
          <p className="info-text">
            You have 5 minutes to cancel your booking and receive a full refund.
          </p>
          <p className="timer">
            Time remaining to book: <strong>{formatTime(timeLeft)}</strong>
          </p>
        </div>

        <div className="modal-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isPending || isConfirming}
          >
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleBooking}
            disabled={isPending || isConfirming || timeLeft === 0}
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}