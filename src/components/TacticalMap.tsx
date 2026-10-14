import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident, IncidentCategory, IncidentSeverity, WorkflowStatus, CATEGORY_LABELS, SEVERITY_COLORS, STATUS_COLORS } from '../types/incident';
import { playTacticalBlip } from '../utils/audio';
import { Search, Filter, Layers, List, Map as MapIcon, Crosshair, AlertTriangle, ExternalLink } from 'lucide-react';

interface TacticalMapProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  initialSelectedId?: string;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ incidents, onSelectIncident, initialSelectedId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(initialSelectedId || null);

  // Filtered list
  const filteredIncidents = incidents.filter((inc) => {
    if (selectedCategory !== 'all' && inc.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && inc.workflowStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchLoc = inc.locationName.toLowerCase().includes(q);
      const matchDesc = inc.description.toLowerCase().includes(q);
      const matchId = inc.id.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchDesc && !matchId) return false;
    }
    return true;
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Center around coastal California by default or first incident coordinates
        const defaultLat = 37.7749;
        const defaultLng = -122.4194;

        const map = L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 11,
          zoomControl: true,
          attributionControl: true,
        });

        // Dark-styled OpenStreetMap tile layer (CartoDB Dark Matter / OSM)
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        });

        tileLayer.on('tileerror', () => {
          setMapError('Network connection to tile provider is degraded. Accessible list mode remains available.');
        });

        tileLayer.addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }
    } catch (err: unknown) {
      console.error('Leaflet initialization error:', err);
      setMapError('Failed to initialize tactical map renderer. Falling back to accessible telemetry list.');
      setViewMode('list');
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when filtered incidents change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validCoordinates: [number, number][] = [];

    filteredIncidents.forEach((inc) => {
      if (typeof inc.latitude === 'number' && typeof inc.longitude === 'number') {
        validCoordinates.push([inc.latitude, inc.longitude]);

        // Severity-based neon marker colors
        let markerBg = '#00f0ff';
        let markerBorder = '#00f0ff';
        let pingColor = 'rgba(0, 240, 255, 0.4)';

        if (inc.severity === 'Critical') {
          markerBg = '#ff007f';
          markerBorder = '#ff007f';
          pingColor = 'rgba(255, 0, 127, 0.6)';
        } else if (inc.severity === 'High') {
          markerBg = '#f59e0b';
          markerBorder = '#f59e0b';
          pingColor = 'rgba(245, 158, 11, 0.5)';
        } else if (inc.severity === 'Low') {
          markerBg = '#10b981';
          markerBorder = '#10b981';
          pingColor = 'rgba(16, 185, 129, 0.4)';
        }

        const customIcon = L.divIcon({
          className: 'custom-cyber-marker',
          html: `
            <div style="position: relative; width: 24px; height: 24px; cursor: pointer;">
              <div style="position: absolute; inset: 0; border-radius: 50%; background: ${markerBg}; opacity: 0.9; box-shadow: 0 0 12px ${markerBg}; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; font-family: monospace; font-size: 10px; font-weight: bold; color: #000;">
                !
              </div>
              <div style="position: absolute; inset: -4px; border-radius: 50%; border: 1px dashed ${markerBorder}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

        const popupContent = `
          <div style="padding: 4px; font-family: monospace; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid rgba(0,240,255,0.4); padding-bottom: 4px;">
              <span style="color: #00f0ff; font-weight: bold; font-size: 11px;">${inc.id}</span>
              <span style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 2px; font-size: 9px; color: #e2f1f8;">${inc.severity}</span>
            </div>
            <div style="font-weight: bold; font-size: 12px; color: #ffffff; margin-bottom: 4px;">${inc.title}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">📍 ${inc.locationName}</div>
            <div style="font-size: 10px; color: #06b6d4; margin-bottom: 8px;">Status: <strong>${inc.workflowStatus}</strong></div>
            <button id="btn-popup-${inc.id}" style="width: 100%; background: #00f0ff; color: #000; border: none; font-weight: bold; padding: 4px 8px; border-radius: 2px; cursor: pointer; font-size: 11px; text-transform: uppercase;">
              Inspect Incident &gt;
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          setActiveIncidentId(inc.id);
          const btn = document.getElementById(`btn-popup-${inc.id}`);
          if (btn) {
            btn.onclick = () => {
              playTacticalBlip(900, 0.05);
              onSelectIncident(inc.id);
            };
          }
        });

        marker.addTo(markersLayer);
      }
    });

    if (validCoordinates.length > 0 && map) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredIncidents, onSelectIncident]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Tactical Filter Toolbar */}
      <div className="bg-[#040e1e] border border-cyan-500/40 p-4 rounded-sm cyber-panel">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full pl-9 pr-3 py-2 bg-black/60 border border-cyan-900 rounded font-mono text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                playTacticalBlip(650, 0.03);
              }}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900 rounded font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
              aria-label="Filter by pollution category"
            >
              <option value="all">ALL CATEGORIES ({incidents.length})</option>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                playTacticalBlip(650, 0.03);
              }}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900 rounded font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
              aria-label="Filter by severity level"
            >
              <option value="all">ALL SEVERITIES</option>
              <option value="Low">Low Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="High">High Hazard</option>
              <option value="Critical">Critical Bio/Chem</option>
            </select>
          </div>

          {/* View Toggle and Reset */}
          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => {
                setViewMode('map');
                playTacticalBlip(800, 0.03);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded font-mono text-xs border ${
                viewMode === 'map'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'border-slate-800 text-slate-400 hover:text-cyan-300'
              }`}
              title="Tactical Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>MAP</span>
            </button>

            <button
              onClick={() => {
                setViewMode('list');
                playTacticalBlip(800, 0.03);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded font-mono text-xs border ${
                viewMode === 'list'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'border-slate-800 text-slate-400 hover:text-cyan-300'
              }`}
              title="Accessible Table / List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>LIST</span>
            </button>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="mt-3 pt-3 border-t border-cyan-900/40 flex flex-wrap items-center justify-between font-mono text-[11px] text-slate-400">
          <div>
            TRACKING: <span className="text-cyan-300 font-bold">{filteredIncidents.length}</span> / {incidents.length} INCIDENTS
            {selectedCategory !== 'all' && ` • Filter: ${CATEGORY_LABELS[selectedCategory as IncidentCategory] || selectedCategory}`}
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>LOW</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>MED</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>HIGH</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>CRITICAL</span>
            </span>
          </div>
        </div>
      </div>

      {mapError && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/60 rounded text-xs font-mono text-amber-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{mapError}</span>
        </div>
      )}

      {/* Main Map or Synchronized List View */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map canvas */}
          <div className="lg:col-span-3 h-[520px] rounded border border-cyan-500/40 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Tactical HUD Overlay elements */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none bg-black/80 border border-cyan-500/40 px-3 py-1.5 rounded font-mono text-[10px] text-cyan-300 shadow">
              <div className="flex items-center space-x-1.5">
                <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                <span>GRID: WGS84 // OPTICAL SAT TILE</span>
              </div>
            </div>
          </div>

          {/* Side incident quick inspector */}
          <div className="lg:col-span-1 h-[520px] overflow-y-auto space-y-2 pr-1">
            <div className="sticky top-0 bg-[#030d1a] py-1 border-b border-cyan-900/60 font-mono text-xs text-cyan-400 font-bold flex justify-between">
              <span>RADAR DETECTIONS</span>
              <span>({filteredIncidents.length})</span>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-slate-500 bg-black/40 border border-dashed border-slate-800 rounded">
                No coastal incidents match current filter coordinates.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = activeIncidentId === inc.id;
                const sev = SEVERITY_COLORS[inc.severity];
                const stat = STATUS_COLORS[inc.workflowStatus];

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setActiveIncidentId(inc.id);
                      playTacticalBlip(700, 0.03);
                      // Center map on marker if available
                      if (mapInstanceRef.current && inc.latitude && inc.longitude) {
                        mapInstanceRef.current.flyTo([inc.latitude, inc.longitude], 13);
                      }
                    }}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-black/50 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-cyan-300">{inc.id}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${sev.border} ${sev.text} ${sev.bg}`}>
                        {inc.severity}
                      </span>
                    </div>

                    <h4 className="font-display font-semibold text-xs text-white line-clamp-1 mb-1">
                      {inc.title}
                    </h4>

                    <div className="font-mono text-[10px] text-slate-400 mb-2 truncate">
                      📍 {inc.locationName}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono text-[10px]">
                      <span className={`${stat.text}`}>● {inc.workflowStatus}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTacticalBlip(900, 0.04);
                          onSelectIncident(inc.id);
                        }}
                        className="text-cyan-400 hover:text-cyan-200 underline flex items-center space-x-0.5"
                      >
                        <span>VIEW</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Accessible List & Table View */
        <div className="bg-[#040e1e] border border-cyan-500/40 rounded overflow-hidden">
          <div className="p-4 bg-black/40 border-b border-cyan-900/60 flex items-center justify-between font-mono text-xs">
            <span className="text-cyan-300 font-bold">ACCESSIBLE INCIDENT REGISTRY</span>
            <span className="text-slate-400">{filteredIncidents.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-black/80 text-cyan-400 uppercase text-[10px] border-b border-cyan-900">
                <tr>
                  <th scope="col" className="px-4 py-3">Report ID</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3">Severity</th>
                  <th scope="col" className="px-4 py-3">Location & Coordinates</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Observed Date</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                      No incident telemetry found matching query filters.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => {
                    const sev = SEVERITY_COLORS[inc.severity];
                    const stat = STATUS_COLORS[inc.workflowStatus];

                    return (
                      <tr key={inc.id} className="hover:bg-cyan-950/20 transition-colors">
                        <td className="px-4 py-3 font-bold text-cyan-300">{inc.id}</td>
                        <td className="px-4 py-3">{CATEGORY_LABELS[inc.category] || inc.category}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${sev.border} ${sev.text} ${sev.bg}`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{inc.locationName}</div>
                          {inc.latitude && inc.longitude && (
                            <div className="text-[10px] text-slate-500">
                              [{inc.latitude.toFixed(3)}, {inc.longitude.toFixed(3)}]
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[10px] ${stat.border} ${stat.text} ${stat.bg}`}>
                            {inc.workflowStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(inc.observedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              playTacticalBlip(900, 0.04);
                              onSelectIncident(inc.id);
                            }}
                            className="px-3 py-1 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-900 rounded font-bold text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
