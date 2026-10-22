'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, X, AlertCircle } from 'lucide-react';
import { 
  INDIAN_STATES_AND_UT, 
  STATE_CITIES_MAP, 
  COMMON_PINCODES, 
  PostalLocation 
} from '../../lib/indiaLocationData';

interface AddressLocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  selectedPinCode: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onPinCodeChange: (pincode: string) => void;
  stateError?: string;
  cityError?: string;
  pinCodeError?: string;
}

export function AddressLocationSelector({
  selectedState,
  selectedCity,
  selectedPinCode,
  onStateChange,
  onCityChange,
  onPinCodeChange,
  stateError,
  cityError,
  pinCodeError
}: AddressLocationSelectorProps) {
  // Dropdown open states
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  // Search queries
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [pinSearch, setPinSearch] = useState('');

  // Async data & loading
  const [isLoadingPostal, setIsLoadingPostal] = useState(false);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [cityPincodes, setCityPincodes] = useState<string[]>([]);
  const [matchingLocations, setMatchingLocations] = useState<PostalLocation[]>([]);
  const [multiLocationModalOpen, setMultiLocationModalOpen] = useState(false);

  // Container refs for click-outside detection
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityOpen(false);
      }
      if (pinRef.current && !pinRef.current.contains(event.target as Node)) {
        setPinOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When city changes, load valid PIN codes for that city
  useEffect(() => {
    if (!selectedCity) {
      setCityPincodes([]);
      return;
    }

    let isMounted = true;
    const offlinePins = COMMON_PINCODES[selectedCity] || [];
    setCityPincodes(offlinePins);

    // Fetch complete list from API for full coverage
    const fetchCityPins = async () => {
      try {
        const res = await fetch(`/api/location/postal?city=${encodeURIComponent(selectedCity)}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.records) && data.records.length > 0) {
          // Filter records matching current state if available
          const filtered = selectedState 
            ? data.records.filter((r: PostalLocation) => r.state.toLowerCase() === selectedState.toLowerCase())
            : data.records;

          const uniquePins = Array.from(new Set(
            (filtered.length > 0 ? filtered : data.records).map((r: PostalLocation) => r.pincode)
          )) as string[];

          if (uniquePins.length > 0) {
            setCityPincodes(uniquePins.sort());
          }
        }
      } catch (err) {
        // Fallback to offlinePins already set
      }
    };

    fetchCityPins();

    return () => {
      isMounted = false;
    };
  }, [selectedCity, selectedState]);

  // Handle State Selection
  const handleSelectState = (state: string) => {
    onStateChange(state);
    setStateOpen(false);
    setStateSearch('');
    // Clear incompatible city and pin code
    onCityChange('');
    onPinCodeChange('');
    setCityPincodes([]);
    setPostalError(null);
  };

  // Handle City Selection
  const handleSelectCity = (city: string) => {
    onCityChange(city);
    setCityOpen(false);
    setCitySearch('');
    // Clear PIN code when city changes
    onPinCodeChange('');
    setPostalError(null);
  };

  // Process reverse lookup when 6-digit PIN code is selected or entered
  const handleLookupPinCode = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) return;

    setIsLoadingPostal(true);
    setPostalError(null);

    try {
      const res = await fetch(`/api/location/postal?pincode=${pin}`);
      const data = await res.json();

      if (!data.success || !Array.isArray(data.records) || data.records.length === 0) {
        setPostalError(`No postal records found for PIN code ${pin}. Please verify.`);
        setIsLoadingPostal(false);
        return;
      }

      const records: PostalLocation[] = data.records;

      // Check unique states and districts
      const uniqueStates = Array.from(new Set(records.map(r => r.state)));
      const uniqueDistricts = Array.from(new Set(records.map(r => r.district)));

      // If unambiguous (all post offices are in the same district and state)
      if (uniqueStates.length === 1 && uniqueDistricts.length === 1) {
        const targetState = uniqueStates[0];
        const targetDistrict = uniqueDistricts[0];

        // Find canonical state name
        const matchedState = INDIAN_STATES_AND_UT.find(
          s => s.toLowerCase() === targetState.toLowerCase()
        ) || targetState;

        // Find canonical city in state or use district
        const citiesInState = STATE_CITIES_MAP[matchedState] || [];
        const matchedCity = citiesInState.find(
          c => c.toLowerCase() === targetDistrict.toLowerCase() || targetDistrict.toLowerCase().includes(c.toLowerCase())
        ) || targetDistrict;

        onStateChange(matchedState);
        onCityChange(matchedCity);
        onPinCodeChange(pin);
      } else {
        // Multiple localities/districts associated with this PIN
        setMatchingLocations(records);
        setMultiLocationModalOpen(true);
      }
    } catch (err: any) {
      setPostalError('Failed to fetch postal data. Please check your connection.');
    } finally {
      setIsLoadingPostal(false);
    }
  };

  // Handle PIN Code Selection from dropdown
  const handleSelectPinCode = (pin: string) => {
    onPinCodeChange(pin);
    setPinOpen(false);
    setPinSearch('');
    handleLookupPinCode(pin);
  };

  // User manually typing in PIN code search input
  const handlePinInputBlur = (value: string) => {
    const trimmed = value.trim();
    if (/^\d{6}$/.test(trimmed)) {
      onPinCodeChange(trimmed);
      handleLookupPinCode(trimmed);
    }
  };

  // User selects location from multi-location modal
  const handleSelectLocationCandidate = (candidate: PostalLocation) => {
    const matchedState = INDIAN_STATES_AND_UT.find(
      s => s.toLowerCase() === candidate.state.toLowerCase()
    ) || candidate.state;

    const citiesInState = STATE_CITIES_MAP[matchedState] || [];
    const matchedCity = citiesInState.find(
      c => c.toLowerCase() === candidate.district.toLowerCase() || candidate.district.toLowerCase().includes(c.toLowerCase())
    ) || candidate.district;

    onStateChange(matchedState);
    onCityChange(matchedCity);
    onPinCodeChange(candidate.pincode);
    setMultiLocationModalOpen(false);
    setMatchingLocations([]);
  };

  // Filter lists based on user search query
  const filteredStates = INDIAN_STATES_AND_UT.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const availableCities = selectedState ? (STATE_CITIES_MAP[selectedState] || []) : [];
  const filteredCities = availableCities.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredPincodes = cityPincodes.filter(p =>
    p.includes(pinSearch.trim())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. STATE DROPDOWN */}
      <div className="relative" ref={stateRef}>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
          State *
        </label>
        
        <div
          onClick={() => setStateOpen(prev => !prev)}
          className={`w-full glass-input text-xs flex items-center justify-between cursor-pointer py-2 px-3 ${
            stateError ? 'border-rose-500' : ''
          }`}
        >
          <span className={`truncate ${selectedState ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400'}`}>
            {selectedState || 'Search or select state'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>

        {stateError && <p className="text-rose-500 text-xs mt-1">{stateError}</p>}

        {/* State Dropdown Menu */}
        {stateOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border glass-panel backdrop-blur-xl shadow-2xl p-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-60 flex flex-col">
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-8 pr-2.5 py-1.5 text-xs glass-input outline-none"
                placeholder="Search state..."
                value={stateSearch}
                onChange={e => setStateSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
            
            <div className="overflow-y-auto space-y-0.5 grow">
              {filteredStates.length === 0 ? (
                <div className="text-center py-3 text-xs text-slate-400">No states found</div>
              ) : (
                filteredStates.map(state => {
                  const isSelected = selectedState === state;
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => handleSelectState(state)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span>{state}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. CITY DROPDOWN */}
      <div className="relative" ref={cityRef}>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
          City *
        </label>
        
        <div
          onClick={() => {
            if (selectedState) setCityOpen(prev => !prev);
          }}
          className={`w-full glass-input text-xs flex items-center justify-between py-2 px-3 ${
            !selectedState 
              ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900/40' 
              : 'cursor-pointer'
          } ${cityError ? 'border-rose-500' : ''}`}
        >
          <span className={`truncate ${selectedCity ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400'}`}>
            {selectedCity || (!selectedState ? 'Select state first' : 'Search or select city')}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>

        {cityError && <p className="text-rose-500 text-xs mt-1">{cityError}</p>}

        {/* City Dropdown Menu */}
        {cityOpen && selectedState && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border glass-panel backdrop-blur-xl shadow-2xl p-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-60 flex flex-col">
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-8 pr-2.5 py-1.5 text-xs glass-input outline-none"
                placeholder={`Search city in ${selectedState}...`}
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
            
            <div className="overflow-y-auto space-y-0.5 grow">
              {filteredCities.length === 0 ? (
                <div className="text-center py-3 text-xs text-slate-400">No cities found</div>
              ) : (
                filteredCities.map(city => {
                  const isSelected = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span>{city}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. PIN CODE DROPDOWN / AUTOCOMPLETE */}
      <div className="relative" ref={pinRef}>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            PIN Code *
          </label>
          {isLoadingPostal && (
            <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
            </span>
          )}
        </div>
        
        <div
          onClick={() => setPinOpen(prev => !prev)}
          className={`w-full glass-input text-xs flex items-center justify-between cursor-pointer py-2 px-3 ${
            pinCodeError || postalError ? 'border-rose-500' : ''
          }`}
        >
          <span className={`truncate font-mono ${selectedPinCode ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400'}`}>
            {selectedPinCode || 'Search or select PIN code'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>

        {pinCodeError && <p className="text-rose-500 text-xs mt-1">{pinCodeError}</p>}
        {postalError && <p className="text-amber-500 text-xs mt-1">{postalError}</p>}

        {/* PIN Code Dropdown Menu */}
        {pinOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border glass-panel backdrop-blur-xl shadow-2xl p-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-60 flex flex-col">
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-8 pr-2.5 py-1.5 text-xs glass-input font-mono outline-none"
                placeholder="Enter 6-digit PIN code..."
                value={pinSearch}
                maxLength={6}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPinSearch(val);
                  if (val.length === 6) {
                    handleSelectPinCode(val);
                  }
                }}
                onBlur={e => handlePinInputBlur(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
            
            <div className="overflow-y-auto space-y-0.5 grow">
              {filteredPincodes.length > 0 ? (
                <>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    {selectedCity ? `PIN Codes for ${selectedCity}` : 'Matching PIN Codes'}
                  </div>
                  {filteredPincodes.map(pin => {
                    const isSelected = selectedPinCode === pin;
                    return (
                      <button
                        key={pin}
                        type="button"
                        onClick={() => handleSelectPinCode(pin)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span>{pin}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                      </button>
                    );
                  })}
                </>
              ) : pinSearch.length === 6 ? (
                <button
                  type="button"
                  onClick={() => handleSelectPinCode(pinSearch)}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-blue-500 hover:bg-blue-500/10"
                >
                  Lookup postal data for PIN: <span className="font-bold font-mono">{pinSearch}</span>
                </button>
              ) : (
                <div className="text-center py-3 text-xs text-slate-400">
                  {selectedCity 
                    ? 'Type a 6-digit PIN code to map automatically'
                    : 'Select a City or type any 6-digit PIN code'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MULTI-LOCATION SELECTION MODAL */}
      {multiLocationModalOpen && matchingLocations.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border glass-panel p-5 shadow-2xl flex flex-col gap-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                  Multiple Locations for PIN: {matchingLocations[0]?.pincode}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setMultiLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multiple post offices and localities were found for this PIN code. Please select your exact locality:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {matchingLocations.map((loc, idx) => (
                <button
                  key={`${loc.name}-${idx}`}
                  type="button"
                  onClick={() => handleSelectLocationCandidate(loc)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs flex flex-col gap-0.5"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-100">{loc.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    District: <span className="font-semibold">{loc.district}</span> &bull; State: <span className="font-semibold">{loc.state}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={() => setMultiLocationModalOpen(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
