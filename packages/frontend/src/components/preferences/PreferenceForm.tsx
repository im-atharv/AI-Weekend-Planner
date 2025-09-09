import React, { useState, useEffect, useRef, useReducer } from "react";
import type { Preferences } from "shared/types";
import {
  SparklesIcon,
  ArrowRightIcon,
  LocationIcon,
  EditIcon,
  CalendarIcon,
} from "@/assets/icons";
import { LocationMapModal } from "./LocationMapModal";
import {
  getAddressFromCoordinates,
  getAddressSuggestions,
} from "@/services/locationService";
import { useDebounce } from "@/hooks/useDebounce";

declare const L: any;

interface PreferenceFormProps {
  onSubmit: (preferences: Preferences) => void;
}

type OptionType = { id: string; label: string };

const paceOptions: OptionType[] = [
    { id: 'leisurely', label: 'Leisurely'},
    { id: 'balanced', label: 'Balanced'},
    { id: 'packed', label: 'Packed'},
]
const vibeOptions: OptionType[] = [
  { id: 'relaxing', label: 'Relaxing' }, { id: 'adventurous', label: 'Adventurous' }, { id: 'party', label: 'Party' }, { id: 'family-friendly', label: 'Family-Friendly' }, { id: 'foodie', label: 'Foodie'}, { id: 'cultural', label: 'Cultural'},
];
const budgetOptions: OptionType[] = [
  { id: 'Under ₹3,000', label: '< ₹3k' }, { id: '₹3,000 - ₹5,000', label: '₹3k - ₹5k' }, { id: '₹5,000 - ₹10,000', label: '₹5k - ₹10k' }, { id: 'Above ₹10,000', label: '₹10k+' },
];
const interestOptions: OptionType[] = [
  { id: 'live-music', label: 'Live Music' }, { id: 'fine-dining', label: 'Fine Dining' }, { id: 'shopping', label: 'Shopping' }, { id: 'outdoor-activities', label: 'Outdoor Activities' }, { id: 'art-and-culture', label: 'Art & Culture' }, { id: 'nightlife', label: 'Nightlife' }, { id: 'spa-and-wellness', label: 'Spa & Wellness' }, { id: 'history-and-heritage', label: 'History & Heritage' }, { id: 'nature-and-parks', label: 'Nature & Parks' },
];
const groupOptions: OptionType[] = [
    { id: 'solo', label: 'Solo' }, { id: 'couple', label: 'Couple'}, { id: 'small-group', label: 'Small Group (3-5)'}, { id: 'large-group', label: 'Large Group (5+)'},
];
const distanceOptions: OptionType[] = [
    { id: '5 km', label: '< 5 km' }, { id: '15 km', label: '5-15 km' }, { id: '30 km', label: '15-30+ km' },
];
const dietaryOptions: OptionType[] = [
    { id: 'vegetarian', label: 'Vegetarian' }, { id: 'vegan', label: 'Vegan' }, { id: 'gluten-free', label: 'Gluten-Free' },
];
const occasionOptions: OptionType[] = [
    { id: 'casual-weekend', label: 'Casual Weekend' }, { id: 'romantic-getaway', label: 'Romantic Getaway' }, { id: 'celebration', label: 'Celebration' }, { id: 'family-trip', label: 'Family Trip' },
];
const accommodationOptions: OptionType[] = [
    { id: 'luxury-hotel', label: 'Luxury Hotel' }, { id: 'boutique-hotel', label: 'Boutique Hotel' }, { id: 'airbnb-homestay', label: 'Airbnb/Homestay' }, { id: 'not-required', label: 'Not Required' },
];
const transportationOptions: OptionType[] = [
    { id: 'own-vehicle', label: 'Own Vehicle' }, { id: 'ride-sharing', label: 'Ride-Sharing' }, { id: 'public-transport', label: 'Public Transport' }, { id: 'walking', label: 'Walking' },
];

const isLocationServiceConfigured = !!process.env.GEOAPIFY_API_KEY;

type FormState = Omit<Preferences, "location" | "dates">;
type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; payload: any }
  | {
      type: "TOGGLE_ARRAY_ITEM";
      field: "interests" | "dietaryNeeds" | "accommodation";
      payload: string;
    };

const initialFormState: FormState = {
  pace: "balanced",
  vibe: "relaxing",
  budget: "₹5,000 - ₹10,000",
  interests: ["fine-dining"],
  dietaryNeeds: [],
  group: "couple",
  distance: "15 km",
  occasion: "casual-weekend",
  accommodation: ["not-required"],
  transportation: "ride-sharing",
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.payload };
    case "TOGGLE_ARRAY_ITEM": {
      const currentArray = state[action.field] as string[];
      const newArray = currentArray.includes(action.payload)
        ? currentArray.filter((item) => item !== action.payload)
        : [...currentArray, action.payload];
      return { ...state, [action.field]: newArray };
    }
    default:
      return state;
  }
};

const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
  titleId: string;
}> = ({ title, children, titleId }) => (
  <div className="space-y-4 border-t border-slate-700 pt-6 first:border-t-0 first:pt-0">
    <label id={titleId} className="text-xl font-semibold text-white">
      {title}
    </label>
    {children}
  </div>
);

const CustomRadio = ({
  options,
  selected,
  onChange,
  labelledby,
}: {
  options: OptionType[];
  selected: string;
  onChange: (value: string) => void;
  labelledby: string;
}) => (
  <div role="radiogroup" aria-labelledby={labelledby} className="flex flex-wrap gap-2">
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        role="radio"
        aria-checked={selected === option.id}
        onClick={() => onChange(option.id)}
        className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border ${
          selected === option.id
            ? "bg-sky-600 border-sky-600 text-white font-semibold"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const CustomCheckbox = ({
  options,
  selected,
  onChange,
  labelledby,
}: {
  options: OptionType[];
  selected: string[];
  onChange: (id: string) => void;
  labelledby: string;
}) => (
  <div
    role="group"
    aria-labelledby={labelledby}
    className="flex flex-wrap gap-2"
  >
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        role="checkbox"
        aria-checked={selected.includes(option.id)}
        onClick={() => onChange(option.id)}
        className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border ${
          selected.includes(option.id)
            ? "bg-sky-600 border-sky-600 text-white font-semibold"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const PreferenceForm: React.FC<PreferenceFormProps> = ({ onSubmit }) => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const debouncedAddress = useDebounce(addressInput, 500);
  const [suggestions, setSuggestions] = useState<
    { description: string; latitude: number; longitude: number }[]
  >([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<{ start: string; end: string } | null>(
    null
  );
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const mapPreviewRef = useRef<any>(null);

  const handleSetLocation = (lat: number, lon: number, addr: string) => {
    setLocation({ latitude: lat, longitude: lon, address: addr });
    setLocationStatus("success");
  };

  useEffect(() => {
    if (location && document.getElementById("map-preview")) {
      if (mapPreviewRef.current) mapPreviewRef.current.remove();

      const map = L.map("map-preview", {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([location.latitude, location.longitude], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([location.latitude, location.longitude]).addTo(map);
      mapPreviewRef.current = map;
    }
    return () => {
      if (mapPreviewRef.current) {
        mapPreviewRef.current.remove();
        mapPreviewRef.current = null;
      }
    };
  }, [location, locationStatus]);

  const handleDetectLocation = () => {
    setLocationStatus("locating");
    setLocationError(null);
    setAddressInput("");
    setSuggestions([]);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const addr = await getAddressFromCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          handleSetLocation(
            position.coords.latitude,
            position.coords.longitude,
            addr
          );
          setAddressInput(addr);
        } catch {
          setLocationStatus("error");
          setLocationError("Could not fetch address for your location.");
        }
      },
      (error: GeolocationPositionError) => {
        setLocationStatus("error");
        let userMessage = "Could not access location. Please try again.";
        if (error.code === error.PERMISSION_DENIED)
          userMessage =
            "Location access was denied. Please enable it in your browser settings.";
        if (error.code === error.POSITION_UNAVAILABLE)
          userMessage =
            "Your location could not be determined. Please check your device settings.";
        if (error.code === error.TIMEOUT)
          userMessage = "Getting your location took too long. Please try again.";
        setLocationError(userMessage);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    if (debouncedAddress && debouncedAddress.length > 3) {
      const fetchSuggestions = async () => {
        setIsSuggestionsLoading(true);
        try {
          const results = await getAddressSuggestions(debouncedAddress);
          setSuggestions(results);
        } catch (error) {
          console.error("Failed to fetch address suggestions", error);
          setSuggestions([]);
        } finally {
          setIsSuggestionsLoading(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedAddress]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: {
    description: string;
    latitude: number;
    longitude: number;
  }) => {
    const { description: address, latitude, longitude } = suggestion;
    setAddressInput(address);
    setSuggestions([]);
    handleSetLocation(latitude, longitude, address);
  };

  const handleDateSelect = (date: Date) => {
    const dayOfWeek = date.getDay();
    const start = new Date(date);
    const diff = (dayOfWeek + 2) % 7;
    start.setDate(start.getDate() - diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 2);
    setDates({
      start: start.toLocaleDateString("en-CA"),
      end: end.toLocaleDateString("en-CA"),
    });
    setCalendarOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.interests.length === 0 || !location || !dates) return;
    onSubmit({ ...formState, location, dates });
  };

  const handleMapSave = async (newLocation: { lat: number; lng: number }) => {
    const addr = await getAddressFromCoordinates(
      newLocation.lat,
      newLocation.lng
    );
    handleSetLocation(newLocation.lat, newLocation.lng, addr);
    setAddressInput(addr);
    setMapModalOpen(false);
  };

  const isFormReady =
    isLocationServiceConfigured &&
    formState.interests.length > 0 &&
    locationStatus === "success" &&
    !!dates;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="1. Choose your weekend" titleId="weekend-dates">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCalendarOpen(!isCalendarOpen)}
                aria-haspopup="true"
                aria-expanded={isCalendarOpen}
                className="w-full flex items-center justify-between bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-sky-400" />
                  <div>
                    <span className="font-semibold text-white">
                      {dates
                        ? `${new Date(
                            dates.start + "T00:00:00"
                          ).toDateString()} - ${new Date(
                            dates.end + "T00:00:00"
                          ).toDateString()}`
                        : "Select your dates"}
                    </span>
                    <p className="text-xs text-slate-400">
                      The AI will find events for these dates.
                    </p>
                  </div>
                </div>
              </button>
              {isCalendarOpen && <Calendar onSelectDate={handleDateSelect} />}
            </div>
          </FormSection>

          <FormSection title="2. Set your location" titleId="location-set">
            {!isLocationServiceConfigured ? (
              <div className="bg-slate-700/50 p-4 rounded-lg border border-amber-500/30 text-center">
                <p className="text-amber-400 font-semibold">
                  Location Service Not Configured
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  A Geoapify API key is required. Set{" "}
                  <code className="bg-slate-900 px-1 py-0.5 rounded">
                    GEOAPIFY_API_KEY
                  </code>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locationStatus === "locating"}
                  className="flex items-center justify-center gap-2 w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-300 border bg-slate-700 border-slate-600 hover:bg-slate-600 disabled:opacity-50"
                >
                  <LocationIcon />
                  <span>
                    {locationStatus === "locating"
                      ? "Detecting..."
                      : "Detect My Location"}
                  </span>
                </button>
                <div className="flex items-center text-xs text-slate-500">
                  <span className="flex-grow border-t border-slate-700"></span>
                  <span className="px-2">OR</span>
                  <span className="flex-grow border-t border-slate-700"></span>
                </div>
                <div className="relative" ref={suggestionsContainerRef}>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setLocationStatus("idle");
                      setLocation(null);
                    }}
                    placeholder="Type an address or landmark..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {isSuggestionsLoading && (
                    <p className="text-xs text-amber-400 text-center mt-2">
                      Searching...
                    </p>
                  )}
                  {suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-slate-700 border border-slate-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {suggestions.map((s, index) => (
                        <li
                          key={`${s.description}-${index}`}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-2 cursor-pointer hover:bg-sky-600 text-sm"
                        >
                          {s.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {locationStatus === "error" && (
                  <p className="text-xs text-red-400 text-center">
                    {locationError}
                  </p>
                )}
                {locationStatus === "success" && location && (
                  <div className="text-center pt-3 border-t border-slate-700">
                    <p className="font-semibold text-green-400 text-sm">
                      Location Set
                    </p>
                    <p className="text-xs text-slate-300 my-1">
                      {location.address}
                    </p>
                    <div
                      id="map-preview"
                      className="h-24 w-full rounded-lg my-2 border border-slate-600 bg-slate-700"
                      style={{ filter: "invert(1) hue-rotate(180deg)" }}
                    ></div>
                    <button
                      type="button"
                      onClick={() => setMapModalOpen(true)}
                      className="flex items-center justify-center gap-1 mx-auto text-xs text-sky-400 hover:underline"
                    >
                      <EditIcon className="w-3 h-3" /> Adjust
                    </button>
                  </div>
                )}
              </div>
            )}
          </FormSection>
        </div>

        <FormSection
          title="3. Describe your ideal weekend"
          titleId="weekend-description"
        >
          <div className="space-y-6">
            <div>
              <label
                id="occasion-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Occasion
              </label>
              <CustomRadio
                options={occasionOptions}
                selected={formState.occasion}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "occasion", payload: val })
                }
                labelledby="occasion-label"
              />
            </div>
            <div>
              <label
                id="pace-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Pace
              </label>
              <CustomRadio
                options={paceOptions}
                selected={formState.pace}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "pace", payload: val })
                }
                labelledby="pace-label"
              />
            </div>
            <div>
              <label
                id="vibe-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Vibe
              </label>
              <CustomRadio
                options={vibeOptions}
                selected={formState.vibe}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "vibe", payload: val })
                }
                labelledby="vibe-label"
              />
            </div>
            <div>
              <label
                id="budget-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Budget (per person)
              </label>
              <CustomRadio
                options={budgetOptions}
                selected={formState.budget}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "budget", payload: val })
                }
                labelledby="budget-label"
              />
            </div>
            <div>
              <label
                id="radius-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Travel Radius
              </label>
              <CustomRadio
                options={distanceOptions}
                selected={formState.distance}
                onChange={(val) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "distance",
                    payload: val,
                  })
                }
                labelledby="radius-label"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="4. Tell us about your group & preferences"
          titleId="group-prefs"
        >
          <div className="space-y-6">
            <div>
              <label
                id="group-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Who's going?
              </label>
              <CustomRadio
                options={groupOptions}
                selected={formState.group}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "group", payload: val })
                }
                labelledby="group-label"
              />
            </div>
            <div>
              <label
                id="transport-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Transportation Mode
              </label>
              <CustomRadio
                options={transportationOptions}
                selected={formState.transportation}
                onChange={(val) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "transportation",
                    payload: val,
                  })
                }
                labelledby="transport-label"
              />
            </div>
            <div>
              <label
                id="accommodation-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Accommodation
              </label>
              <CustomCheckbox
                options={accommodationOptions}
                selected={formState.accommodation}
                onChange={(id) =>
                  dispatch({
                    type: "TOGGLE_ARRAY_ITEM",
                    field: "accommodation",
                    payload: id,
                  })
                }
                labelledby="accommodation-label"
              />
            </div>
            <div>
              <label
                id="dietary-label"
                className="text-base font-medium text-slate-300 mb-2 block"
              >
                Dietary needs?
              </label>
              <CustomCheckbox
                options={dietaryOptions}
                selected={formState.dietaryNeeds}
                onChange={(id) =>
                  dispatch({
                    type: "TOGGLE_ARRAY_ITEM",
                    field: "dietaryNeeds",
                    payload: id,
                  })
                }
                labelledby="dietary-label"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="5. What are your interests?" titleId="interests-section">
          <CustomCheckbox
            options={interestOptions}
            selected={formState.interests}
            onChange={(id) =>
              dispatch({
                type: "TOGGLE_ARRAY_ITEM",
                field: "interests",
                payload: id,
              })
            }
            labelledby="interests-section"
          />
          {formState.interests.length === 0 && (
            <p className="text-sm text-yellow-400">
              Please select at least one interest.
            </p>
          )}
        </FormSection>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormReady}
            className="w-full flex items-center justify-center gap-3 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:scale-100"
          >
            <SparklesIcon />
            <span>Curate My Weekend</span>
            <ArrowRightIcon />
          </button>
        </div>
      </form>
      {isMapModalOpen && location && (
        <LocationMapModal
          isOpen={isMapModalOpen}
          onClose={() => setMapModalOpen(false)}
          location={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          onSave={handleMapSave}
        />
      )}
    </>
  );
};

const Calendar: React.FC<{ onSelectDate: (date: Date) => void }> = ({
  onSelectDate,
}) => {
  const [date, setDate] = useState(new Date());

  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();

  const daysInMonth = Array.from(
    { length: endOfMonth.getDate() },
    (_, i) => i + 1
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg z-20 w-72">
      <div className="flex justify-between items-center mb-2">
        <button
          aria-label="Previous month"
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}
        >
          &lt;
        </button>
        <span className="font-semibold">
          {date.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          aria-label="Next month"
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}
        {daysInMonth.map((day) => {
          const d = new Date(date.getFullYear(), date.getMonth(), day);
          const isPast = d < today;
          const dayOfWeek = d.getDay();
          const isWeekend = [0, 5, 6].includes(dayOfWeek);
          const isDisabled = isPast || !isWeekend;
          return (
            <button
              key={day}
              onClick={() => !isDisabled && onSelectDate(d)}
              disabled={isDisabled}
              className={`p-2 text-sm rounded-full ${
                isDisabled
                  ? "text-slate-600 cursor-not-allowed"
                  : "hover:bg-sky-600"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};