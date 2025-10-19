import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Interactive map component with markers, search, and multiple providers
 * @param {Object} props
 * @param {number} props.center - Map center [lat, lng]
 * @param {number} props.zoom - Initial zoom level
 * @param {Array} props.markers - Array of marker objects
 * @param {string} props.provider - Map provider ('openstreetmap' | 'google' | 'mapbox')
 * @param {string} props.apiKey - API key for paid providers
 * @param {boolean} props.searchable - Enable search functionality
 * @param {Function} props.onMarkerClick - Marker click handler
 * @param {Function} props.onMapClick - Map click handler
 * @param {Function} props.onSearch - Search result handler
 * @param {boolean} props.readOnly - Disable interactions
 * @param {string} props.height - Map height
 * @param {string} props.className - Additional CSS classes
 */
export const InteractiveMap = ({
  center = [-23.5505, -46.6333], // São Paulo, Brazil
  zoom = 13,
  markers = [],
  provider = 'openstreetmap',
  apiKey,
  searchable = true,
  onMarkerClick,
  onMapClick,
  onSearch,
  readOnly = false,
  height = '400px',
  className = '',
  ...props
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setMapError(null);

      let mapInstance;

      switch (provider) {
        case 'google':
          if (!window.google || !apiKey) {
            throw new Error('Google Maps API key required');
          }
          mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat: center[0], lng: center[1] },
            zoom: zoom,
            mapTypeId: 'roadmap',
            disableDefaultUI: readOnly,
            gestureHandling: readOnly ? 'none' : 'auto',
          });
          break;

        case 'mapbox':
          if (!apiKey) {
            throw new Error('Mapbox API key required');
          }
          // Mapbox implementation would go here
          throw new Error('Mapbox integration not implemented');

        case 'openstreetmap':
        default:
          // Simple OpenStreetMap-like implementation using Leaflet-style approach
          mapInstance = {
            center: center,
            zoom: zoom,
            markers: [],
            setView: (coords, zoomLevel) => {
              mapInstance.center = coords;
              mapInstance.zoom = zoomLevel;
            },
            addMarker: (lat, lng, options = {}) => {
              const marker = {
                lat,
                lng,
                ...options,
                id: Date.now() + Math.random(),
              };
              mapInstance.markers.push(marker);
              return marker;
            },
            removeMarker: (markerId) => {
              mapInstance.markers = mapInstance.markers.filter(m => m.id !== markerId);
            },
            on: (event, handler) => {
              if (!mapInstance.eventHandlers) {
                mapInstance.eventHandlers = {};
              }
              if (!mapInstance.eventHandlers[event]) {
                mapInstance.eventHandlers[event] = [];
              }
              mapInstance.eventHandlers[event].push(handler);
            },
            fire: (event, data) => {
              if (mapInstance.eventHandlers && mapInstance.eventHandlers[event]) {
                mapInstance.eventHandlers[event].forEach(handler => handler(data));
              }
            },
          };
          break;
      }

      mapInstanceRef.current = mapInstance;

      // Add initial markers
      markers.forEach(marker => addMarker(marker));

      setIsLoading(false);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error.message);
      setIsLoading(false);
    }

    return () => {
      // Cleanup map instance
      if (mapInstanceRef.current && provider === 'google') {
        // Google Maps cleanup would go here
      }
      mapInstanceRef.current = null;
    };
  }, [center, zoom, provider, apiKey, readOnly]);

  // Add marker to map
  const addMarker = useCallback((markerData) => {
    const map = mapInstanceRef.current;
    if (!map) return null;

    try {
      let marker;

      if (provider === 'google') {
        marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: map,
          title: markerData.title || markerData.popup,
          icon: markerData.icon,
        });

        if (markerData.popup) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.popup,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            onMarkerClick?.(markerData);
          });
        }
      } else {
        // Simple marker implementation for other providers
        marker = map.addMarker(markerData.lat, markerData.lng, {
          title: markerData.title || markerData.popup,
          popup: markerData.popup,
          icon: markerData.icon,
        });

        // Add click handler
        marker.addListener('click', () => {
          onMarkerClick?.(markerData);
        });
      }

      markersRef.current.push({ marker, data: markerData });
      return marker;

    } catch (error) {
      console.error('Error adding marker:', error);
      return null;
    }
  }, [provider, onMarkerClick]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(({ marker }) => {
      if (provider === 'google') {
        marker.setMap(null);
      } else {
        // Remove from simple map implementation
      }
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach(marker => addMarker(marker));
  }, [markers, addMarker, provider]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !searchable) return;

    setIsLoading(true);

    try {
      // Simple geocoding implementation (replace with actual geocoding service)
      const mockResults = [
        { lat: -23.5505, lng: -46.6333, name: 'São Paulo, SP', address: 'São Paulo, São Paulo, Brasil' },
        { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro, RJ', address: 'Rio de Janeiro, Rio de Janeiro, Brasil' },
      ];

      const result = mockResults.find(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (result && onSearch) {
        onSearch(result);
        // Center map on result
        if (mapInstanceRef.current) {
          if (provider === 'google') {
            mapInstanceRef.current.setCenter({ lat: result.lat, lng: result.lng });
          } else {
            mapInstanceRef.current.setView([result.lat, result.lng], zoom);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }

    setIsLoading(false);
  }, [searchQuery, searchable, onSearch, provider, zoom]);

  // Handle map click
  const handleMapClick = useCallback((event) => {
    if (readOnly) return;

    const coords = provider === 'google'
      ? { lat: event.latLng.lat(), lng: event.latLng.lng() }
      : { lat: event.latlng?.lat || event.lat, lng: event.latlng?.lng || event.lng };

    onMapClick?.(coords);
  }, [provider, readOnly, onMapClick]);

  return (
    <Card className={`interactive-map ${className}`} {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Mapa Interativo</CardTitle>

          {searchable && !readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Buscar localização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? '🔍' : '🔍'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {/* Map container */}
          <div
            ref={mapRef}
            className="w-full bg-gray-100 dark:bg-gray-800 border rounded-b-lg"
            style={{ height }}
            onClick={handleMapClick}
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-b-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Carregando mapa...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {mapError && (
            <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center rounded-b-lg">
              <div className="text-red-600 dark:text-red-400 text-center">
                <p className="mb-2">Erro ao carregar mapa</p>
                <p className="text-sm">{mapError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Recarregar
                </Button>
              </div>
            </div>
          )}

          {/* Read-only overlay */}
          {readOnly && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center rounded-b-lg">
              <span className="text-gray-500 text-lg">Modo somente leitura</span>
            </div>
          )}
        </div>

        {/* Map legend */}
        {markers.length > 0 && (
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
            <h4 className="font-semibold mb-2">Legenda</h4>
            <div className="space-y-1">
              {markers.slice(0, 5).map((marker, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: marker.color || '#3b82f6' }}
                  />
                  <span>{marker.title || `Marcador ${index + 1}`}</span>
                </div>
              ))}
              {markers.length > 5 && (
                <div className="text-sm text-gray-500">
                  +{markers.length - 5} marcadores adicionais
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
