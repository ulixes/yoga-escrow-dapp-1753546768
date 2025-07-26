import type { YogaClass } from '../types';

interface YogaClassCardProps {
  yogaClass: YogaClass;
  onBook: (classId: string) => void;
}

export default function YogaClassCard({ yogaClass, onBook }: YogaClassCardProps) {
  const isAvailable = yogaClass.currentParticipants < yogaClass.maxParticipants;
  
  return (
    <div className="yoga-class-card">
      <h3>{yogaClass.name}</h3>
      <p className="instructor">with {yogaClass.instructor}</p>
      <div className="class-details">
        <p className="duration">{yogaClass.duration} minutes</p>
        <p className="date">{yogaClass.date.toLocaleDateString()} at {yogaClass.date.toLocaleTimeString()}</p>
        <p className="spots">
          {yogaClass.currentParticipants}/{yogaClass.maxParticipants} spots filled
        </p>
      </div>
      <div className="price-section">
        <p className="price">{(Number(yogaClass.price) / 1e18).toFixed(4)} ETH</p>
        <button 
          className="book-button"
          onClick={() => onBook(yogaClass.id)}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Book Class' : 'Fully Booked'}
        </button>
      </div>
    </div>
  );
}