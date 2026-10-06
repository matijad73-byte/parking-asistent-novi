/**
 * Utility for parsing and formatting Serbian and regional license plates.
 * Authentic Serbian license plates follow the format:
 * [Blue Strip: SRB] [City Latin: BG] [Shield + Cyrillic City: БГ] [Numbers: 512] [Separator: ▪/-] [Suffix: TX]
 */

export interface ParsedSerbianPlate {
  city: string;          // Latin city code, e.g. "BG"
  cityCyrillic: string;  // Cyrillic city code, e.g. "БГ"
  numbers: string;       // Registration digits, e.g. "512"
  suffix: string;        // Suffix letters, e.g. "TX"
  formatted: string;     // Canonical display string with dash, e.g. "BG 512-TX"
  cleanForSms: string;   // Uppercase alphanumeric for SMS, e.g. "BG512TX"
  isStandard: boolean;   // Whether it matched standard Serbian pattern
}

/**
 * Standard Serbian license plate city codes mapped to official Cyrillic equivalents
 */
export const SERBIAN_CITY_CODES_MAP: Record<string, string> = {
  BG: 'БГ', // Beograd
  NS: 'НС', // Novi Sad
  NI: 'НИ', // Niš
  KG: 'КГ', // Kragujevac
  SU: 'СУ', // Subotica
  ZR: 'ЗР', // Zrenjanin
  ČA: 'ЧА', // Čačak
  CA: 'ЧА', // Čačak
  KS: 'КС', // Kruševac
  KV: 'КВ', // Kraljevo
  SM: 'СМ', // Sremska Mitrovica
  ŠA: 'ША', // Šabac
  SA: 'ША', // Šabac
  PA: 'ПА', // Pančevo
  SO: 'СО', // Sombor
  PO: 'ПО', // Požarevac
  PI: 'ПИ', // Pirot
  JA: 'ЈА', // Jagodina
  VA: 'ВА', // Valjevo
  VR: 'ВР', // Vranje
  LE: 'ЛЕ', // Leskovac
  UE: 'УЕ', // Užice
  ZA: 'ЗА', // Zaječar
  KI: 'КИ', // Kikinda
  VŠ: 'ВШ', // Vršac
  VS: 'ВШ', // Vršac
  LO: 'ЛО', // Loznica
  BO: 'БО', // Bor
  BP: 'БП', // Bačka Palanka
  BT: 'БТ', // Bačka Topola
  AR: 'АР', // Aranđelovac
  BB: 'ББ', // Bajina Bašta
  BČ: 'БЧ', // Bela Crkva
  BC: 'БЧ', // Bela Crkva
  BU: 'БУ', // Bujanovac
  GL: 'ГЛ', // Gnjilane
  GM: 'ГМ', // Gornji Milanovac
  DE: 'ДЕ', // Despotovac
  ĐA: 'ЂА', // Đakovica
  DA: 'ЂА', // Đakovica
  IC: 'ИЦ', // Ivanjica
  IN: 'ИН', // Inđija
  KA: 'КА', // Kanjiža
  KL: 'КЛ', // Kladovo
  KM: 'КМ', // Kosovska Mitrovica
  KO: 'КО', // Kovin
  KŽ: 'КЖ', // Knjaževac
  KZ: 'КЖ', // Knjaževac
  LB: 'ЛБ', // Lebane
  LU: 'ЛУ', // Lučani
  MA: 'МА', // Majdanpek
  NG: 'НГ', // Negotin
  NP: 'НП', // Novi Pazar
  NV: 'НВ', // Nova Varoš
  PB: 'ПБ', // Priboj
  PE: 'ПЕ', // Peć
  PK: 'ПК', // Prokuplje
  PP: 'ПП', // Prijepolje
  PR: 'ПР', // Priština
  PZ: 'ПЗ', // Prizren
  RA: 'РА', // Raška
  RU: 'РУ', // Ruma
  SC: 'СЦ', // Surdulica
  SD: 'СД', // Smederevo
  SJ: 'СЈ', // Sjenica
  SP: 'СП', // Smederevska Palanka
  ST: 'СТ', // Stara Pazova
  SV: 'СВ', // Svilajnac
  ŠI: 'ШИ', // Šid
  SI: 'ШИ', // Šid
  TO: 'ТО', // Topola
  TS: 'ТС', // Trstenik
  TT: 'ТТ', // Tutin
  ĆU: 'ЋУ', // Ćuprija
  CU: 'ЋУ', // Ćuprija
  UB: 'УБ', // Ub
  UR: 'УР', // Uroševac
  VB: 'ВБ', // Vrnjačka Banja
  VL: 'ВЛ', // Vlasotince
};

/**
 * Fallback transliteration from Serbian Latin to Serbian Cyrillic
 */
export function transliterateLatinToCyrillic(latin: string): string {
  if (!latin) return '';
  const upper = latin.toUpperCase();
  // Digraphs first
  let res = upper
    .replace(/DŽ/g, 'Џ')
    .replace(/DJ/g, 'Ђ')
    .replace(/LJ/g, 'Љ')
    .replace(/NJ/g, 'Њ');

  const charMap: Record<string, string> = {
    A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', Đ: 'Ђ',
    E: 'Е', Ž: 'Ж', Z: 'З', I: 'И', J: 'Ј', K: 'К',
    L: 'Л', M: 'М', N: 'Н', O: 'О', P: 'П', R: 'Р',
    S: 'С', T: 'Т', U: 'У', F: 'Ф', H: 'Х', C: 'Ц',
    Č: 'Ч', DŽ: 'Џ', Š: 'Ш', Ć: 'Ћ'
  };

  return res.split('').map((char) => charMap[char] || char).join('');
}

/**
 * Parses any license plate string (e.g. "BG 512-TX", "BG 512 TX", "BG512TX", "bg-512-tx")
 * into structural parts for authentic license plate rendering.
 */
export function parseSerbianPlate(rawPlate: string): ParsedSerbianPlate {
  if (!rawPlate) {
    return {
      city: 'BG',
      cityCyrillic: 'БГ',
      numbers: '512',
      suffix: 'TX',
      formatted: 'BG 512-TX',
      cleanForSms: 'BG512TX',
      isStandard: true,
    };
  }

  const clean = rawPlate.trim().toUpperCase();
  const cleanAlphanumeric = clean.replace(/[^A-Z0-9ŠĐČĆŽ]/g, '');

  // 1. Try standard pattern: 2 letters (city) + 3 to 5 digits + 2 letters (suffix)
  // Handles: "BG 512-TX", "BG 512 TX", "BG512TX", "BG-512-TX", "BG 1234-AB", "ČA 842-KM"
  const standardMatch = clean.match(/^([A-ZŠĐČĆŽ]{2})[\s\-]*([0-9]{3,5})[\s\-]*([A-ZŠĐČĆŽ]{2})$/i);
  if (standardMatch) {
    const city = standardMatch[1].toUpperCase();
    const numbers = standardMatch[2];
    const suffix = standardMatch[3].toUpperCase();
    const cityCyrillic = SERBIAN_CITY_CODES_MAP[city] || transliterateLatinToCyrillic(city);
    return {
      city,
      cityCyrillic,
      numbers,
      suffix,
      formatted: `${city} ${numbers}-${suffix}`,
      cleanForSms: `${city}${numbers}${suffix}`,
      isStandard: true,
    };
  }

  // 2. Try match on alphanumeric string: 2 letters + 3-5 digits + 2 letters
  const alphaMatch = cleanAlphanumeric.match(/^([A-ZŠĐČĆŽ]{2})([0-9]{3,5})([A-ZŠĐČĆŽ]{2})$/);
  if (alphaMatch) {
    const city = alphaMatch[1];
    const numbers = alphaMatch[2];
    const suffix = alphaMatch[3];
    const cityCyrillic = SERBIAN_CITY_CODES_MAP[city] || transliterateLatinToCyrillic(city);
    return {
      city,
      cityCyrillic,
      numbers,
      suffix,
      formatted: `${city} ${numbers}-${suffix}`,
      cleanForSms: `${city}${numbers}${suffix}`,
      isStandard: true,
    };
  }

  // 3. Flexible match: 1-3 letters + digits + 1-3 letters (covers taxi "TX", custom plates, 4-digit plates)
  const flexMatch = clean.match(/^([A-ZŠĐČĆŽ]{1,3})[\s\-]*([0-9]{2,6})[\s\-]*([A-ZŠĐČĆŽ]{1,3})$/i);
  if (flexMatch) {
    const city = flexMatch[1].toUpperCase();
    const numbers = flexMatch[2];
    const suffix = flexMatch[3].toUpperCase();
    const cityCyrillic = SERBIAN_CITY_CODES_MAP[city] || transliterateLatinToCyrillic(city);
    return {
      city,
      cityCyrillic,
      numbers,
      suffix,
      formatted: `${city} ${numbers}-${suffix}`,
      cleanForSms: `${city}${numbers}${suffix}`,
      isStandard: true,
    };
  }

  // 4. Fallback for non-standard formats (e.g. foreign plate, custom word plate)
  // Ensure we still provide a clean formatted string
  let fallbackFormatted = clean;
  // If it has digits followed by letters without a dash, insert dash
  if (!fallbackFormatted.includes('-')) {
    fallbackFormatted = fallbackFormatted.replace(/([0-9]+)\s*([A-ZŠĐČĆŽ]+)$/i, '$1-$2');
  }

  const parts = fallbackFormatted.split(/[\s\-]+/);
  const cityGuess = parts[0]?.toUpperCase() || 'BG';
  const cityCyrillic = SERBIAN_CITY_CODES_MAP[cityGuess] || transliterateLatinToCyrillic(cityGuess);

  return {
    city: cityGuess,
    cityCyrillic,
    numbers: parts[1] || '',
    suffix: parts[2] || '',
    formatted: fallbackFormatted,
    cleanForSms: cleanAlphanumeric,
    isStandard: false,
  };
}

/**
 * Formats user input as standard canonical plate representation (e.g. "BG 512-TX")
 */
export function formatPlateCanonical(raw: string): string {
  const parsed = parseSerbianPlate(raw);
  return parsed.formatted;
}
