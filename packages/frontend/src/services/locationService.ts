const apiKey = process.env.GEOAPIFY_API_KEY;

export const getAddressFromCoordinates = async (
  lat: number,
  lon: number
): Promise<string> => {
  if (!apiKey) {
    console.error(
      "Geoapify API key is missing. Please set the GEOAPIFY_API_KEY environment variable."
    );
    throw new Error("Geoapify API key is not configured.");
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch address from Geoapify API");
    }
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.formatted;
    }
    console.warn("Geoapify reverse geocoding returned no results:", data);
    return "Address not found";
  } catch (error) {
    console.error("Geoapify reverse geocoding error:", error);
    throw new Error("Could not fetch address for the given coordinates.");
  }
};

export const getAddressSuggestions = async (
  query: string
): Promise<{ description: string; latitude: number; longitude: number }[]> => {
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query
      )}&apiKey=${apiKey}&limit=5`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch suggestions from Geoapify API. Status: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features.map((feature: any) => ({
        description: feature.properties.formatted,
        latitude: feature.properties.lat,
        longitude: feature.properties.lon,
      }));
    }

    return [];
  } catch (error) {
    console.error("Geoapify address suggestion error:", error);
    throw new Error("Could not fetch address suggestions.");
  }
};