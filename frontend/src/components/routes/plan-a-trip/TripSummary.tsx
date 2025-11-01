import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TripItinerary } from "./types";
import { format, addDays } from "date-fns";

interface TripSummaryProps {
  itinerary: TripItinerary;
  onStartDateChange: (date: Date) => void;
  onSave?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

const TripSummary: React.FC<TripSummaryProps> = ({
  itinerary,
  onStartDateChange,
  onSave,
  onShare,
  onPrint,
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());

  useEffect(() => {
    onStartDateChange(startDate);
  }, [startDate, onStartDateChange]);

  const endDate = addDays(startDate, itinerary.duration - 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">{itinerary.destination}</h3>
            <p className="text-gray-600">
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </p>
          </div>
          <div className="space-x-2">
            {onSave && (
              <button
                onClick={onSave}
                className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
              >
                Save
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="px-4 py-2 text-sm rounded-md bg-secondary text-white hover:bg-secondary/90"
              >
                Share
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Print
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{itinerary.duration} Days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Group</p>
            <p className="font-medium">{itinerary.travelers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget Category</p>
            <p className="font-medium">{itinerary.budget}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="font-medium">{formatCurrency(itinerary.totalEstimatedCost)}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Trip Start Date</p>
          <input
            type="date"
            value={format(startDate, "yyyy-MM-dd")}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="px-3 py-2 border rounded-md w-full max-w-xs"
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TripSummary;