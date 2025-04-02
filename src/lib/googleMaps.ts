
// Helper functions for Google Maps integration

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};

export const geocodeAddress = async (address: string): Promise<google.maps.LatLngLiteral | null> => {
  if (!window.google?.maps) {
    console.error('Google Maps not loaded');
    return null;
  }

  const geocoder = new google.maps.Geocoder();
  
  try {
    const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
    
    const location = response[0].geometry.location;
    return { lat: location.lat(), lng: location.lng() };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const createPath = (coordinates: google.maps.LatLngLiteral[]): google.maps.Polyline => {
  return new google.maps.Polyline({
    path: coordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
};
