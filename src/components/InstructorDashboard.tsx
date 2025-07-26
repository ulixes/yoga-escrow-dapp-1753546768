import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';
import { escrowAbi, ESCROW_CONTRACT_ADDRESS, YOGA_INSTRUCTOR_ADDRESS } from '../config/escrowAbi';

interface PendingPayment {
  transactionId: bigint;
  amount: bigint;
  buyer: string;
  deadline: bigint;
  canClaim: boolean;
}

export default function InstructorDashboard() {
  const { address } = useAccount();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  // Get total number of transactions from contract
  const { data: transactionCount } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: escrowAbi,
    functionName: 'getTransactionCount',
  });

  // Check if current user is the instructor
  const isInstructor = address?.toLowerCase() === YOGA_INSTRUCTOR_ADDRESS.toLowerCase();

  // Fetch instructor's pending payments
  useEffect(() => {
    if (!isInstructor || !transactionCount) return;

    const fetchPendingPayments = async () => {
      const payments: PendingPayment[] = [];
      const count = Number(transactionCount);

      for (let i = 0; i < count; i++) {
        try {
          // Read transaction data from contract
          const transactionData = await fetch(`https://api.arbiscan.io/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              module: 'contract',
              action: 'read',
              address: ESCROW_CONTRACT_ADDRESS,
              functionname: 'transactions',
              args: [i],
            })
          });

          // For now, we'll create mock data since we need a proper way to read contract state
          // In a real implementation, you'd use multicall or individual contract reads
        } catch (error) {
          console.error('Error fetching transaction:', error);
        }
      }

      setPendingPayments(payments);
    };

    fetchPendingPayments();
  }, [isInstructor, transactionCount]);

  const handleClaimPayment = async (transactionId: bigint) => {
    try {
      writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: escrowAbi,
        functionName: 'executeTransaction',
        args: [transactionId],
        gas: BigInt(200000),
      });
      
      console.log('Claiming payment for transaction:', transactionId.toString());
    } catch (error) {
      console.error('Error claiming payment:', error);
      alert('Failed to claim payment. Please try again.');
    }
  };

  if (!isInstructor) {
    return (
      <div className="instructor-dashboard">
        <h2>Instructor Dashboard</h2>
        <div className="not-instructor">
          <p>👨‍🏫 This dashboard is only available for the yoga instructor.</p>
          <p>Instructor wallet: <code>{YOGA_INSTRUCTOR_ADDRESS}</code></p>
          <p>Your wallet: <code>{address}</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      <h2>🧘‍♀️ Instructor Dashboard</h2>
      <p>Welcome! Here you can view and claim payments from completed yoga class bookings.</p>
      
      <div className="payments-section">
        <h3>Pending Payments</h3>
        
        {pendingPayments.length === 0 ? (
          <div className="no-payments">
            <p>No pending payments at the moment.</p>
            <p className="info-text">
              💡 Payments appear here after students book classes and the 5-minute cancellation window expires.
            </p>
          </div>
        ) : (
          <div className="payments-list">
            {pendingPayments.map((payment) => (
              <div key={payment.transactionId.toString()} className="payment-item">
                <div className="payment-info">
                  <h4>Transaction #{payment.transactionId.toString()}</h4>
                  <p>Amount: {formatEther(payment.amount)} ETH</p>
                  <p>From: {payment.buyer}</p>
                  <p>Status: {payment.canClaim ? 'Ready to claim' : 'Waiting for deadline'}</p>
                </div>
                
                <div className="payment-actions">
                  <button
                    className="claim-btn"
                    onClick={() => handleClaimPayment(payment.transactionId)}
                    disabled={!payment.canClaim || isPending || isConfirming}
                  >
                    {isPending ? 'Claiming...' : isConfirming ? 'Processing...' : 'Claim Payment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="instructor-info">
        <h3>How It Works</h3>
        <ol>
          <li>Students book yoga classes and pay into escrow</li>
          <li>Students have 5 minutes to cancel for a full refund</li>
          <li>After the cancellation window, payments become claimable</li>
          <li>Click "Claim Payment" to transfer funds to your wallet</li>
        </ol>
        
        <div className="contract-info">
          <p><strong>Contract:</strong> <code>{ESCROW_CONTRACT_ADDRESS}</code></p>
          <p><strong>Network:</strong> Arbitrum Sepolia</p>
        </div>
      </div>
    </div>
  );
}