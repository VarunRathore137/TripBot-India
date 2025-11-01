import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  markers?: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    description?: string;
  }>;
  zoom?: number;
}

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
});

export function Map({ center, markers = [], zoom = 13 }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    let map: google.maps.Map;
    let infoWindow: google.maps.InfoWindow;

    loader.load().then(() => {
      if (mapRef.current) {
        map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        infoWindow = new google.maps.InfoWindow();
        mapInstanceRef.current = map;

        // Add markers
        markers.forEach((marker) => {
          const mapMarker = new google.maps.Marker({
            position: marker.position,
            map,
            title: marker.title,
            animation: google.maps.Animation.DROP,
          });

          mapMarker.addListener('click', () => {
            infoWindow.setContent(`
              <div class="p-2">
                <h3 class="font-medium">${marker.title}</h3>
                ${marker.description ? `<p class="text-sm mt-1">${marker.description}</p>` : ''}
              </div>
            `);
            infoWindow.open(map, mapMarker);
          });

          markersRef.current.push(mapMarker);
        });
      }
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center]);

  // Update markers when they change
  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    if (mapInstanceRef.current) {
      // Add new markers
      markers.forEach((marker) => {
        const mapMarker = new google.maps.Marker({
          position: marker.position,
          map: mapInstanceRef.current,
          title: marker.title,
          animation: google.maps.Animation.DROP,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-medium">${marker.title}</h3>
              ${marker.description ? `<p class="text-sm mt-1">${marker.description}</p>` : ''}
            </div>
          `,
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, mapMarker);
        });

        markersRef.current.push(mapMarker);
      });
    }
  }, [markers]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
}