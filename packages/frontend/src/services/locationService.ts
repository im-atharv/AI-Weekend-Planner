const apiKey = process.env.GOOGLE_MAPS_API_KEY;

export const getAddressFromCoordinates = async (
  lat: number,
  lon: number
): Promise<string> => {
  if (!apiKey) {
    console.error(
      "Google Maps API key is missing. Please set the GOOGLE_MAPS_API_KEY environment variable."
    );
    throw new Error("Google Maps API key is not configured.");
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch address from Google Maps API");
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    console.warn("Google Maps reverse geocoding returned no results:", data);
    return "Address not found";
  } catch (error) {
    console.error("Google Maps reverse geocoding error:", error);
    throw new Error("Could not fetch address for the given coordinates.");
  }
};

export const getAddressSuggestions = async (
  query: string,
  autocompleteService: google.maps.places.AutocompleteService
): Promise<{ description: string; place_id: string }[]> => {
  if (!apiKey) return [];

  return new Promise((resolve, reject) => {
    autocompleteService.getPlacePredictions(
      { input: query, types: ["address"] },
      (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
          reject(new Error(`Failed to fetch suggestions from Google Maps API. Status: ${status}`));
        } else {
          resolve(
            predictions.map((p) => ({
              description: p.description,
              place_id: p.place_id,
            }))
          );
        }
      }
    );
  });
};

export const getCoordinatesFromPlaceId = async (
  placeId: string
): Promise<{ lat: number; lng: number }> => {
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured.");
  }
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch geocoding data from Google Maps API.");
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    throw new Error("Could not find location for the given place ID.");
  } catch (error) {
    console.error("Google Maps geocoding error:", error);
    throw error;
  }
};