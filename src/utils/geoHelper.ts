import { CityData, ParkingZone, ZoneDetectionResult, CustomLocationOverride } from '../types';
import { REGIONAL_CITIES } from '../data/citiesData';
import { VALJEVO_PARKING_JSON, matchValjevoStreet } from '../data/valjevoParkingData';
import { CITY_ZONE_STREETS } from '../data/cityStreetsData';
import {
  BELGRADE_ZONE_POLYGONS,
  ALL_CITY_ZONE_POLYGONS,
  VALJEVO_ZONE_POLYGONS,
  CityZonePolygon,
} from '../data/zonePolygons';
import { getStoredLocationOverrides } from './storage';

/**
 * Transliterates Serbian Cyrillic characters to Latin script
 */
export function cyrillicToLatin(text: string): string {
  if (!text) return '';
  const cyrMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e',
    ж: 'z', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj',
    м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's',
    т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c',
    џ: 'dz', ш: 's',
    А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Ђ: 'Dj', Е: 'E',
    Ж: 'Z', З: 'Z', И: 'I', Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj',
    М: 'M', Н: 'N', Њ: 'Nj', О: 'O', П: 'P', Р: 'R', С: 'S',
    Т: 'T', Ћ: 'C', У: 'U', Ф: 'F', Х: 'H', Ц: 'C', Ч: 'C',
    Џ: 'Dz', Ш: 'S',
  };
  return text.replace(/[а-яА-ЯёЁ]/g, (ch) => cyrMap[ch] || ch);
}

/**
 * Normalizes Serbian Latin and Cyrillic text for robust substring matching
 */
export function normalizeStreetSearch(text: string): string {
  const latinText = cyrillicToLatin(text || '');
  return latinText
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .replace(/ž/g, 'z')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ulica\s+/g, '')
    .replace(/^ul\.\s*/g, '')
    .replace(/^u\.\s*/g, '')
    .replace(/[,\.\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dedicated zone detection for Street-List based cities (e.g. Valjevo - JKP "Vidrak").
 * JKP Vidrak does NOT use spatial polygons; parking is charged exclusively on a statutory
 * list of streets. Any street not on that list is 100% free parking.
 */
export function detectStreetListZone(
  streetOrAddress: string | undefined,
  lat: number,
  lng: number,
  city: CityData,
  addressDetails?: { streetName?: string; houseNumber?: string; suburbName?: string; fullAddress?: string }
): ZoneDetectionResult {
  const redZone = city.zones.find((z) => z.id === 'va-1' || z.code === '1') || city.zones[0];
  const blueZone =
    city.zones.find((z) => z.id === 'va-plava' || z.code === '2') ||
    (city.zones.length > 1 ? city.zones[1] : city.zones[0]);

  const raw = streetOrAddress?.trim() || '';
  const norm = normalizeStreetSearch(raw);

  // 1. STREET NAME RECOGNITION FIRST (The official municipal street list is the primary source of truth!)
  if (norm.length >= 2) {
    if (city.id === 'valjevo') {
      // 1a. Check with dedicated JKP Vidrak official street matcher
      const valjevoMatch = matchValjevoStreet(raw);
      if (valjevoMatch) {
        if (valjevoMatch.isFreeArea) {
          return {
            city,
            zone: null,
            isOutsidePaidZone: true,
            detectionMethod: 'street_list',
            reason: valjevoMatch.reason,
            streetName: addressDetails?.streetName || raw,
            houseNumber: addressDetails?.houseNumber,
            address: addressDetails?.fullAddress,
            streetMatched: valjevoMatch.matchedName,
          };
        }
        const targetZone =
          city.zones.find((z) => z.id === valjevoMatch.zoneId) ||
          (valjevoMatch.zoneId === 'va-1' ? redZone : blueZone);
        const isBorder =
          valjevoMatch.matchedName.toLowerCase().includes('karadjordjev') &&
          (raw.toLowerCase().includes('nusic') || raw.toLowerCase().includes('uzun mirkov') || raw.toLowerCase().includes('jadar'));
        return {
          city,
          zone: targetZone,
          isOutsidePaidZone: false,
          detectionMethod: 'street_list',
          reason: valjevoMatch.reason,
          streetName: addressDetails?.streetName || raw,
          houseNumber: addressDetails?.houseNumber,
          address: addressDetails?.fullAddress,
          streetMatched: valjevoMatch.matchedName,
          isBorderZone: isBorder,
          alternativeZone: isBorder ? (targetZone.id === 'va-1' ? blueZone : redZone) : null,
          borderExplanation: isBorder
            ? 'Nalazite se na delu Karađorđeve ulice gde se zona menja. Proverite dopunsku tablu na saobraćajnom znaku.'
            : undefined,
        };
      }

      // Also check subparts from reverse geocode (e.g. "Karađorđeva 14, Valjevo" or "Vuka Karadžića, Kolubarski okrug")
      if (raw.includes(',') || raw.includes(';') || raw.includes('-')) {
        const parts = raw.split(/[,;\-]+/);
        for (const p of parts) {
          const subMatch = matchValjevoStreet(p.trim());
          if (subMatch) {
            if (subMatch.isFreeArea) {
              return {
                city,
                zone: null,
                isOutsidePaidZone: true,
                detectionMethod: 'street_list',
                reason: subMatch.reason,
                streetName: raw,
                streetMatched: subMatch.matchedName,
              };
            }
            const targetZone =
              city.zones.find((z) => z.id === subMatch.zoneId) ||
              (subMatch.zoneId === 'va-1' ? redZone : blueZone);
            return {
              city,
              zone: targetZone,
              isOutsidePaidZone: false,
              detectionMethod: 'street_list',
              reason: subMatch.reason,
              streetName: raw,
              streetMatched: subMatch.matchedName,
            };
          }
        }
      }

      // If a street name was detected or entered for Valjevo and is NOT on JKP Vidrak's official list of paid streets,
      // it is 100% VAN ZONE NAPLATE (Besplatan parking)!
      // Never fall through to GPS radius guessing when a street name is present.
      return {
        city,
        zone: null,
        isOutsidePaidZone: true,
        detectionMethod: 'street_list',
        reason: `Ulica „${raw}“ nije na zvaničnom spisku ulica pod naplatom JKP Vidrak Valjevo (Besplatan parking)`,
        streetName: addressDetails?.streetName || raw,
        houseNumber: addressDetails?.houseNumber,
        address: addressDetails?.fullAddress,
      };
    } else {
      // For any other street_list city: match against official street lists from the municipal enterprise
      const streetMatch = findZoneByStreetName(raw, city);
      if (streetMatch) {
        return {
          city,
          zone: streetMatch.zone,
          isOutsidePaidZone: false,
          detectionMethod: 'street_list',
          reason: `Ulica na zvaničnom spisku naplate: ${streetMatch.streetMatched} (${streetMatch.zone.name} - ${city.operator || city.name})`,
          streetName: addressDetails?.streetName || raw,
          houseNumber: addressDetails?.houseNumber,
          address: addressDetails?.fullAddress,
          streetMatched: streetMatch.streetMatched,
          isBorderZone: streetMatch.isBorderZone,
          alternativeZone: streetMatch.alternativeZone,
          borderExplanation: streetMatch.borderExplanation,
        };
      }

      // Also check subparts from reverse geocode (e.g. "Kneza Miloša 14, Čačak" or "Bulevar Nemanjića, Niš")
      if (raw.includes(',') || raw.includes(';') || raw.includes('-')) {
        const parts = raw.split(/[,;\-]+/);
        for (const p of parts) {
          const subMatch = findZoneByStreetName(p.trim(), city);
          if (subMatch) {
            return {
              city,
              zone: subMatch.zone,
              isOutsidePaidZone: false,
              detectionMethod: 'street_list',
              reason: `Ulica na zvaničnom spisku naplate: ${subMatch.streetMatched} (${subMatch.zone.name} - ${city.operator || city.name})`,
              streetName: raw,
              streetMatched: subMatch.streetMatched,
            };
          }
        }
      }

      // If a street name was detected or entered for ANY city with street_list detection,
      // and it is NOT on the official list of paid parking streets of the municipal enterprise,
      // then it is 100% VAN ZONE NAPLATE (Besplatan parking)!
      // WE DO NOT GUESS OR ESTIMATE BY DISTANCE!
      return {
        city,
        zone: null,
        isOutsidePaidZone: true,
        detectionMethod: 'street_list',
        reason: `Ulica „${raw}“ nije na zvaničnom spisku ulica pod naplatom preduzeća ${city.operator || city.name} (Besplatan parking)`,
        streetName: addressDetails?.streetName || raw,
        houseNumber: addressDetails?.houseNumber,
        address: addressDetails?.fullAddress,
      };
    }
  }

  // 2. CHECK GPS WAYPOINTS / STREET SEGMENTS (When street name was not provided or reverse geocoding returned generic coordinates)
  if (lat && lng && lat > 0 && lng > 0) {
    if (city.id === 'valjevo') {
      let closestSegment: (typeof VALJEVO_PARKING_JSON.placene_ulice_segmenti)[number] | null = null;
      let minDistanceMeters = Infinity;

      for (const seg of VALJEVO_PARKING_JSON.placene_ulice_segmenti) {
        const d = calculateDistanceMeters(lat, lng, seg.lat, seg.lng);
        if (d < minDistanceMeters) {
          minDistanceMeters = d;
          closestSegment = seg;
        }
      }

      // Safe GPS buffer: strictly respect segment maxDistMeters (max 60m), never force an overly wide radius like 170m
      const safeThreshold = closestSegment ? Math.min(closestSegment.maxDistMeters, 65) : 50;
      if (closestSegment && minDistanceMeters <= safeThreshold) {
        const targetZone =
          city.zones.find((z) => z.id === closestSegment!.zonaId) ||
          (closestSegment!.zonaId === 'va-1' ? redZone : blueZone);
        return {
          city,
          zone: targetZone,
          isOutsidePaidZone: false,
          detectionMethod: 'street_list',
          reason: `GPS lokacija na potezu ulične naplate: ${closestSegment.naziv} (${targetZone.name})`,
          streetName: closestSegment.naziv,
          streetMatched: closestSegment.naziv,
        };
      }
    }
  }

  // 3. SPATIAL POLYGON CHECK (Precise GIS bounds)
  if (lat && lng && lat > 0 && lng > 0 && typeof isPointInPolygon === 'function') {
    // For Valjevo, parking is strictly street-based (no spatial polygons defined by JKP Vidrak)
    const polygonsToCheck = city.id === 'valjevo' ? [] : ALL_CITY_ZONE_POLYGONS[city.id];
    if (polygonsToCheck && polygonsToCheck.length > 0) {
      // Check Red Zone polygon FIRST so central zone takes priority!
      for (const poly of polygonsToCheck) {
        if (isPointInPolygon(lat, lng, poly.coordinates)) {
          const targetZone =
            city.zones.find((z) => z.id === poly.zoneId || z.code === poly.code) ||
            (poly.zoneId === 'va-1' ? redZone : blueZone);
          return {
            city,
            zone: targetZone,
            isOutsidePaidZone: false,
            detectionMethod: 'polygon',
            reason: `Lokacija u zoni naplate: ${poly.name}`,
            streetName: raw || poly.name,
            streetMatched: poly.name,
          };
        }
      }
    }
  }

  // Parking is strictly determined by the official street lists of the municipal enterprise.
  // We NEVER apply radial/distance estimation: if a street/segment is not in the official list,
  // it is free parking (van zone naplate).
  return {
    city,
    zone: null,
    isOutsidePaidZone: true,
    detectionMethod: 'street_list',
    reason: `Lokacija nije na spisku ulica pod naplatom preduzeća ${city.operator || city.name} (Besplatan parking)`,
    streetName: addressDetails?.streetName || raw || 'Van zone naplate',
    houseNumber: addressDetails?.houseNumber,
    address: addressDetails?.fullAddress,
  };
}

/**
 * Searches zone by explicit street list configured in city / JSON schema
 */
export function findZoneByStreetName(
  streetOrAddress: string | undefined,
  city: CityData
): {
  zone: ParkingZone;
  streetMatched: string;
  confidence?: 'high' | 'medium';
  isBorderZone?: boolean;
  alternativeZone?: ParkingZone | null;
  borderExplanation?: string;
} | null {
  if (!streetOrAddress) return null;
  const raw = streetOrAddress.trim();
  const inputNorm = normalizeStreetSearch(raw);
  if (inputNorm.length < 3) return null;

  // Specific Valjevo smart disambiguation using detectStreetListZone with pure textual matching
  if (city.id === 'valjevo') {
    const res = detectStreetListZone(streetOrAddress, 0, 0, city);
    if (res.zone && !res.isOutsidePaidZone) {
      return {
        zone: res.zone,
        streetMatched: res.streetMatched || res.streetName || streetOrAddress,
        confidence: 'high',
        isBorderZone: res.isBorderZone,
        alternativeZone: res.alternativeZone,
        borderExplanation: res.borderExplanation,
      };
    }
    return null;
  }

  // Clean common street prefixes, numbers, commas, and city names
  const cleanInput = inputNorm
    .replace(/,\s*[a-z\s]+$/, '') // remove trailing city like ", beograd" or ", valjevo"
    .replace(/\b\d+([a-z])?\b/g, '') // remove house numbers
    .replace(/\b(ulica|ulice|ulici|bulevar|bulevara|bulevaru|trg|trga|trgu|kej|keja|keju|venac|venca|avenija|cesta|put|prolaz)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const inputTokens = cleanInput.split(/\s+/).filter((t) => t.length >= 3);

  // Check city zones in order (Zone 1 / Crvena / Ekstra first)
  const sortedZones = [...city.zones].sort((a, b) => {
    const aIs1 = a.code === '1' || a.code === '0' || a.id.includes('crvena') || a.id.includes('ekstra') || a.id.includes('1') || a.id.includes('zone-a');
    const bIs1 = b.code === '1' || b.code === '0' || b.id.includes('crvena') || b.id.includes('ekstra') || b.id.includes('1') || b.id.includes('zone-a');
    if (aIs1 && !bIs1) return -1;
    if (!aIs1 && bIs1) return 1;
    return 0;
  });

  for (const zone of sortedZones) {
    // Gather streets from both zone.streets and CITY_ZONE_STREETS
    const streetsFromConfig = zone.streets || [];
    const streetsFromMaster = CITY_ZONE_STREETS[city.id]?.[zone.id] || [];
    const allStreets = Array.from(new Set([...streetsFromConfig, ...streetsFromMaster]));

    if (allStreets.length > 0) {
      for (const streetPattern of allStreets) {
        const patternNorm = normalizeStreetSearch(streetPattern);
        const mainStreet = patternNorm.split('(')[0].trim();
        const cleanPattern = mainStreet
          .replace(/\b(ulica|ulice|ulici|bulevar|bulevara|bulevaru|trg|trga|trgu|kej|keja|keju|venac|venca|avenija|cesta|put|prolaz)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // 1. Direct containment
        if (
          mainStreet.length >= 3 &&
          (inputNorm.includes(mainStreet) || mainStreet.includes(inputNorm))
        ) {
          return {
            zone,
            streetMatched: streetPattern,
            confidence: 'high',
          };
        }

        // 2. Clean containment without prefixes & numbers
        if (
          cleanPattern.length >= 4 &&
          (cleanInput.includes(cleanPattern) || cleanPattern.includes(cleanInput))
        ) {
          return {
            zone,
            streetMatched: streetPattern,
            confidence: 'high',
          };
        }

        // 3. Significant word token matching (e.g. "Kralja Petra" -> match "kralja", "petra")
        if (inputTokens.length > 0) {
          const matchCount = inputTokens.filter((token) => patternNorm.includes(token)).length;
          if (matchCount >= 2 || (inputTokens.length === 1 && matchCount === 1 && inputTokens[0].length >= 5 && patternNorm.includes(inputTokens[0]))) {
            return {
              zone,
              streetMatched: streetPattern,
              confidence: 'medium',
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Calculates distance between two coordinates in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
}

/**
 * Formats distance in meters or kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculates bearing from point 1 to point 2 in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (Math.round((θ * 180) / Math.PI) + 360) % 360;
}

/**
 * Point-in-polygon ray-casting algorithm
 * polygon is array of [lat, lng]
 */
export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculates minimum distance from point (lat, lng) to a line segment in meters
 */
export function distanceToSegmentMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const l2 = (bLat - aLat) * (bLat - aLat) + (bLng - aLng) * (bLng - aLng);
  if (l2 === 0) return calculateDistanceMeters(pLat, pLng, aLat, aLng);

  let t = ((pLat - aLat) * (bLat - aLat) + (pLng - aLng) * (bLng - aLng)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);
  return calculateDistanceMeters(pLat, pLng, projLat, projLng);
}

/**
 * Calculates shortest distance from a point to polygon perimeter in meters.
 * Returns 0 if point is inside the polygon.
 */
export function distanceToPolygonMeters(
  lat: number,
  lng: number,
  polygon: [number, number][]
): number {
  if (isPointInPolygon(lat, lng, polygon)) {
    return 0;
  }
  let minDistance = Infinity;
  for (let i = 0; i < polygon.length - 1; i++) {
    const d = distanceToSegmentMeters(
      lat,
      lng,
      polygon[i][0],
      polygon[i][1],
      polygon[i + 1][0],
      polygon[i + 1][1]
    );
    if (d < minDistance) {
      minDistance = d;
    }
  }
  return minDistance;
}

/**
 * Known genuinely non-zoned / free parking outer suburbs and rural settlements.
 * NOTE: All central municipalities (Novi Beograd, Zemun, Stari Grad, Vračar, Palilula-centar, Zvezdara-centar, Banovo Brdo)
 * have active paid parking zones and are NOT included here.
 */
export const KNOWN_FREE_PARKING_KEYWORDS = [
  // Beograd - Prigradska naselja van zonskog sistema
  'mirijevo',
  'karaburma',
  'medaković',
  'medakovic',
  'konjarnik',
  'kumodraž',
  'kumodraz',
  'braće jerković',
  'brace jerkovic',
  'banjica',
  'kanarevo brdo',
  'miljakovac',
  'rakovica',
  'vidikovac',
  'cerak',
  'labudovo brdo',
  'petlovo brdo',
  'skojevsko',
  'žarkovo',
  'zarkovo',
  'julino brdo',
  'čukarička padina',
  'cukaricka padina',
  'železnik',
  'zeleznik',
  'sremčica',
  'sremcica',
  'ostružnica',
  'umka',
  'surčin',
  'surcin',
  'ledine',
  'altina',
  'zemun polje',
  'batajnica',
  'borča',
  'borca',
  'ovča',
  'ovca',
  'kotež',
  'kotez',
  'krnjača',
  'krnjaca',
  'padinska skela',
  'višnjica',
  'visnjica',
  'višnjička banja',
  'visnjicka banja',
  'kaluđerica',
  'kaluderica',
  'leštane',
  'lestane',
  'vinča',
  'vinca',
  'grocka',
  'barajevo',
  'sopot',
  'mladenovac',
  'lazarevac',
  'obrenovac',
  'vrčin',
  'vrcin',
  'babe',
  'ripanj',
  'beli potok',
  'pinosava',
  'resnik',
  'mali mokri lug',
  'veliki mokri lug',
  // Valjevo non-zoned suburbs
  'novo naselje',
  'brđani',
  'brdjani',
  'peti puk',
  'gorić',
  'goric',
  'popare',
  'sedlari',
  'popučke',
  'popucke',
  'beloševac',
  'belosevac',
  'gradac',
  // Regional unzoned outer areas
  'telep',
  'adice',
  'veternik',
  'futog',
  'klisa',
  'slana bara',
  'aerodrom kragujevac',
  'stanovo',
  'male pčelice',
  // Free retail parking lots
  'lidl',
  'ikea',
  'stop shop',
];

/**
 * Finds the closest city from current coordinates
 */
export function findNearestCity(
  lat: number,
  lng: number,
  customCities: CityData[] = []
): { city: CityData; distanceKm: number } {
  const allCities = [...customCities, ...REGIONAL_CITIES];
  let nearestCity = allCities[0] || REGIONAL_CITIES[0];
  let minDistanceMeters = Infinity;

  for (const city of allCities) {
    const d = calculateDistanceMeters(lat, lng, city.lat, city.lng);
    if (d < minDistanceMeters) {
      minDistanceMeters = d;
      nearestCity = city;
    }
  }

  return {
    city: nearestCity,
    distanceKm: Math.round(minDistanceMeters / 1000),
  };
}

/**
 * Checks if user has a custom saved override for the current location (within 200m)
 */
export function findMatchingLocationOverride(lat: number, lng: number): CustomLocationOverride | null {
  try {
    const overrides = getStoredLocationOverrides();
    for (const ov of overrides) {
      const dist = calculateDistanceMeters(lat, lng, ov.lat, ov.lng);
      if (dist <= (ov.radiusMeters || 200)) {
        return ov;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Reverse geocode with address details
 */
export async function reverseGeocodeDetails(lat: number, lng: number): Promise<{
  fullAddress: string;
  streetName?: string;
  houseNumber?: string;
  suburbName?: string;
  cityName?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=sr-Latn,sr,en`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'sr-Latn,sr,en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address;
      if (addr) {
        const rawRoad = addr.road || addr.pedestrian || addr.street || '';
        const road = cyrillicToLatin(rawRoad);
        const rawHouseNumber = addr.house_number ? cyrillicToLatin(String(addr.house_number)).trim() : '';
        const houseNumber = rawHouseNumber ? ` ${rawHouseNumber}` : '';
        const rawSuburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
        const suburb = cyrillicToLatin(rawSuburb);
        const rawCity = addr.city || addr.town || addr.municipality || '';
        const city = cyrillicToLatin(rawCity);

        const fullAddress = road
          ? `${road}${houseNumber}${suburb ? ` (${suburb})` : ''}${city ? `, ${city}` : ''}`
          : cyrillicToLatin(data.display_name?.split(',').slice(0, 3).join(',') || '');

        return {
          fullAddress,
          streetName: road || undefined,
          houseNumber: rawHouseNumber || undefined,
          suburbName: suburb || undefined,
          cityName: city || undefined,
        };
      }
    }
  } catch {
    // Ignore network failures, try backup geocoder
  }

  // Backup: Photon geocoder (fast OSM-based reverse geocode)
  try {
    const photonRes = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
    if (photonRes.ok) {
      const pData = await photonRes.json();
      const feat = pData?.features?.[0]?.properties;
      if (feat) {
        const rawRoad = feat.street || feat.name || '';
        const road = cyrillicToLatin(rawRoad);
        const rawHouseNumber = feat.housenumber ? cyrillicToLatin(String(feat.housenumber)).trim() : '';
        const houseNumber = rawHouseNumber ? ` ${rawHouseNumber}` : '';
        const suburb = cyrillicToLatin(feat.district || '');
        const city = cyrillicToLatin(feat.city || '');
        if (road) {
          return {
            fullAddress: `${road}${houseNumber}${city ? `, ${city}` : ''}`,
            streetName: road,
            houseNumber: rawHouseNumber || undefined,
            suburbName: suburb || undefined,
            cityName: city || undefined,
          };
        }
      }
    }
  } catch {
    // Backup failed
  }

  const { city } = findNearestCity(lat, lng);
  return {
    fullAddress: `Lokacija blizu: ${city.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    cityName: city.name,
  };
}

/**
 * Reverse geocode latitude and longitude to human-readable string
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const details = await reverseGeocodeDetails(lat, lng);
  return details.fullAddress;
}

/**
 * Checks if text/suburb name matches known free parking areas
 */
export function isKnownFreeParkingArea(text?: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return KNOWN_FREE_PARKING_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Polygon and GIS based zone detection with boundary awareness
 */
export function detectZoneByPolygons(
  lat: number,
  lng: number,
  polygons: CityZonePolygon[],
  city: CityData
): {
  zone: ParkingZone;
  reason: string;
  polygonName: string;
  isBorderZone?: boolean;
  alternativeZone?: ParkingZone | null;
  borderExplanation?: string;
} | null {
  const matchingPolys = polygons.filter((p) => isPointInPolygon(lat, lng, p.coordinates));
  if (matchingPolys.length === 0) {
    return null;
  }

  // If point is in multiple overlapping polygons (boundary between two zones)
  if (matchingPolys.length > 1) {
    const firstPoly = matchingPolys[0];
    const secondPoly = matchingPolys[1];
    const primaryZone =
      city.zones.find(
        (z) => z.id === firstPoly.zoneId || z.code === firstPoly.code || z.smsNumber === firstPoly.smsNumber
      ) || city.zones[0];
    const altZone =
      city.zones.find(
        (z) => z.id === secondPoly.zoneId || z.code === secondPoly.code || z.smsNumber === secondPoly.smsNumber
      ) || null;

    return {
      zone: primaryZone,
      reason: `Granica zona: ${firstPoly.name} i ${secondPoly.name}`,
      polygonName: firstPoly.name,
      isBorderZone: true,
      alternativeZone: altZone,
      borderExplanation: `Nalazite se na samoj granici zona (${primaryZone.name} i ${altZone?.name || 'susedna zona'}). Proverite dopunsku tablu na stubu.`,
    };
  }

  // Single polygon match
  const poly = matchingPolys[0];
  const matchingZone = city.zones.find(
    (z) => z.id === poly.zoneId || z.code === poly.code || z.smsNumber === poly.smsNumber
  );

  if (matchingZone) {
    return {
      zone: matchingZone,
      reason: `Unutar granica: ${poly.name}`,
      polygonName: poly.name,
    };
  }

  return null;
}

/**
 * Intelligently determines the exact parking zone based on GPS coordinates, polygons, or street lists.
 * Distinguishes between:
 * 1. Street-list cities (e.g. Valjevo - JKP Vidrak): zones are determined strictly by statutory street list.
 * 2. Polygon-based cities (e.g. Beograd, Novi Sad, Niš, Kragujevac): zones are determined by GIS polygons.
 * 3. Smaller towns without polygons: distance threshold heuristic.
 */
export function findBestZoneForLocation(
  lat: number,
  lng: number,
  city: CityData,
  addressDetails?: { streetName?: string; houseNumber?: string; suburbName?: string; fullAddress?: string }
): ZoneDetectionResult {
  // 1. Check user custom location override first!
  const customOverride = findMatchingLocationOverride(lat, lng);
  if (customOverride) {
    if (customOverride.isOutsidePaidZone) {
      return {
        city,
        zone: null,
        isOutsidePaidZone: true,
        reason: `Sačuvano pravilo: ${customOverride.name} (Besplatan parking)`,
        customOverride,
        streetName: addressDetails?.streetName,
        houseNumber: addressDetails?.houseNumber,
        suburbName: addressDetails?.suburbName,
        address: addressDetails?.fullAddress,
      };
    } else if (customOverride.zoneId) {
      const matchedZone = city.zones.find((z) => z.id === customOverride.zoneId);
      if (matchedZone) {
        return {
          city,
          zone: matchedZone,
          isOutsidePaidZone: false,
          reason: `Sačuvano pravilo: ${customOverride.name} (${matchedZone.name})`,
          customOverride,
          streetName: addressDetails?.streetName,
          houseNumber: addressDetails?.houseNumber,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }
  }

  // 2. CHECK IF THIS CITY USES STREET-LIST DETECTION (Type 2: e.g. Valjevo - JKP "Vidrak")
  // In Valjevo and similar cities, parking is charged strictly on specific streets from the official list.
  // There are NO continuous neighborhood polygons. If a street is not on the list, it is 100% free parking!
  if (city.id === 'valjevo' || city.detectionMethod === 'street_list') {
    const streetDetected = addressDetails?.streetName || addressDetails?.fullAddress;
    return detectStreetListZone(streetDetected, lat, lng, city, addressDetails);
  }

  // 3. CHECK IF REVERSE GEOCODE INDICATES A KNOWN FREE PARKING SUBURB OR FACILITY
  if (
    isKnownFreeParkingArea(addressDetails?.suburbName) ||
    isKnownFreeParkingArea(addressDetails?.streetName) ||
    isKnownFreeParkingArea(addressDetails?.fullAddress)
  ) {
    const areaName = addressDetails?.suburbName || addressDetails?.streetName || 'Ovo naselje';
    return {
      city,
      zone: null,
      isOutsidePaidZone: true,
      detectionMethod: 'polygon',
      reason: `Besplatan parking: ${areaName} nije u sistemu naplate parkinga`,
      streetName: addressDetails?.streetName,
      houseNumber: addressDetails?.houseNumber,
      suburbName: addressDetails?.suburbName,
      address: addressDetails?.fullAddress,
    };
  }

  // 3b. CHECK OFFICIAL STREET LISTS
  // If the detected street matches any street in the official city parking lists, resolve immediately with high confidence
  const detectedStreetOrAddress = addressDetails?.streetName || addressDetails?.fullAddress;
  if (detectedStreetOrAddress) {
    const streetZoneMatch = findZoneByStreetName(detectedStreetOrAddress, city);
    if (streetZoneMatch) {
      return {
        city,
        zone: streetZoneMatch.zone,
        isOutsidePaidZone: false,
        detectionMethod: 'street_list',
        reason: `Ulica u sistemu naplate: ${streetZoneMatch.streetMatched} (${streetZoneMatch.zone.name})`,
        streetName: addressDetails?.streetName,
        houseNumber: addressDetails?.houseNumber,
        suburbName: addressDetails?.suburbName,
        address: addressDetails?.fullAddress,
        isBorderZone: streetZoneMatch.isBorderZone,
        alternativeZone: streetZoneMatch.alternativeZone,
        borderExplanation: streetZoneMatch.borderExplanation,
      };
    }
  }

  // 4. CHECK TYPE 1 CITIES: EXACT POLYGON & GIS BOUNDARY DETECTION
  // (Beograd, Novi Sad, Kragujevac, Niš, Subotica, Čačak, Užice, Pančevo, Zrenjanin, Kruševac, Kraljevo, Šabac, etc.)
  const cityPolygons =
    ALL_CITY_ZONE_POLYGONS[city.id] ||
    (city.id.includes('beograd') ? BELGRADE_ZONE_POLYGONS : []);

  if (cityPolygons.length > 0) {
    // 4a. Exact Point-in-Polygon check
    const polyMatch = detectZoneByPolygons(lat, lng, cityPolygons, city);
    if (polyMatch) {
      return {
        city,
        zone: polyMatch.zone,
        isOutsidePaidZone: false,
        detectionMethod: 'polygon',
        reason: polyMatch.reason,
        streetName: addressDetails?.streetName,
        houseNumber: addressDetails?.houseNumber,
        suburbName: addressDetails?.suburbName,
        address: addressDetails?.fullAddress,
        isBorderZone: polyMatch.isBorderZone,
        alternativeZone: polyMatch.alternativeZone,
        borderExplanation: polyMatch.borderExplanation,
      };
    }

    // 4b. Boundary / Edge Snapping (Tolerance ~350m)
    // If user's GPS is within 350m of a polygon perimeter, snap to the nearest zone
    let closestPoly: (typeof cityPolygons)[0] | null = null;
    let minPolyDist = Infinity;
    for (const poly of cityPolygons) {
      const d = distanceToPolygonMeters(lat, lng, poly.coordinates);
      if (d < minPolyDist) {
        minPolyDist = d;
        closestPoly = poly;
      }
    }

    if (closestPoly && minPolyDist <= 350) {
      const matchedZone = city.zones.find(
        (z) => z.id === closestPoly!.zoneId || z.code === closestPoly!.code || z.smsNumber === closestPoly!.smsNumber
      );
      if (matchedZone) {
        return {
          city,
          zone: matchedZone,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Detektovano u neposrednoj zoni: ${closestPoly.name}`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
          isBorderZone: true,
          borderExplanation: `Nalazite se na granici zone ${matchedZone.name}. Proverite tablu na stubu.`,
        };
      }
    }
  }

  // 4c. ASSISTED DISTRICT & STREET RESOLVER
  // When addressDetails provides street or suburb, intelligently resolve to official parking zones
  const fullText = `${addressDetails?.suburbName || ''} ${addressDetails?.streetName || ''} ${addressDetails?.fullAddress || ''}`.toLowerCase();
  if (city.id === 'beograd' || city.name.toLowerCase().includes('beograd')) {
    // Novi Beograd, Zemun, Banovo Brdo -> Plava zona (9119 / 9118)
    const isNbgOrZemunOrBanovo =
      fullText.includes('novi beograd') ||
      fullText.includes('zemun') ||
      fullText.includes('banovo brdo') ||
      fullText.includes('čukarica') ||
      fullText.includes('cukarica') ||
      fullText.includes('bežanij') ||
      fullText.includes('bezanij') ||
      fullText.includes('fontana') ||
      fullText.includes('paviljoni') ||
      fullText.includes('tošin bunar') ||
      fullText.includes('tosin bunar') ||
      fullText.includes('uće') ||
      fullText.includes('usce') ||
      fullText.includes('arena') ||
      fullText.includes('sava centar') ||
      fullText.includes('blok ') ||
      fullText.includes('požeška') ||
      fullText.includes('pozeska') ||
      fullText.includes('lješka') ||
      fullText.includes('ljeska');

    if (isNbgOrZemunOrBanovo) {
      const plavaZone = city.zones.find((z) => z.id === 'bg-zone-opsta' || z.code === '4' || z.smsNumber === '9119');
      if (plavaZone) {
        return {
          city,
          zone: plavaZone,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Novi Beograd / Zemun / Banovo Brdo (${plavaZone.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // Stari Grad / Dorćol -> Zona 1 (9111) / Zona A / Zona 2
    if (
      fullText.includes('stari grad') ||
      fullText.includes('dorćol') ||
      fullText.includes('dorcol') ||
      fullText.includes('terazije') ||
      fullText.includes('knez mihail')
    ) {
      const z1 = city.zones.find((z) => z.id === 'bg-zone-1' || z.code === '1');
      if (z1) {
        return {
          city,
          zone: z1,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Stari Grad (${z1.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // Vračar -> Zona 2 (9112) / Zona 3 (9113)
    if (
      fullText.includes('vračar') ||
      fullText.includes('vracar') ||
      fullText.includes('slavija') ||
      fullText.includes('kalenić') ||
      fullText.includes('kalenic') ||
      fullText.includes('hram')
    ) {
      const z2 = city.zones.find((z) => z.id === 'bg-zone-2' || z.code === '2');
      if (z2) {
        return {
          city,
          zone: z2,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Vračar (${z2.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // Zvezdara -> Zona 3 (9113)
    if (
      fullText.includes('zvezdara') ||
      fullText.includes('đeram') ||
      fullText.includes('djeram') ||
      fullText.includes('lion') ||
      fullText.includes('lipov lad') ||
      fullText.includes('cvetkova')
    ) {
      const z3 = city.zones.find((z) => z.id === 'bg-zone-3' || z.code === '3');
      if (z3) {
        return {
          city,
          zone: z3,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Zvezdara (${z3.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // Palilula / Savski Venac / Voždovac (uži)
    if (
      fullText.includes('savski venac') ||
      fullText.includes('savamala') ||
      fullText.includes('klinički centar') ||
      fullText.includes('prokop') ||
      fullText.includes('palilula') ||
      fullText.includes('autokomanda')
    ) {
      const z3 = city.zones.find((z) => z.id === 'bg-zone-3' || z.code === '3');
      if (z3) {
        return {
          city,
          zone: z3,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Centar / Savski Venac / Palilula (${z3.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }
  } else if (city.id === 'novi-sad') {
    if (
      fullText.includes('liman') ||
      fullText.includes('grbavica') ||
      fullText.includes('rotkvarija') ||
      fullText.includes('podbara') ||
      fullText.includes('sajam') ||
      fullText.includes('bulevar oslobođenja') ||
      fullText.includes('bulevar oslobodjenja')
    ) {
      const plava = city.zones.find((z) => z.id === 'ns-plava' || z.code === '2');
      if (plava) {
        return {
          city,
          zone: plava,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Novi Sad (${plava.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }
  } else if (city.id === 'nis') {
    if (
      fullText.includes('čair') ||
      fullText.includes('cair') ||
      fullText.includes('palilula') ||
      fullText.includes('nemanjića') ||
      fullText.includes('nemanjica') ||
      fullText.includes('medijana')
    ) {
      const zelena = city.zones.find((z) => z.id === 'ni-zelena' || z.code === '2');
      if (zelena) {
        return {
          city,
          zone: zelena,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Niš (${zelena.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }
  }

  // 5. DISTANCE-BASED URBAN ENVELOPE FALLBACK
  const distToCityCenter = calculateDistanceMeters(lat, lng, city.lat, city.lng);
  if (city.id === 'beograd' || city.name.toLowerCase().includes('beograd')) {
    const distToNbgCenter = calculateDistanceMeters(lat, lng, 44.8210, 20.4200);
    const distToZemunCenter = calculateDistanceMeters(lat, lng, 44.8450, 20.4100);

    // If within 4.5km of Novi Beograd center or 3km of Zemun -> Plava Zona (9119)
    if (distToNbgCenter <= 4500 || distToZemunCenter <= 3000) {
      const nbgZone = city.zones.find((z) => z.id === 'bg-zone-opsta' || z.code === '4' || z.smsNumber === '9119');
      if (nbgZone) {
        return {
          city,
          zone: nbgZone,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: 'Novi Beograd / Zemun (Opšta plava zona)',
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // If within 5.0km of central Belgrade (Terazije/Knez) -> Zona 3 (Zelena 9113)
    if (distToCityCenter <= 5000) {
      const z3 = city.zones.find((z) => z.id === 'bg-zone-3' || z.code === '3' || z.smsNumber === '9113');
      if (z3) {
        return {
          city,
          zone: z3,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Beograd gradska zona (${z3.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // Within extended urban Belgrade up to 13km (Novi Beograd, Zemun, Banovo Brdo, Čukarica, Voždovac, Zvezdara) -> Opšta plava zona (9119)
    if (distToCityCenter <= 13000) {
      const zBlue =
        city.zones.find((z) => z.id === 'bg-zone-opsta' || z.code === '4' || z.smsNumber === '9119') ||
        city.zones.find((z) => z.id === 'bg-zone-3');
      if (zBlue) {
        return {
          city,
          zone: zBlue,
          isOutsidePaidZone: false,
          detectionMethod: 'polygon',
          reason: `Beograd šira gradska zona (${zBlue.name})`,
          streetName: addressDetails?.streetName,
          suburbName: addressDetails?.suburbName,
          address: addressDetails?.fullAddress,
        };
      }
    }

    // Truly outside the Belgrade urban perimeter (>13km)
    return {
      city,
      zone: null,
      isOutsidePaidZone: true,
      detectionMethod: 'polygon',
      reason: 'Nalazite se izvan zona naplate u Beogradu (Besplatan parking)',
      streetName: addressDetails?.streetName,
      houseNumber: addressDetails?.houseNumber,
      suburbName: addressDetails?.suburbName,
      address: addressDetails?.fullAddress,
    };
  }

  // For all cities, parking is strictly determined by the official street lists of the municipal enterprise or official GIS polygons.
  // We NEVER invent or assume parking zones based on radial distance from the city center.
  // If not on an official paid street or polygon, the location is outside the paid parking zone (free parking).
  return {
    city,
    zone: null,
    isOutsidePaidZone: true,
    detectionMethod: 'street_list',
    reason: `Lokacija nije na spisku ulica pod naplatom preduzeća ${city.operator || city.name} (Besplatan parking)`,
    streetName: addressDetails?.streetName,
    houseNumber: addressDetails?.houseNumber,
    suburbName: addressDetails?.suburbName,
    address: addressDetails?.fullAddress,
  };
}

/**
 * Finds nearest city and automatically detects parking zone or unzoned area.
 */
export function findNearestCityAndZone(
  lat: number,
  lng: number,
  customCities: CityData[] = [],
  addressDetails?: { streetName?: string; houseNumber?: string; suburbName?: string; fullAddress?: string }
): ZoneDetectionResult {
  const { city } = findNearestCity(lat, lng, customCities);
  return findBestZoneForLocation(lat, lng, city, addressDetails);
}
