import { DragEventHandler, useState } from 'react';
import { Activity, DayItinerary, TripItinerary } from './types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  MapPin,
  Clock,
  DollarSign,
  Coffee,
  Utensils,
  Moon,
  GripVertical
} from 'lucide-react';

interface ActivityItemProps {
  activity: Activity;
  onDragStart: DragEventHandler<HTMLDivElement>;
  onDragEnd: DragEventHandler<HTMLDivElement>;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  onDragStart, 
  onDragEnd,
  onDragOver,
  onDrop 
}) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'meal':
        return <Utensils className="w-4 h-4" />;
      case 'accommodation':
        return <Moon className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-start gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-move"
    >
      <div className="flex-none cursor-grab">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h4 className="font-medium text-sm">{activity.name}</h4>
        </div>
        {activity.description && (
          <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-2">
          {activity.time && (
            <div className="flex items-center text-xs text-gray-500 gap-1">
              <Clock className="w-3 h-3" />
              {activity.time}
            </div>
          )}
          {activity.cost && (
            <div className="flex items-center text-xs text-gray-500 gap-1">
              <DollarSign className="w-3 h-3" />
              ₹{activity.cost}
            </div>
          )}
          {activity.location && (
            <div className="flex items-center text-xs text-gray-500 gap-1">
              <MapPin className="w-3 h-3" />
              {activity.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DayCardProps {
  day: DayItinerary;
  startDate?: Date;
  onActivityMove: (
    fromDay: number,
    toDay: number,
    fromIndex: number,
    toIndex: number
  ) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, startDate, onActivityMove }) => {
  const [draggedItem, setDraggedItem] = useState<{
    dayNumber: number;
    index: number;
  } | null>(null);

  const handleDragStart = (dayNumber: number, index: number) => {
    setDraggedItem({ dayNumber, index });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dayNumber: number, index: number) => {
    if (draggedItem) {
      onActivityMove(
        draggedItem.dayNumber,
        dayNumber,
        draggedItem.index,
        index
      );
      setDraggedItem(null);
    }
  };

  const dayDate = startDate 
    ? format(new Date(startDate.getTime() + (day.dayNumber - 1) * 24 * 60 * 60 * 1000), 'MMM d, yyyy')
    : undefined;

  const renderMeals = () => (
    <div className="space-y-2 mt-4">
      {day.meals.breakfast && (
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-600">{day.meals.breakfast}</span>
        </div>
      )}
      {day.meals.lunch && (
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-600">{day.meals.lunch}</span>
        </div>
      )}
      {day.meals.dinner && (
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">{day.meals.dinner}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day {day.dayNumber}</CardTitle>
        {dayDate && <CardDescription>{dayDate}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {day.activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onDragStart={(e) => handleDragStart(day.dayNumber, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day.dayNumber, index)}
            />
          ))}
        </div>
        {renderMeals()}
        {day.accommodation && (
          <div className="mt-4 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">{day.accommodation}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ItineraryViewProps {
  itinerary: TripItinerary;
  startDate?: Date;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary, startDate }) => {
  const [localItinerary, setLocalItinerary] = useState(itinerary);

  const handleActivityMove = (
    fromDay: number,
    toDay: number,
    fromIndex: number,
    toIndex: number
  ) => {
    const newItinerary = { ...localItinerary };
    const fromDayIndex = fromDay - 1;
    const toDayIndex = toDay - 1;

    const [movedActivity] = newItinerary.dailyItinerary[fromDayIndex].activities.splice(fromIndex, 1);
    newItinerary.dailyItinerary[toDayIndex].activities.splice(toIndex, 0, movedActivity);

    setLocalItinerary(newItinerary);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{itinerary.destination}</h1>
        <p className="text-gray-600">
          {itinerary.duration} Days • {itinerary.travelers} • {itinerary.budget}
        </p>
        <p className="mt-4 text-gray-700">{itinerary.overview}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {localItinerary.dailyItinerary.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            startDate={startDate}
            onActivityMove={handleActivityMove}
          />
        ))}
      </div>

      <div className="space-y-6">
        {itinerary.travelTips.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Travel Tips</h2>
            <ul className="list-disc list-inside space-y-2">
              {itinerary.travelTips.map((tip, index) => (
                <li key={index} className="text-gray-700">{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {itinerary.culturalNotes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Cultural Notes</h2>
            <ul className="list-disc list-inside space-y-2">
              {itinerary.culturalNotes.map((note, index) => (
                <li key={index} className="text-gray-700">{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-right font-semibold">
            Total Estimated Cost: ₹{itinerary.totalEstimatedCost.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;