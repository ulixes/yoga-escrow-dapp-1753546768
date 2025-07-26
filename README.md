# Yoga Class Booking dApp

A minimalist decentralized application for booking yoga classes using the Kleros Escrow smart contract on Arbitrum Sepolia. The app features a 5-minute cancellation window for full refunds.

## Features

- 🧘 Book yoga classes with ETH payments
- 🔒 Secure escrow-based transactions
- ⏱️ 5-minute cancellation window for full refunds
- 💳 Connect wallet with RainbowKit
- 🎨 Minimalist, yoga-themed design

## Tech Stack

- React + TypeScript
- Vite
- Bun (package manager)
- wagmi + viem (Web3 integration)
- RainbowKit (wallet connection)
- Kleros Escrow Contract (Arbitrum Sepolia)

## Prerequisites

- [Bun](https://bun.sh/) installed
- MetaMask or another Web3 wallet
- Some Arbitrum Sepolia ETH for testing

## Setup

1. Clone the repository and navigate to the project:
```bash
cd yoga-escrow-dapp
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your values:
   - `VITE_WALLETCONNECT_PROJECT_ID`: Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
   - `VITE_YOGA_INSTRUCTOR_ADDRESS`: The wallet address that receives payments

5. Run the development server:
```bash
bun run dev
```

## Deployment to GitHub Pages

### Manual Deployment
```bash
bun run deploy
```

### Automatic Deployment
The app is configured with GitHub Actions for automatic deployment:
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings (Source: GitHub Actions)
3. Every push to `main` branch will automatically deploy to GitHub Pages

## Contract Details

- **Network**: Arbitrum Sepolia
- **Contract Address**: `0x5ef185810BCe41c03c9E5ca271B8C91F1024F953`
- **Contract Type**: Kleros Escrow Universal

## How It Works

1. **Connect Wallet**: Users connect their Web3 wallet through RainbowKit
2. **Browse Classes**: View available yoga classes with details and pricing
3. **Book a Class**: Select a class and confirm the booking with ETH payment
4. **5-Minute Window**: After booking, users have 5 minutes to cancel and receive a full refund
5. **Automatic Settlement**: After the cancellation window, funds are held until the class date
6. **Complete Transaction**: After the class, the instructor can claim the payment

## Key Features

### Escrow Protection
- Payments are held securely in the Kleros Escrow contract
- Automatic dispute resolution if needed
- Transparent transaction history

### Cancellation Policy
- 5-minute cancellation window after booking
- Full refund during the cancellation period
- No cancellations after the window expires

### Transaction Flow
1. Buyer creates a transaction with a 5-minute deadline
2. During this period, buyer can reimburse themselves
3. After deadline, seller can execute the transaction
4. If disputes arise, Kleros arbitration handles resolution

## Development

### Project Structure
```
src/
├── components/
│   ├── YogaClassCard.tsx    # Individual class display
│   ├── BookingModal.tsx     # Booking confirmation modal
│   └── MyBookings.tsx       # User's booking history
├── config/
│   ├── escrowAbi.ts        # Contract ABI and addresses
│   └── wagmi.ts            # Web3 configuration
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx                 # Main app component
└── App.css                 # Minimalist styling
```

### Testing on Arbitrum Sepolia

1. Get test ETH from [Arbitrum Sepolia Faucet](https://faucet.arbitrum.io/)
2. Connect to Arbitrum Sepolia network in your wallet
3. Use the app to book classes and test the cancellation feature

## Security Considerations

- Always verify the contract address before transactions
- The 5-minute window is enforced by the smart contract
- Funds are only released after the deadline passes
- Kleros provides decentralized arbitration for disputes

## License

MIT