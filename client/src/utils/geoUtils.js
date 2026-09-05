/**
 * Client GPS Geolocation & Haversine Distance Utilities
 */

/**
 * Get current browser GPS location with high accuracy
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Failed to obtain GPS location.';
        if (err.code === 1) msg = 'Location permission was denied. Please allow location access in browser settings.';
        else if (err.code === 2) msg = 'Location position unavailable. Please ensure GPS/Location is turned on.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  });
};

/**
 * Calculate distance between two GPS points in meters
 */
export const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null
  ) {
    return Infinity;
  }

  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Format meters to friendly string
 */
export const formatDistance = (meters) => {
  if (meters === undefined || meters === null || isNaN(meters) || meters === Infinity) {
    return 'Distance unknown';
  }
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
};

/**
 * Format total minutes to hours and minutes
 */
export const formatWorkingMinutes = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};
