import { createContext, useContext, useState, ReactNode } from 'react';

interface ItineraryContextType {
  itineraryData: any | null;
  setItineraryData: (data: any) => void;
  isGenerating: boolean;
  setIsGenerating: (state: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  const [itineraryData, setItineraryData] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ItineraryContext.Provider
      value={{
        itineraryData,
        setItineraryData,
        isGenerating,
        setIsGenerating,
        error,
        setError,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};