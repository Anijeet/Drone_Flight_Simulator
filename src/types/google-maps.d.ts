
declare namespace google.maps {
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    styles?: Array<MapTypeStyle>;
  }

  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers: Array<{ [key: string]: string | number }>;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    controls: Array<MVCArray<Node>>;
    setCenter(position: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    fitBounds(bounds: LatLngBounds): void;
    panTo(position: LatLng | LatLngLiteral): void;
    addListener(event: string, handler: Function): MapsEventListener;
  }

  // Add ControlPosition enum
  const ControlPosition: {
    TOP_LEFT: number;
    TOP_CENTER: number;
    TOP_RIGHT: number;
    LEFT_TOP: number;
    LEFT_CENTER: number;
    LEFT_BOTTOM: number;
    RIGHT_TOP: number;
    RIGHT_CENTER: number;
    RIGHT_BOTTOM: number;
    BOTTOM_LEFT: number;
    BOTTOM_CENTER: number;
    BOTTOM_RIGHT: number;
  };

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    union(bounds: LatLngBounds): LatLngBounds;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(position: LatLng | LatLngLiteral): void;
    getPosition(): LatLng | null;
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Symbol | Icon;
  }

  interface Icon {
    url?: string;
    path?: SymbolPath;
    scale?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeWeight?: number;
    strokeColor?: string;
  }

  enum SymbolPath {
    CIRCLE,
    FORWARD_CLOSED_ARROW,
    FORWARD_OPEN_ARROW,
    BACKWARD_CLOSED_ARROW,
    BACKWARD_OPEN_ARROW,
  }

  class Polyline {
    constructor(opts?: PolylineOptions);
    setMap(map: Map | null): void;
  }

  interface PolylineOptions {
    path?: Array<LatLng | LatLngLiteral>;
    geodesic?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    map?: Map;
  }

  const MapTypeId: {
    ROADMAP: string;
    SATELLITE: string;
    HYBRID: string;
    TERRAIN: string;
  };

  class Geocoder {
    geocode(
      request: { address: string } | { location: LatLng | LatLngLiteral },
      callback: (
        results: GeocoderResult[],
        status: GeocoderStatus
      ) => void
    ): void;
  }

  interface GeocoderResult {
    geometry: {
      location: LatLng;
      viewport?: LatLngBounds;
    };
  }

  type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';

  interface GeocoderResponse extends Array<GeocoderResult> {}

  interface MVCArray<T> {
    push(element: T): number;
  }

  interface MapsEventListener {
    remove(): void;
  }

  namespace places {
    class SearchBox {
      constructor(inputField: HTMLInputElement);
      getPlaces(): Array<PlaceResult>;
      addListener(event: string, handler: Function): MapsEventListener;
    }

    interface PlaceResult {
      geometry?: {
        location?: LatLng;
        viewport?: LatLngBounds;
      };
    }
  }

  interface MapMouseEvent {
    latLng?: LatLng;
  }
}

interface Window {
  google?: {
    maps: typeof google.maps;
  };
}
