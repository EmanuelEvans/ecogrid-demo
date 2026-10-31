import { useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, ImageOverlay } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import { Flame, MapPin, Recycle } from 'lucide-react';
import type { Report } from './data';

const mapBounds: LatLngBoundsExpression = [[40.82, 20.31], [42.38, 23.07]];
const places: Record<string, [number, number]> = {
  'EG-2041': [41.976, 21.410], 'EG-2040': [42.057, 21.548], 'EG-2039': [41.990, 21.465],
  'EG-2038': [41.963, 21.443], 'EG-2037': [41.032, 21.340], 'EG-2036': [41.906, 21.624],
  'EG-2035': [42.008, 20.972], 'EG-2034': [41.344, 21.548],
};

function markerIcon(report: Report) {
  const tone = report.kind === 'Пожар' || report.kind === 'Сомнителен чад' ? 'fire' : report.status === 'Исчистено' ? 'resolved' : 'dump';
  const icon = tone === 'fire' ? '♨' : tone === 'resolved' ? '✓' : '♻';
  return L.divIcon({
    className: 'eco-pin-wrap',
    html: `<span class="eco-pin ${tone}">${icon}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function EcoMap({ reports, onSelect }: { reports: Report[]; onSelect: (report: Report) => void }) {
  const [tileError, setTileError] = useState(false);
  const [tileLoaded, setTileLoaded] = useState(false);
  const [filters, setFilters] = useState('Сите');
  const visible = useMemo(() => reports.filter((report) => filters === 'Сите' || (filters === 'Пожари' ? report.kind !== 'Дива депонија' : report.kind === 'Дива депонија')), [reports, filters]);
  return (
    <div className="leaflet-stage" aria-label="Интерактивна еколошка карта на Македонија">
      <MapContainer center={[41.6, 21.7]} zoom={8} minZoom={7} maxZoom={13} scrollWheelZoom className="eco-leaflet">
        {!tileError && (
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileLoaded(true) }}
          />
        )}
        {tileLoaded && !tileError && (
          <ImageOverlay
            url="https://zelenaberza.com.mk/wp-content/uploads/2015/11/publikuvanata-prvata-detalna-karta-na-makedonija.jpg"
            bounds={mapBounds}
            opacity={0.28}
            eventHandlers={{ error: () => setTileError(true) }}
          />
        )}
        {visible.map((report) => (
          <Marker key={report.id} position={places[report.id] ?? [41.6, 21.7]} icon={markerIcon(report)} eventHandlers={{ click: () => onSelect(report) }}>
            <Popup><strong>{report.kind}</strong><br />{report.place}<br />{report.status}</Popup>
          </Marker>
        ))}
      </MapContainer>
      {(tileError || !tileLoaded) && (
        <div className="map-fallback" aria-hidden="true">
          <svg viewBox="0 0 360 420" preserveAspectRatio="xMidYMid meet">
            <defs><linearGradient id="country" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#103b2a" /><stop offset="1" stopColor="#0b241b" /></linearGradient></defs>
            <path d="m145 26 45 12 20 34 47 7 22 37-18 41 26 33-15 33 16 39-41 24-19 42-49 10-23 39-47-21-19-40-45-21 7-44-31-26 15-47-12-36 33-23 10-50 47-8 31-36Z" fill="url(#country)" stroke="#4aa66e" strokeWidth="2" />
            <path d="m80 190 190-70M104 265l158-108M123 101l131 168M143 330l81-235M67 222l203 5" stroke="#72b585" strokeOpacity=".22" strokeDasharray="4 8" />
            <circle cx="173" cy="178" r="8" fill="#d4ff4f" /><text x="185" y="182" fill="#edf8ee" fontSize="11">Скопје</text>
            <circle cx="115" cy="233" r="6" fill="#ff5a36" /><circle cx="222" cy="238" r="6" fill="#f2b705" />
            <circle cx="112" cy="313" r="5" fill="#12c27a" /><circle cx="242" cy="121" r="5" fill="#f2b705" />
          </svg>
          <span className="map-fallback-label"><MapPin size={14} /> Карта на Македонија · демо-приказ</span>
        </div>
      )}
      <div className="map-filter-bar">
        {['Сите', 'Пожари', 'Депонии'].map((filter) => (
          <button key={filter} className={`map-filter ${filter === filters ? 'active' : ''}`} onClick={() => setFilters(filter)}>
            {filter === 'Пожари' ? <Flame size={14} /> : filter === 'Депонии' ? <Recycle size={14} /> : null}{filter}
          </button>
        ))}
      </div>
      <div className="map-credit">Карта: Зелена берза · демо-приказ</div>
    </div>
  );
}
