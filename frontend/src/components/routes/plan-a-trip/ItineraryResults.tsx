import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, Tag, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Map } from '@/components/ui/map';
import type { TripItinerary } from './types';

interface ItineraryResultsProps {
  itinerary: TripItinerary;
  onSave?: () => void;
  onShare?: () => void;
}

export default function ItineraryResults({ itinerary, onSave, onShare }: ItineraryResultsProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapCenter, setMapCenter] = useState(() => {
    const firstLocation = itinerary.dailyItinerary[0]?.activities[0]?.location?.coordinates;
    return firstLocation || { lat: 20.5937, lng: 78.9629 }; // Default to center of India
  });

  const handleActivityClick = (coordinates: { lat: number; lng: number }) => {
    setMapCenter(coordinates);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-4">{itinerary.destination}</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{itinerary.budget}</span>
            </div>
            {itinerary.travelTips.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{itinerary.travelTips.length} Travel Tips</span>
              </div>
            )}
          </div>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {itinerary.dailyItinerary.map((day, index) => (
            <AccordionItem key={index} value={`day-${index + 1}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-medium">Day {index + 1}</span>
                  <span className="text-sm text-muted">
                    {format(new Date(day.date), 'EEEE, MMM d')}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {day.activities.map((activity, activityIndex) => (
                    <motion.div
                      key={activityIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: activityIndex * 0.1 }}
                      className={`p-4 rounded-lg cursor-pointer transition-colors
                        ${activity.type === 'meal' ? 'bg-orange-500/10' :
                          activity.type === 'attraction' ? 'bg-blue-500/10' :
                          activity.type === 'transport' ? 'bg-green-500/10' :
                          'bg-purple-500/10'}`}
                      onClick={() => activity.location?.coordinates && handleActivityClick(activity.location.coordinates)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 text-sm text-muted">
                          {activity.time}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-sm text-muted mt-1">
                            {activity.description}
                          </p>
                          {activity.location && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                              <MapPin className="w-4 h-4" />
                              <span>{activity.location.address}</span>
                            </div>
                          )}
                          {activity.duration && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted">
                              <Clock className="w-4 h-4" />
                              <span>{activity.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {(onSave || onShare) && (
          <div className="flex gap-4 mt-6">
            {onSave && (
              <Button onClick={onSave} className="flex-1">
                Save Itinerary
              </Button>
            )}
            {onShare && (
              <Button variant="outline" onClick={onShare} className="flex-1">
                Share
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="h-[calc(100vh-2rem)] sticky top-4">
        <Map
          center={mapCenter}
          markers={itinerary.dailyItinerary.flatMap(day =>
            day.activities
              .filter(activity => activity.location?.coordinates)
              .map(activity => ({
                position: activity.location.coordinates,
                title: activity.name,
                description: activity.description
              }))
          )}
        />
      </div>
    </div>
  );
}