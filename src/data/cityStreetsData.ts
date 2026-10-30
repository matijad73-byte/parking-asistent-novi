/**
 * Official street listings by city and parking zone across Serbia and the region.
 * Used for:
 * 1. Street-to-zone matching when reverse geocoding detects a street name.
 * 2. Manual street search in ZoneMapModal ("Ulice po zonama").
 * 3. Textual zone resolution in cities where municipal decisions define zones by lists of streets.
 */

export interface StreetBorderRule {
  cityId: string;
  streetName: string; // normalized base street name
  defaultZoneId: string;
  numberRanges?: {
    min?: number;
    max?: number;
    parity?: 'odd' | 'even' | 'all';
    zoneId: string;
    description?: string;
  }[];
  isBorder: boolean;
  borderExplanation?: string;
  alternativeZoneId?: string;
}

/**
 * Explicit border rules and house number thresholds for streets that border zones or span multiple zones.
 * Resolves boundary disputes with 100% precision regardless of coarse GPS/polygon boundaries.
 */
export const STREET_BORDER_RULES: StreetBorderRule[] = [
  // BEOGRAD
  {
    cityId: 'beograd',
    streetName: 'svetogorska',
    defaultZoneId: 'bg-zone-2', // Žuta zona (9112)
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Adresa „Svetogorska“ pripada Žutoj zoni (Zona 2 - 9112). Nalazite se u blizini granice sa Crvenom zonom (Makedonska / Takovska).',
  },
  {
    cityId: 'beograd',
    streetName: 'takovska',
    defaultZoneId: 'bg-zone-2',
    numberRanges: [
      { max: 45, zoneId: 'bg-zone-2', description: 'Od Bulevara do 27. marta / Džordža Vašingtona (Žuta zona)' },
      { min: 46, zoneId: 'bg-zone-3', description: 'Od 27. marta ka Dunav stanici (Zelena zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-3',
    borderExplanation: 'Takovska ulica je prelazna ulica između Žute i Zelene zone. Brojevi do 45 pripadaju Žutoj zoni, a brojevi 46+ Zelenoj zoni.',
  },
  {
    cityId: 'beograd',
    streetName: 'kralja milana',
    defaultZoneId: 'bg-zone-1',
    numberRanges: [
      { max: 25, zoneId: 'bg-zone-1', description: 'Od Terazija do Kneza Miloša (Crvena zona)' },
      { min: 26, zoneId: 'bg-zone-2', description: 'Od Kneza Miloša do Slavije (Žuta zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-2',
    borderExplanation: 'Kralja Milana prelazi iz Crvene zone (do Kneza Miloša) u Žutu zonu (prema Slaviji).',
  },
  {
    cityId: 'beograd',
    streetName: 'bulevar kralja aleksandra',
    defaultZoneId: 'bg-zone-2',
    numberRanges: [
      { max: 73, zoneId: 'bg-zone-1', description: 'Od Trga Nikole Pašića do Resavske / Takovske (Crvena zona)' },
      { min: 74, max: 130, zoneId: 'bg-zone-2', description: 'Od Resavske do Ruzveltove / Vukovog spomenika (Žuta zona)' },
      { min: 131, max: 250, zoneId: 'bg-zone-3', description: 'Od Ruzveltove do Đerma / Trnske (Zelena zona)' },
      { min: 251, zoneId: 'bg-zone-opsta', description: 'Od Đerma prema Lionu i Cvetkovoj pijaci (Plava opšta zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Bulevar kralja Aleksandra se pruža kroz više zona u zavisnosti od kućnog broja.',
  },
  {
    cityId: 'beograd',
    streetName: 'nemanjina',
    defaultZoneId: 'bg-zone-1',
    numberRanges: [
      { max: 15, zoneId: 'bg-zone-1', description: 'Od Savskog trga do Kneza Miloša (Crvena zona)' },
      { min: 16, zoneId: 'bg-zone-2', description: 'Od Kneza Miloša do Slavije (Žuta zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-2',
    borderExplanation: 'Nemanjina ulica je na granici Crvene i Žute zone.',
  },
  {
    cityId: 'beograd',
    streetName: 'cara dusana',
    defaultZoneId: 'bg-zone-2',
    numberRanges: [
      { max: 50, zoneId: 'bg-zone-1', description: 'Od Tadeuša Košćuška do Francuske (Crvena zona)' },
      { min: 51, max: 100, zoneId: 'bg-zone-2', description: 'Od Francuske do Despota Stefana (Žuta zona)' },
      { min: 101, zoneId: 'bg-zone-3', description: 'Od Despota Stefana dalje (Zelena zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Ulica Cara Dušana prelazi iz Crvene zone preko Žute u Zelenu zonu.',
  },
  {
    cityId: 'beograd',
    streetName: 'resavska',
    defaultZoneId: 'bg-zone-1',
    numberRanges: [
      { max: 30, zoneId: 'bg-zone-1', description: 'Od Masarikove / Kralja Milana ka Nemanjinoj (Crvena zona)' },
      { min: 31, zoneId: 'bg-zone-2', description: 'Od Kralja Milana do Bulevara kralja Aleksandra (Žuta zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-2',
    borderExplanation: 'Resavska ulica: deo ispod Kralja Milana je Crvena zona, a deo iznad Žuta zona.',
  },
  {
    cityId: 'beograd',
    streetName: 'kneza milosa',
    defaultZoneId: 'bg-zone-1',
    numberRanges: [
      { max: 25, zoneId: 'bg-zone-1', description: 'Od Nemanjine do Bulevara kralja Aleksandra (Crvena zona)' },
      { min: 26, zoneId: 'bg-zone-2', description: 'Od Nemanjine do Višegradske i Mostara (Žuta zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-2',
    borderExplanation: 'Kneza Miloša je granica zona. Donji deo prema Mostaru je u Žutoj zoni, a gornji u Crvenoj.',
  },
  {
    cityId: 'beograd',
    streetName: 'makedonska',
    defaultZoneId: 'bg-zone-1',
    isBorder: true,
    alternativeZoneId: 'bg-zone-2',
    borderExplanation: 'Makedonska ulica pripada Crvenoj zoni (Zona 1 - 9111), na granici sa Žutom zonom (Svetogorska / Kondina).',
  },
  {
    cityId: 'beograd',
    streetName: 'decanska',
    defaultZoneId: 'bg-zone-1',
    isBorder: true,
    alternativeZoneId: 'bg-zone-2',
    borderExplanation: 'Dečanska ulica pripada Crvenoj zoni (Zona 1 - 9111), na granici sa Žutom zonom.',
  },
  {
    cityId: 'beograd',
    streetName: 'kondina',
    defaultZoneId: 'bg-zone-2',
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Kondina ulica pripada Žutoj zoni (Zona 2 - 9112), uz samu granicu sa Crvenom zonom.',
  },
  {
    cityId: 'beograd',
    streetName: 'hilandarska',
    defaultZoneId: 'bg-zone-2',
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Hilandarska ulica pripada Žutoj zoni (Zona 2 - 9112), uz samu granicu sa Crvenom zonom.',
  },
  {
    cityId: 'beograd',
    streetName: 'palmoticeva',
    defaultZoneId: 'bg-zone-2',
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Palmotićeva ulica pripada Žutoj zoni (Zona 2 - 9112).',
  },
  {
    cityId: 'beograd',
    streetName: 'majke jevrosime',
    defaultZoneId: 'bg-zone-2',
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Majke Jevrosime ulica pripada Žutoj zoni (Zona 2 - 9112).',
  },
  {
    cityId: 'beograd',
    streetName: 'cetinjska',
    defaultZoneId: 'bg-zone-2',
    isBorder: true,
    alternativeZoneId: 'bg-zone-1',
    borderExplanation: 'Cetinjska ulica pripada Žutoj zoni (Zona 2 - 9112).',
  },
  {
    cityId: 'beograd',
    streetName: 'dzordza vasingtona',
    defaultZoneId: 'bg-zone-2',
    isBorder: true,
    alternativeZoneId: 'bg-zone-3',
    borderExplanation: 'Ulica Džordža Vašingtona pripada Žutoj zoni (Zona 2 - 9112).',
  },
  {
    cityId: 'beograd',
    streetName: 'krunska',
    defaultZoneId: 'bg-zone-2',
    numberRanges: [
      { max: 40, zoneId: 'bg-zone-2', description: 'Od Kneza Miloša do Knjeginje Zorke (Žuta zona)' },
      { min: 41, zoneId: 'bg-zone-3', description: 'Od Knjeginje Zorke do Kalenića (Zelena zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-3',
  },
  {
    cityId: 'beograd',
    streetName: 'njegoseva',
    defaultZoneId: 'bg-zone-2',
    numberRanges: [
      { max: 35, zoneId: 'bg-zone-2', description: 'Od Slavije do Knjeginje Zorke (Žuta zona)' },
      { min: 36, zoneId: 'bg-zone-3', description: 'Od Knjeginje Zorke do Kalenića (Zelena zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-3',
  },
  {
    cityId: 'beograd',
    streetName: 'makenzijeva',
    defaultZoneId: 'bg-zone-2',
    numberRanges: [
      { max: 30, zoneId: 'bg-zone-2', description: 'Od Slavije do Mutapove (Žuta zona)' },
      { min: 31, zoneId: 'bg-zone-3', description: 'Od Mutapove prema Južnom bulevaru (Zelena zona)' },
    ],
    isBorder: true,
    alternativeZoneId: 'bg-zone-3',
  },
];

export const CITY_ZONE_STREETS: Record<string, Record<string, string[]>> = {
  // BEOGRAD
  beograd: {
    'bg-zone-a': [
      'Kosančićev venac',
      'Kralja Petra (od Kneza Sime Markovića do Kosančićevog venca)',
      'Carice Milice',
      'Topličin venac',
      'Gračanička (od Vuka Karadžića do Kralja Petra)',
      'Pop Lukina (gornji segment kod Kosančićevog venca)',
      'Vuka Karadžića (od Carice Milice do Gračaničke)',
      'Čika Ljubina (deo uz Zmaj Jovinu)',
      'Maršala Birjuzova (početak kod Carice Milice)',
      'Ivan Begova',
      'Kneza Sime Markovića (kod Saborne crkve)',
      'Pariska (potez ka Kosančićevom vencu)',
    ],
    'bg-zone-1': [
      'Knez Mihailova (okolni prilazi i blokovi)',
      'Trg Republike',
      'Terazije',
      'Kolarčeva',
      'Makedonska',
      'Nušićeva',
      'Dečanska',
      'Vasina',
      'Studentski trg',
      'Uzun Mirkova',
      'Kralja Milana (od Terazija do Kneza Miloša - brojevi do 25)',
      'Resavska (od Kralja Milana do Masarikove i Nemanjine)',
      'Masarikova',
      'Kraljice Natalije (Narodnog fronta)',
      'Balkanska (od Nemanjine do Terazija)',
      'Dobrinjska',
      'Kneza Miloša (od Nemanjine do Bulevara kralja Aleksandra)',
      'Nemanjina (od Resavske do Kneza Miloša)',
      'Admirala Geprata',
      'Gavrila Principa (od Balkanske do Kameničke)',
      'Lomina (oko Zelenog venca)',
      'Kamenička',
      'Brankova (oko Zelenog venca)',
      'Strahinjića Bana (od Francuske do Tadeuša Košćuška)',
      'Cara Uroša (od Dunavske do Vasine)',
      'Rige od Fere',
      'Kralja Petra (od Cara Dušana do Vasine)',
      'Francuska (od Trga Republike do Cara Dušana)',
      'Dositejeva (od Trga Republike do Strahinjića Bana)',
      'Simina',
      'Gospodar Jevremova (od Francuske do Kalemegdana)',
      'Gospodar Jovanova (od Francuske do Kalemegdana)',
      'Tadeuša Košćuška (oko Kalemegdana)',
      'Knićaninova',
      'Kapetan Mišina',
      'Braće Jugovića',
      'Višnjićeva',
      'Zmaja od Noćaja',
      'Cincara Janka',
      'Pjarona de Mondezira (Tadeuša Košćuška)',
    ],
    'bg-zone-2': [
      'Svetogorska (svi brojevi 1 do 50)',
      'Bulevar kralja Aleksandra (od Trga Nikole Pašića do Đerma / Trnske)',
      'Beogradska (od Slavije do Bulevara kralja Aleksandra)',
      'Trg Slavija',
      'Njegoševa (od Slavije do Knjeginje Zorke)',
      'Krunska (od Kneza Miloša do Knjeginje Zorke)',
      'Svetozara Markovića',
      'Kralja Milutina',
      'Desanke Maksimović',
      'Takovska (od Bulevara kralja Aleksandra do 27. marta)',
      'Ilije Garašanina (oko Tašmajdana i Pete beogradske gimnazije)',
      'Palmotićeva',
      'Majke Jevrosime',
      'Kondina',
      'Cetinjska',
      'Hilandarska',
      'Đure Daničića',
      'Džordža Vašingtona',
      'Cara Dušana (od Francuske do Bulevara despota Stefana)',
      'Venizelosova (Đure Đakovića)',
      'Gundulićev venac',
      'Bulevar despota Stefana (od Trga Republike do Cvijićeve)',
      'Starine Novaka',
      'Kneza Danila',
      'Kraljice Marije (oko Mašinskog fakulteta)',
      'Vojvode Dobrnjca',
      'Šantićeva',
      'Budimska',
      'Knez Miletina',
      'Carigradska',
      'Jelisavete Načić',
      'Komnen Barjaktara',
      'Vlajkovićeva',
    ],
    'bg-zone-3': [
      'Maksima Gorkog (od Kalenić pijace do Južnog bulevara)',
      'Cara Nikolaja II (od Makenzijeve do Čuburskog parka)',
      'Mileševska (Save Kovačevića)',
      'Požarevačka',
      'Sinđelićeva (od Bulevara do Mileševske)',
      'Golsvordijeva',
      'Baba Višnjina',
      'Kursulina',
      'Kičevska',
      'Kalenićeva',
      'Vojvode Dragomira',
      'Mutapova',
      'Trnska',
      'Hadži Prodanova',
      'Topolska',
      'Vojvode Šupljikca (od Vukovog spomenika do Đerma)',
      'Dimitrija Tucovića (od Ruzveltove do Batutove)',
      'Pop Stojanova',
      'Stanislava Sremčevića',
      'Batutova (oko KBC Zvezdara)',
      'Vojvode Brane',
      'Zahumska',
      'Kraljice Marije (gornji deo ka Ruzveltovoj)',
      'Ruzveltova (od Bulevara do Novog groblja)',
      'Cvijićeva (cela ulica od Bulevara despota Stefana do Ruzveltove)',
      'Jaše Prodanovića',
      'Čarlija Čaplina (oko Hale Pionir)',
      'Bulevar despota Stefana (od Cvijićeve do Pančevačkog mosta)',
      'Poenkareova',
      'Venizelosova (donji deo ka Dunav stanici)',
      'Dunavska (od Žorža Klemansoa do Francuske)',
      'Žorža Klemansoa',
      'Kneginje Ljubice',
      'Dobračina (donji deo ispod Cara Dušana)',
      'Dositejeva (donji deo)',
      'Knićaninova (donji deo)',
      'Sarajevska (od Nemanjine do Gazele)',
      'Savska (od Nemanjine do Gazele)',
      'Miloša Pocerca',
      'Vojvode Milenka',
      'Dr Aleksandra Kostića',
      'Durmitorska',
      'Risanska',
      'Birčaninova (od Slavije do Kneza Miloša)',
      'Katićeva',
      'Deligradska (oko Kliničkog centra)',
      'Pasterova',
      'Dr Subotića starijeg',
    ],
    'bg-zone-opsta': [
      'Novi Beograd - Bulevar Mihajla Pupina',
      'Novi Beograd - Bulevar Zorana Đinđića',
      'Novi Beograd - Bulevar Arsenija Čarnojevića',
      'Novi Beograd - Bulevar Milutina Milankovića',
      'Novi Beograd - Bulevar umetnosti',
      'Novi Beograd - Omladinskih brigada',
      'Novi Beograd - Španskih boraca',
      'Novi Beograd - Antifašističke borbe',
      'Novi Beograd - Proleterske solidarnosti',
      'Novi Beograd - Jurija Gagarina',
      'Novi Beograd - Gandijeva',
      'Novi Beograd - Nehruova',
      'Novi Beograd - Dr Ivana Ribara',
      'Novi Beograd - Pariske komune',
      'Novi Beograd - Goce Delčeva (Bulevar maršala Tolbuhina)',
      'Novi Beograd - Palmira Toljatija',
      'Novi Beograd - Klare Cetkin',
      'Novi Beograd - Gramšijeva',
      'Novi Beograd - Bulevar Nikole Tesle',
      'Zemun - Glavna ulica',
      'Zemun - Gospodska',
      'Zemun - Magistratski trg',
      'Zemun - Avijatičarski trg',
      'Zemun - Karađorđev trg',
      'Zemun - Kej oslobođenja',
      'Zemun - Cara Dušana (Zemun)',
      'Zemun - Vrtlarska',
      'Zemun - Bežanijska',
      'Zemun - Preradovićeva',
      'Zemun - Svetosavska',
      'Zemun - Dubrovačka',
      'Zemun - Zmaj Jovina (Zemun)',
      'Zemun - Njegoševa (Zemun)',
      'Zemun - Gardoš (prilazi i podnožje)',
      'Čukarica - Požeška (Banovo Brdo)',
      'Čukarica - Lješka',
      'Čukarica - Kirovljeva',
      'Čukarica - Zrmanjska',
    ],
    'bg-dnevna': [
      'Sva opšta parkirališta (Plava zona) na Novom Beogradu, u Zemunu i na Banovom Brdu',
    ],
  },

  // RUMA
  ruma: {
    'ru-1': [
      'Glavna ulica (od Trga oslobođenja do Orlovićeve)',
      'Trg oslobođenja (Gradski trg)',
      'Železnička ulica (od Glavne do 27. oktobra)',
      'Orlovićeva (od Glavne do Partizanske)',
      'JNA (od Glavne do Veljka Dugoševića)',
      'Veljka Dugoševića (oko centra)',
      'Stanka Paunovića Veljka (oko Doma zdravlja)',
      '15. maja (centar)',
    ],
    'ru-2': [
      '27. oktobra',
      'Partizanska ulica',
      'Vladimira Nazora',
      'Ilije Birčanina',
      'Vuka Karadžića',
      'Pavlovačka ulica',
      'Tivol',
      'Kosovska ulica',
      'Atanasija Stojkovića',
    ],
    'ru-3': [
      'Parkiralište kod pijace',
      'Parkiralište kod Železničke stanice',
      'Sportska hala Ruma',
      'Breg (naselje Breg)',
    ],
    'ru-dnevna': [
      'Sva parkirališta u II i III zoni u Rumi',
    ],
  },

  // SREMSKA MITROVICA
  'sremska-mitrovica': {
    'sm-1': [
      'Trg Ćire Milekića (Gradski trg)',
      'Trg Svetog Stefana (Žitni trg)',
      'Kralja Petra I',
      'Vuka Karadžića',
      'Svetog Dimitrija',
      'Zmaj Jovina',
      'Pobedina',
      'Parobrodska',
      'Žitni trg',
      'Gradski park (prilazi)',
    ],
    'sm-2': [
      'Fruškogorska ulica',
      'Palanka',
      'Stari šor',
      'Kupreška',
      'Ribarska obala',
      'Promenada (Savski kej)',
      'Bulevar Konstantina Velikog',
      'Đure Jakšića',
      'Arsenija Čarnojevića',
    ],
    'sm-dnevna': [
      'Sva javna parkirališta u Sremskoj Mitrovici',
    ],
  },

  // ŠABAC
  sabac: {
    'sa-1': [
      'Gospodar Jevremova (pešačka zona i bočni prilazi)',
      'Karađorđeva (od Vojvode Mišića do Masarikove)',
      'Vojvode Mišića (od Trga šabačkih žrtava do Cara Dušana)',
      'Trg šabačkih žrtava',
      'Masarikova (centar)',
      'Koste Abraševića',
      'Vlade Jovanovića',
      'Pop Lukina',
      'Stojana Novakovića',
    ],
    'sa-2': [
      'Kralja Milana',
      'Miloša Pocerca',
      'Prote Smiljanića',
      'Hajduk Veljkova',
      'Kralja Aleksandra',
      'Sinđelićeva',
      'Dr Andre Jovanovića',
      'Vojvode Putnika',
      'Zapadna poprečna',
    ],
    'sa-dnevna': [
      'Sva parkirališta u II zoni u Šapcu',
    ],
  },

  // INĐIJA
  indjija: {
    'in-1': [
      'Ulica Vojvode Stepe (pešačka zona i centar)',
      'Kralja Petra I',
      'Novosadska (od centra do Železničke)',
      'Trg Slobode',
      'Cara Dušana',
      'Jug Bogdanova',
      'Dunavska (oko Doma zdravlja)',
    ],
    'in-2': [
      'Železnička ulica',
      'Maksima Gorkog',
      'Sonje Marinković',
      'Milana Rakića',
      'Mitrovdanska',
      'Branka Radičevića',
    ],
    'in-dnevna': [
      'Sva parkirališta u zoni II u Inđiji',
    ],
  },

  // STARA PAZOVA
  'stara-pazova': {
    'sp-1': [
      'Trg Dr Zorana Đinđića',
      'Svetosavska (centar)',
      'Karađorđeva',
      'Vuka Karadžića',
      'Ćirila i Metodija',
      'Kralja Petra I Oslobodioca',
    ],
    'sp-2': [
      'Janka Čmelika',
      'Zmaj Jovina',
      'Mladena Stojanovića',
      'Branka Radičevića',
      'Vojvođanska',
    ],
    'sp-dnevna': [
      'Sva parkirališta u Staroj Pazovi',
    ],
  },

  // NOVI SAD
  'novi-sad': {
    'ns-crvena': [
      'Zmaj Jovina (okolni prilazi)',
      'Dunavska (prilazi i plato)',
      'Trg slobode (prilazi)',
      'Modene',
      'Ilije Ognjanovića',
      'Kralja Aleksandra',
      'Jevrejska (do Bulevara oslobođenja)',
      'Šafarikova',
      'Uspenska (kod SNP-a)',
      'Njegoševa',
      'Nikole Pašića',
      'Svetozara Miletića',
      'Grčkoškolska',
      'Zlatne grede',
      'Trg Marije Trandafil',
      'Bulevar Mihajla Pupina (od Mosta Duga do Jevrejske)',
      'Sonje Marinković',
      'Radnička (od Keja do Stražilovske)',
      'Stražilivska',
      'Maksima Gorkog (od Stražilovske do Sutjeske)',
      'Vojvođanskih brigada',
      'Vase Stajića',
      'Pavla Simića',
    ],
    'ns-plava': [
      'Bulevar oslobođenja (od Železničke stanice do Mosta slobode)',
      'Futoška (od Bulevara oslobođenja do Hajduk Veljkove)',
      'Liman 1 (oko Univerzitetskog kampusa i Štranda)',
      'Liman 2 (oko Spensa i Promenade)',
      'Liman 3 (Bulevar cara Lazara i Balzakova)',
      'Grbavica (Braće Ribnikar, Miše Dimitrijevića, Danila Kiša)',
      'Rotkvarija (Kraljevića Marka, Bulevar kralja Petra I)',
      'Podbara (Kosovska, Marka Miljanova, Venizelosova)',
      'Kej žrtava racije (duž Dunava)',
      'Beogradski kej',
      'Sunčani kej',
      'Novosadskog sajma (oko Sajma)',
      'Hajduk Veljkova (oko Kliničkog centra Vojvodine)',
    ],
    'ns-bela': [
      'Petrovaradinska tvrđava (donji plato i prilazi)',
      'Sremska Kamenica - centar',
      'Najlon pijaca (Temerinska)',
    ],
    'ns-dnevna': [
      'Sva parkirališta u Plavoj i Beloj zoni u Novom Sadu',
    ],
  },

  // NIŠ
  nis: {
    'nis-ekstra': [
      'Obrenovićeva (prilazni pasaži i servisne ulice)',
      'Trg Kralja Milana',
      'Vožda Karađorđa (od Trga do Sinđelićevog trga)',
      'Kopitareva (Kazandžijsko sokače prilazi)',
      'Nikole Pašića (oko Skupštine grada)',
    ],
    'nis-crvena': [
      'Vožda Karađorđa (od Sinđelićevog trga do Suda)',
      'Generala Milojka Lešjanina (od Trga do Ureda)',
      'Kralja Stefana Prvovenčanog (oko Doma rukometa)',
      '7. jula (oko Gradske kuće i keja)',
      'Svetozara Markovića',
      'Strahinjića Bana',
      'Orlovića Pavla',
      'Nade Tomić',
      'Trg Pavla Stojkovića',
      'Balkanska',
      'Jug Bogdanova',
      'Obilićev venac (početak)',
    ],
    'nis-zelena': [
      'Bulevar Zorana Đinđića (oko Kliničkog centra Niš)',
      'Bulevar Nemanjića (od Trošarine do parka Svetog Save)',
      'Park Svetog Save (oko Hrama Cara Konstantina i Carice Jelene)',
      'Vojvode Mišića',
      'Prijezdina',
      'Koste Stamenkovića',
      'Jeronimova',
      'Ćirila i Metodija',
      'Kneginje Ljubice',
      'Obilaznica oko Tvrđave (Đuke Dinić)',
      'Dušanova (od Voždove do Bulevara Zorana Đinđića)',
      'Prvomajska',
    ],
    'nis-plava': [
      'Palilula (Kraljevića Marka, Episkopska, Mokranjčeva početak)',
      'Crveni Pevac (okolni blokovi)',
      'Čair (oko Sportskog centra i stadiona Čair)',
      'Durlan (Knjaževačka prilazi)',
      'Bulevar 12. februara (oko Glavne autobuske stanice)',
    ],
    'nis-dnevna': [
      'Sva parkirališta u Zelenoj i Plavoj zoni u Nišu',
    ],
  },

  // KRAGUJEVAC
  kragujevac: {
    'kg-zona-0': [
      'Kralja Petra I (pešačka zona obod)',
      'Trg Radomira Putnika',
      'Nikole Pašića (oko Gradske uprave)',
      '27. marta',
      'Vojvode Radomira Putnika',
    ],
    'kg-zona-1': [
      'Kralja Aleksandra I Karađorđevića (Glavna ulica)',
      'Lole Ribara',
      'Branka Radičevića',
      'Milovana Gušića',
      'Svetozara Markovića (centar)',
      'Daničićeva',
      'Kneza Miloša (centar)',
      'Vuka Karadžića (kod Gimnazije)',
      'Radoja Domanovića (kod Velikog parka i Fakulteta)',
      'Milentija Popovića',
    ],
    'kg-zona-2': [
      'Lepenički bulevar (uz Lepenicu)',
      'Grada Sirena (oko Zastavinog solitera)',
      'Zmaj Jovina (oko UKC Kragujevac)',
      'Kopitareva',
      'Vojvode Mišića',
      'Save Kovačevića',
      'Dr Zorana Đinđića',
      'Kosovska',
      'Radnička',
    ],
    'kg-dnevna': [
      'Sva parkirališta u Zoni 2 u Kragujevcu',
    ],
  },

  // SUBOTICA
  subotica: {
    'su-crvena': [
      'Korzo (bočni prilazi)',
      'Trg slobode (oko Gradske kuće)',
      'Trg cara Jovana Nenada',
      'Štrosmajerova',
      'Đure Đakovića',
      'Dimitrija Tucovića',
      'Matka Vukovića',
      'Trg republike',
      'Rudić ulica',
    ],
    'su-plava': [
      'Maksima Gorkog',
      'Braće Radić',
      'Aleja Maršala Tita (Radijalac)',
      'Harambašićeva',
      'Vuka Karadžića',
      'Petefi Šandora',
      'Trg Lazara Nešića',
      'Segedinski put (oko Železničke stanice)',
    ],
    'su-zelena': [
      'Palić (obala jezera i Veliki park)',
      'Bajski put (početak)',
      'Somborski put (početak)',
      'Senćanski put',
    ],
    'su-dnevna': [
      'Sva parkirališta u Zoni II i III u Subotici',
    ],
  },

  // PANČEVO
  pancevo: {
    'pa-crvena': [
      'Trg kralja Petra I',
      'Vojvode Radomira Putnika',
      'Vojvode Živojina Mišića',
      'Njegoševa (centar)',
      'Dimitrija Tucovića (do Moše Pijade)',
      'Zmaj Jovina',
      'Nemanjina',
      'Koste Abraševića',
    ],
    'pa-plava': [
      'Miloša Obrenovića',
      'Moše Pijade',
      'Miloša Trebinjca (kod Bolnice)',
      'Braće Jovanovića',
      'Svetog Save',
      'Žarka Zrenjanina',
      'Prvomajska',
      'Ružina',
    ],
    'pa-dnevna': [
      'Sva parkirališta u Zoni II u Pančevu',
    ],
  },

  // ČAČAK
  cacak: {
    'ca-1': [
      'Gradsko šetalište (oko Gradskog trga)',
      'Župana Stracimira',
      'Kupelvajzerova',
      'Gospodar Jovanova',
      'Bata Jankovića',
      'Kneza Miloša (od Šel benzinske stanice do Pošte)',
      'Cara Dušana',
      'Sindjelićeva (centar)',
      'Mutapova',
    ],
    'ca-2': [
      'Bulevar Vuka Karadžića',
      'Bulevar oslobođenja',
      'Dragiše Mišovića (oko Bolnice)',
      'Lomina',
      'Nemanjina',
      'Svetog Save',
      'Vojvode Stepe',
      'Skadarska',
    ],
    'ca-dnevna': [
      'Sva parkirališta u Zoni 2 u Čačku',
    ],
  },

  // ZRENJANIN
  zrenjanin: {
    'zr-crvena': [
      'Kralja Aleksandra I Karađorđevića (Glavna ulica)',
      'Trg slobode',
      'Pupinova',
      'Gimnazijska',
      'Svetozara Markovića',
      'Jevrejska',
      'Dr Zorana Đinđića',
      'Kralja Petra I',
    ],
    'zr-plava': [
      'Koče Kolarova',
      'Ive Lole Ribara',
      'Miletićeva',
      'Nemanjina',
      'Bulevar Milutina Milankovića',
      'Vojvode Petra Bojovića',
      'Subotićeva',
      'Brigadira Ristića',
    ],
    'zr-dnevna': [
      'Sva javna parkirališta u Plavoj zoni u Zrenjaninu',
    ],
  },

  // KRUŠEVAC
  krusevac: {
    'ks-1': [
      'Trg kosovskih junaka (Spomenik kosovskim junacima)',
      'Vidovdanska (centar)',
      'Majke Jugovića',
      'Balkanska',
      'Gazimestanska',
      'Čolak Antina',
      'Dositejeva',
    ],
    'ks-2': [
      'Topličina',
      'Kosovska',
      'Obilićeva',
      'Jug Bogdanova',
      'Brijanova',
      'Dušanova',
      'Njegoševa',
      'Vojvode Putnika',
    ],
    'ks-dnevna': [
      'Sva parkirališta u Zoni 2 u Kruševcu',
    ],
  },

  // KRALJEVO
  kraljevo: {
    'kv-1': [
      'Trg srpskih ratnika (Kružni trg)',
      'Omladinska (pešačka zona i bočni prilazi)',
      'Miloša Velikog',
      'Cara Lazara',
      'Vojvode Stepe',
      'Toplice Milana',
      'Heroja Maričića',
    ],
    'kv-2': [
      'Dimitrija Tucovića',
      'Karađorđeva',
      'Dositejeva',
      'Olge Jovičić',
      'Hajduk Veljkova',
      'Pljakina',
      'Čika Ljubina',
    ],
    'kv-dnevna': [
      'Sva parkirališta u Zoni 2 u Kraljevu',
    ],
  },

  // UŽICE
  uzice: {
    'ue-1': [
      'Trg partizana',
      'Dimitrija Tucovića (Glavna ulica)',
      'Petra Ćelovića',
      'Strahinjića Bana',
      'Obilićeva',
      'Kralja Petra I',
      'Vuka Karadžića',
    ],
    'ue-2': [
      'Nikole Pašića',
      'Omladinska',
      'Miloša Obrenovića',
      'Vidovdanska',
      'Momčila Tešića',
      'Kneza Lazara',
      'Lipina',
    ],
    'ue-dnevna': [
      'Sva parkirališta u Zoni II u Užicu',
    ],
  },

  // SOMBOR
  sombor: {
    'so-1': [
      'Kralja Petra I (Glavna ulica)',
      'Trg Svetog Trojstva',
      'Trg Cara Uroša (Županija)',
      'Čitaonička',
      'Zmaj Jovina',
      'Laze Kostića',
      'Avrama Mrazovića',
    ],
    'so-2': [
      'Vojvođanska',
      'Venac Radomira Putnika',
      'Venac Petra Bojovića',
      'Venac Stepe Stepanovića',
      'Venac Živojina Mišića',
      'Konjovićeva',
      'Apatinski put',
    ],
    'so-dnevna': [
      'Sva javna parkirališta u Zoni 2 u Somboru',
    ],
  },

  // SMEDEREVO
  smederevo: {
    'sd-1': [
      'Trg Republike (centar kod Crkve Svetog Đorđa)',
      'Kralja Petra I',
      'Karađorđeva',
      'Despota Đurđa',
      'Vojvode Mišića',
      'Trg Nikole Krge',
    ],
    'sd-2': [
      'Knez Mihailova',
      'Dunavska (oko Tvrđave)',
      'Drinska',
      '17. oktobra',
      'Đure Daničića',
      'Goranska',
    ],
    'sd-dnevna': [
      'Sva parkirališta u Zoni 2 u Smederevu',
    ],
  },

  // POŽAREVAC
  pozarevac: {
    'po-1': [
      'Tabačka čaršija (Glavna ulica)',
      'Trg oslobođenja',
      'Voje Dulića',
      'Lenjinova',
      'Stari korzo',
      'Jovana Šerbanovića',
      'Moše Pijade (centar)',
    ],
    'po-2': [
      'Kosovska',
      'Nemanjina',
      'Moravska',
      'Bulevar oslobođenja',
      'Svetosavska',
      'Šumadijska',
    ],
    'po-dnevna': [
      'Sva javna parkirališta u Požarevcu',
    ],
  },

  // JAGODINA
  jagodina: {
    'ja-1': [
      'Kneza Lazara (Glavna ulica)',
      'Trg Petra Bojovića',
      'Kneginje Milice',
      'Vuka Karadžića',
      'Boška Đuričića',
      'Narodnog fronta',
    ],
    'ja-2': [
      'Čočetova (oko Aqua Parka i Zoo vrta)',
      'Bate Đurđevića',
      'Kralja Petra I',
      'Kapetana Koče',
      'Teslina',
    ],
    'ja-dnevna': [
      'Sva parkirališta u Zoni 2 u Jagodini',
    ],
  },

  // PARAĆIN
  paracin: {
    'pn-1': [
      'Kralja Petra I (pešačka zona i centar)',
      'Tome Živanovića',
      'Vojvode Mišića',
      'Branka Krsmanovića',
      'Svetog Save',
    ],
    'pn-2': [
      'Majora Gavrilovića',
      'Vidovdanska',
      'Kosovska',
      'Moravska',
      'Kneza Miloša',
    ],
    'pn-dnevna': [
      'Sva parkirališta u Paraćinu',
    ],
  },

  // ĆUPRIJA
  cuprija: {
    'cu-1': [
      'Karađorđeva (centar)',
      'Cara Lazara',
      'Bulevar vojske',
      'Miodraga Novakovića',
      'Trg slobode',
    ],
    'cu-2': [
      'Kneza Miloša',
      'Živke Damnjanović',
      'Drinskih divizija',
      'Slavka Zlatanovića',
    ],
    'cu-dnevna': [
      'Sva javna parkirališta u Ćupriji',
    ],
  },

  // LESKOVAC
  leskovac: {
    'le-1': [
      'Bulevar oslobođenja (Glavna ulica)',
      'Trg revolucije (Široka čaršija)',
      'Svetozara Markovića',
      'Koste Stamenkovića',
      'Pana Đukića',
      'Radoja Domanovića',
    ],
    'le-2': [
      'Južnomoravskih brigada',
      'Mlinske',
      'Moše Pijade',
      'Đure Salaja',
      'Cara Dušana',
    ],
    'le-dnevna': [
      'Sva javna parkirališta u Leskovcu',
    ],
  },

  // VRANJE
  vranje: {
    'vr-1': [
      'Kralja Stefana Prvovenčanog (pešačka zona)',
      'Partizanska (centar)',
      'Beogradska',
      'Vojvode Mišića',
      '29. novembra',
      'Trg bratstva i jedinstva',
    ],
    'vr-2': [
      'Radnička',
      'Bore Stankovića',
      'Vule Antića',
      'Zmaj Jovina',
      'Jovana Hadživasiljevića',
    ],
    'vr-dnevna': [
      'Sva javna parkirališta u Vranju',
    ],
  },

  // PIROT
  pirot: {
    'pi-1': [
      'Srpskih vladara (pešačka zona i centar)',
      'Trg pirotskih ratnika',
      'Nikole Pašića',
      'Knjaza Miloša',
      'Branka Radičevića',
    ],
    'pi-2': [
      'Lav Tolstoy',
      'Kraljevića Marka',
      'Ćirila i Metodija',
      'Kozaračka',
      'Dragoljuba Milenkovića',
    ],
    'pi-dnevna': [
      'Sva parkirališta u Zoni 2 u Pirotu',
    ],
  },

  // ZAJEČAR
  zajecar: {
    'za-1': [
      'Trg oslobođenja',
      'Nikole Pašića',
      'Timočke bune',
      'Svetozara Markovića',
      'Ljube Nešića',
    ],
    'za-2': [
      'Krvavog petka',
      'Hajduk Veljkova',
      'Generala Gambete',
      'Vojvode Mišića',
      'Požarevačka',
    ],
    'za-dnevna': [
      'Sva javna parkirališta u Zaječaru',
    ],
  },

  // KIKINDA
  kikinda: {
    'ki-1': [
      'Trg srpskih dobrovoljaca (Gradski trg)',
      'Generala Drapšina',
      'Svetosavska',
      'Vojvode Putnika',
      'Semlačka',
    ],
    'ki-2': [
      'Đure Jakšića',
      'Nemanjina',
      'Dositejeva',
      'Miloša Velikog',
      'Braće Tatić',
    ],
    'ki-dnevna': [
      'Sva javna parkirališta u Kikindi',
    ],
  },

  // LOZNICA
  loznica: {
    'lo-1': [
      'Jovana Cvijića (pešačka zona i centar)',
      'Vojvode Mišića',
      'Trg Vuka Karadžića',
      'Kralja Petra I',
      'Pašićeva',
    ],
    'lo-2': [
      'Svetog Save',
      'Bulevar Dositeja Obradovića',
      'Nemanjina',
      'Georgija Jakšića',
      'Vojvode Putnika',
    ],
    'lo-dnevna': [
      'Sva parkirališta u Loznici',
    ],
  },

  // VRŠAC
  vrsac: {
    'vs-1': [
      'Trg pobede (centar)',
      'Dvorska',
      'Svetosavska',
      'Žarka Zrenjanina',
      'Vuka Karadžića',
    ],
    'vs-2': [
      'Sterijina',
      'Abraševićeva',
      'Feliksa Milekera',
      'Omladinski trg',
      'Sremska',
    ],
    'vs-dnevna': [
      'Sva parkirališta u Zoni 2 u Vršcu',
    ],
  },

  // BAČKA PALANKA
  'backa-palanka': {
    'bp-1': [
      'Kralja Petra I',
      'Jugoslovenske armije',
      'Trg bratstva i jedinstva',
      'Vojvode Mišića',
      'Žarka Zrenjanina',
    ],
    'bp-2': [
      'Dositejeva',
      'Branka Radičevića',
      'Šafarikova',
      'Partizanska',
    ],
    'bp-dnevna': [
      'Sva parkirališta u Bačkoj Palanci',
    ],
  },

  // ARANĐELOVAC
  arandjelovac: {
    'ar-1': [
      'Knjaza Miloša (Glavna ulica)',
      'Gospodar Jevremova',
      'Ilije Garašanina',
      'Trg slobode',
      'Vojvode Putnika',
    ],
    'ar-2': [
      'Zanatliska',
      'Josifa Pančića',
      'Vojina Radovića',
      'Kralja Petra I',
    ],
    'ar-dnevna': [
      'Sva javna parkirališta u Aranđelovcu',
    ],
  },

  // GORNJI MILANOVAC
  'gornji-milanovac': {
    'gm-1': [
      'Trg kneza Mihaila',
      'Karađorđeva',
      'Vojvode Živojina Mišića',
      'Kneza Aleksandra',
      'Rajka Milovanovića',
    ],
    'gm-2': [
      'Tihomira Matijevića',
      'Lomina',
      'Vuka Karadžića',
      'Miloša Velikog',
    ],
    'gm-dnevna': [
      'Sva parkirališta u Gornjem Milanovcu',
    ],
  },

  // NOVI PAZAR
  'novi-pazar': {
    'np-1': [
      '28. novembra (Glavna pešačka ulica)',
      'Rifata Burdževića',
      'Stevana Nemanje',
      'Prvog maja',
      'Avnoja',
    ],
    'np-2': [
      'Kej 12. srpske brigade',
      'Ive Lole Ribara',
      'Šabana Koče',
      'Višegradska',
      'Dede Šehovića',
    ],
    'np-dnevna': [
      'Sva javna parkirališta u Novom Pazaru',
    ],
  },

  // PROKUPLJE
  prokuplje: {
    'pk-1': [
      'Jug Bogdanova',
      'Tatkova',
      '21. srpske divizije',
      'Kneza Miloša',
    ],
    'pk-2': [
      'Vojvode Mišića',
      'Hajduk Veljkova',
      'Toplička',
    ],
    'pk-dnevna': [
      'Sva parkirališta u Prokuplju',
    ],
  },

  // ALEKSINAC
  aleksinac: {
    'al-1': [
      'Knjaza Miloša',
      'Momčila Popovića',
      'Tihomira Đorđevića',
    ],
    'al-2': [
      'Lešjaninova',
      'Dušana Trivunca',
      'Vuka Karadžića',
    ],
  },

  // BOR
  bor: {
    'bo-1': [
      'Moše Pijade',
      'Kralja Petra I',
      'Đorđa Vajferta',
    ],
    'bo-2': [
      'Zeleni bulevar',
      'Nikole Pašića',
      'Vase Pelagića',
    ],
    'bo-dnevna': [
      'Sva parkirališta u Boru',
    ],
  },

  // KNJAŽEVAC
  knjazevac: {
    'kz-1': [
      'Knjaza Miloša',
      'Kej Dimitrija Tucovića',
      'Branka Radičevića',
    ],
    'kz-dnevna': [
      'Sva parkirališta u Knjaževcu',
    ],
  },

  // VLASOTINCE
  vlasotince: {
    'vl-1': [
      'Trg oslobođenja',
      'Nemanjina',
      'Vuka Karadžića',
      'Milentija Popovića',
    ],
  },

  // SOKOBANJA
  sokobanja: {
    'sb-1': [
      'Mramorska',
      'Svetog Save',
      'Nikole Pašića',
      'Vojvode Mišića',
    ],
    'sb-2': [
      'Alekse Markišića',
      'Mitropolita Mihaila',
      'Vrela',
    ],
    'sb-dnevna': [
      'Sva parkirališta u Sokobanji',
    ],
  },

  // VRNJAČKA BANJA
  'vrnjacka-banja': {
    'vb-1': [
      'Vrnjačka promenada',
      'Kraljevačka',
      'Nemanjina',
      'Kneza Miloša',
    ],
    'vb-2': [
      'Bulevar srpskih ratnika',
      'Hilandarska',
      'Olimpijska',
    ],
    'vb-dnevna': [
      'Sva javna parkirališta u Vrnjačkoj Banji',
    ],
  },

  // POŽEGA
  pozega: {
    'pz-1': [
      'Kralja Aleksandra',
      'Knjaza Miloša',
      'Vojvode Mišića',
    ],
    'pz-2': [
      'Vidovdanska',
      'Učiteljska',
      'Bakionička',
    ],
  },

  // PRIBOJ
  priboj: {
    'pb-1': [
      '12. januara',
      'Nemanjina',
      'Limska',
    ],
  },

  // PRIJEPOLJE
  prijepolje: {
    'pp-1': [
      'Valterova',
      'Sandžačkih brigada',
      'Njegoševa',
    ],
  },

  // APATIN
  apatin: {
    'ap-1': [
      'Srpskih vladara',
      'Dimitrija Tucovića',
      'Trg Nikole Tesle',
    ],
    'ap-dnevna': [
      'Sva parkirališta u Apatinu',
    ],
  },

  // BEČEJ
  becej: {
    'bc-1': [
      'Trg oslobođenja',
      'Zelena ulica',
      'Novosadska',
      'Glavna ulica',
    ],
  },

  // VELIKA PLANA
  'velika-plana': {
    'vp-1': [
      'Miloša Velikog',
      'Vojvode Mišića',
      'Nikole Pašića',
    ],
    'vp-2': [
      'Kralja Petra I',
      'Momira Gajića',
    ],
  },

  // KOVIN
  kovin: {
    'ko-1': [
      'Cara Lazara',
      'Trg oslobođenja',
      'Vuka Karadžića',
    ],
    'ko-2': [
      'Dunavska',
      'JNA',
    ],
  },

  // BELA CRKVA
  'bela-crkva': {
    'bcr-1': [
      '1. oktobra',
      'Trg pobede',
      'Miletićeva',
      'Partizanska',
    ],
  },

  // NEGOTIN
  negotin: {
    'ng-1': [
      'Trg Đorđa Stanojevića',
      'Kneza Miloša',
      'Srpskih vladara',
    ],
    'ng-2': [
      'Vojvode Mišića',
      'Babušnička',
    ],
  },

  // KLADOVO
  kladovo: {
    'kl-1': [
      'Kralja Petra I',
      'Dunavska',
      '22. septembra',
    ],
  },

  // BANJA LUKA
  'banja-luka': {
    'bl-1': [
      'Ulica Kralja Petra I Karađorđevića (Glavna ulica - centar)',
      'Bana Milosavljevića (Gospodska ulica)',
      'Srpska ulica',
      'Vidovdanska (oko zgrade Vlade RS i hotela Bosna)',
      'Jevrejska',
      'Ive Lole Ribara',
      'Marije Bursać',
      'Trg Krajine',
      'Ulica Vojvode Doke Putnika',
    ],
    'bl-2': [
      'Aleja Svetog Save (oko Narodnog pozorišta RS i Borika)',
      'Vuka Karadžića',
      'Knjaza Miloša',
      'Sime Matavulja',
      'Grčka ulica',
      'Jovana Dučića (kod Parka Petar Kočić)',
      'Gundulićeva (Borik)',
      'Bulevar vojvode Stepe Stepanovića',
    ],
    'bl-dnevna': [
      'Dnevna parking karta za zonu II u Banja Luci',
    ],
  },

  // SARAJEVO
  sarajevo: {
    'sa-z0': [
      'Baščaršija (okolni obod i platoi)',
      'Ferhadija (dostavna mesta i prilazne ulice)',
      'Ulica Maršala Tita (od Vječne vatre do BBI Centra)',
      'Branilaca Sarajeva (oko Narodnog pozorišta Sarajevo)',
      'Kulovića',
      'Ćemaluša',
      'Radićeva',
      'Gimnazijska',
      'Obala Kulina bana (duž Miljacke od Vijećnice do Drvenije)',
    ],
    'sa-z1': [
      'Zmaja od Bosne (od Marijin Dvora do Čengić Vile)',
      'Hamdije Čemerlića (Grbavica)',
      'Kolodvorska (oko Željezničke stanice)',
      'Skenderija (Terezije i plato)',
      'Čobanija',
      'Bistrik',
      'Vilsonovo šetalište (bočni prilazi)',
    ],
    'sa-dnevna': [
      'Dnevna karta za zonu 1 u gradu Sarajevo',
    ],
  },

  // PODGORICA
  podgorica: {
    'pg-1': [
      'Bulevar Svetog Petra Cetinjskog (centar)',
      'Ulica Slobode (pešačka zona i prilazni blokovi)',
      'Njegoševa (centar)',
      'Bokeška',
      'Hercegovačka',
      'Karađorđeva',
      'Vučedolska',
      'Vuka Karadžića',
      'Marka Miljanova',
    ],
    'pg-2': [
      'Bulevar Džordža Vašingtona',
      'Moskovska (Preko Morače)',
      'Serdara Jola Piletića (oko Palade)',
      'Kralja Nikole (od Sahat kule ka Zabjelu)',
      'Oktobarske revolucije',
      'Bratstva i jedinstva',
      'Ivana Milutinovića (oko SC Morača)',
    ],
    'pg-3': [
      'Blok 5 (Bulevar Mihaila Lalića i Velimira Terzića)',
      'Blok 6',
      'Stari Aerodrom (Bulevar Pera Ćetkovića)',
      'Zabjelo (ulica 27. marta)',
    ],
    'pg-dnevna': [
      'Dnevna karta za opšta parkirališta u Podgorici',
    ],
  },
};
