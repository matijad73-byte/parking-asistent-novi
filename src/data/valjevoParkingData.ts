/**
 * Zvanična konfiguracija parking zona za Grad Valjevo
 * Izvor: JKP "Vidrak" Valjevo (Odluka o javnim parkiralištima grada Valjeva)
 * VAŽNO: U Valjevu NEMA opštih prostornih poligona koji pokrivaju cele kvartove.
 * Naplata se vrši ISKLJUČIVO na taksativno navedenim ulicama i delovima ulica.
 * Sve ostale ulice u Valjevu su 100% BESPLATAN PARKING (van zone naplate)!
 */

export const VALJEVO_PARKING_JSON = {
  grad: "Valjevo",
  operator: "JKP Vidrak Valjevo",
  detectionMethod: "street_list" as const,
  radno_vreme: {
    radni_dan: "07:00 - 20:00",
    subota: "07:00 - 14:00",
    nedelja_i_praznici: "Besplatno",
  },
  zone: [
    {
      id: "crvena",
      zoneId: "va-1",
      naziv: "Crvena zona (I Zona)",
      sms_broj: "9141",
      cena_po_satu_rsd: 60,
      vremensko_ogranicenje_minuta: 180,
      opis: "Pokriva isključivo najuži centar grada duž Karađorđeve i centralne poprečne veze sa vremenskim ograničenjem do 180 minuta.",
      ulice: [
        "Karađorđeva ulica (centralni deo od Vuka Karadžića / La Piazza, preko Desankinog venca i Trga Živojina Mišića do Sinđelićeve / Menlija)",
        "Ulica Vuka Karadžića (od Doktora Pantića do Karađorđeve i pešačke zone)",
        "Ulica Vojvode Mišića (centralni deo od Doktora Pantića do Karađorđeve / Trg Živojina Mišića)",
        "Ulica Vlade Danilovića (od Doktora Pantića do Karađorđeve ulice)",
        "Čika Ljubina ulica (od Vuka Karadžića do pešačke zone / Grand hotela)",
        "Trg Desanke Maksimović / Desankin venac",
        "Trg Živojina Mišića (Gradski trg)",
        "Prilaz Tešnjaru kod poslastičarnice „O La La“ (ulaz preko mosta)",
        "Pešačka zona i centralni prilazi",
      ],
      kljucne_reci: [
        "karadjordjeva centar",
        "karađorđeva centar",
        "karadjordjeva",
        "karađorđeva",
        "vuka karadzica",
        "vuka karadžića",
        "vojvode misica centar",
        "vojvode mišića centar",
        "vlade danilovica",
        "vlade danilovića",
        "cika ljubina",
        "čika ljubina",
        "desankin venac",
        "desanke maksimovic",
        "desanke maksimović",
        "trg zivojina misica",
        "trg živojina mišića",
        "gradski trg",
        "o la la",
        "olala",
        "pesacka zona",
        "pešačka zona",
        "knez milosev venac",
      ],
    },
    {
      id: "plava",
      zoneId: "va-plava",
      naziv: "Plava zona (II Zona)",
      sms_broj: "9142",
      dnevni_sms_broj: "9140",
      cena_po_satu_rsd: 38,
      cena_dnevne_karte_rsd: 168,
      vremensko_ogranicenje_minuta: null,
      opis: "Obuhvata širi centar grada, Doktora Pantića, Železničku, Ljubostinjsku, Pop Lukinu, Pijačni kej, Jugovićevu, Stari grad i stambene blokove.",
      ulice: [
        "Ulica Doktora Pantića (Pantićeva - pun profil od Pop Lukine do Vladike Nikolaja)",
        "Železnička ulica (pun profil od Pop Lukine do južnog kraja i parking kod Doma zdravlja / suda)",
        "Ljubostinjska ulica (cela ulica istočno od Železničke)",
        "Pop Lukina ulica (pun profil od Tešnjara i Kolubare do Železničke ulice)",
        "Jugovićeva ulica (kod poslastičarnice Rim i starog dela grada)",
        "Pijačni kej (duž reke Kolubare sa zapadne strane)",
        "Stari grad / Pijaca (veliki parking kod zelene površine i keja)",
        "Ulica Žikice Jovanovića Španca (južni deo centra kod raskrsnice 21/27)",
        "Bulevar Vladike Nikolaja (parkinzi i servisne saobraćajnice kod raskrsnica 21 i 27)",
        "Karađorđeva ulica - severni deo (od Pop Lukine / Andra Savčić ka Kafe Avantura / Bairskoj)",
        "Karađorđeva ulica - južni deo (od Menlija ka bulevaru Vladike Nikolaja)",
        "Mišarska ulica (od Doktora Pantića do Železničke)",
        "Blok oko restorana „Menli“ (parking blokovi između Karađorđeve i keja)",
        "Blok iza „Restoran Bar Petra“ (unutrašnji parking između Karađorđeve i Doktora Pantića)",
        "Blok oko „La Piazza“ i robne kuće (unutrašnji prolazi i parkinzi)",
        "Blok oko Mišarske i Železničke ulice",
        "Ulica Knez Mihaila (od ulice Milovana Glišića do mosta na reci Gradac)",
        "Hajduk Veljkova ulica (od Doktora Pantića do Vladike Nikolaja)",
        "Sinđelićeva ulica (cela ulica od Karađorđeve i Doktora Pantića do pruge) i Sinđelićev blok",
        "Nušićeva ulica",
        "Radnička ulica",
        "Selimira Đorđevića (od Sinđelićeve do Vojvode Mišića)",
        "Dušanova ulica (od mosta na Jadru do Filijale za zapošljavanje)",
        "Ulica Kneza Miloša (od Pantićeve do Suvoborske)",
        "Cankareva ulica",
        "Ulica Prote Mateje (izvan segmenta Vuka Karadžića)",
        "Milovana Glišića (spoj sa Knez Mihailovom)",
        "Bobovčeva ulica",
        "Hadži Ruvimova ulica",
        "Suvoborska / Majora Ilića / Bairska (prilazi kod mosta i Kafe Avantura)",
      ],
      kljucne_reci: [
        "ljubostinjska",
        "ljubostinjske",
        "jugovica",
        "jugovićeva",
        "pijacni kej",
        "pijačni kej",
        "stari grad",
        "zikica jovanovic",
        "žikica jovanović",
        "zikice jovanovica",
        "žikice jovanovića",
        "spanac",
        "španac",
        "doktora pantica",
        "doktora pantića",
        "dr pantica",
        "dr pantića",
        "panticeva",
        "pantićeva",
        "zeleznicka",
        "železnička",
        "pop lukina",
        "pop lukine",
        "misarska",
        "mišarska",
        "menli",
        "petra",
        "la piazza",
        "restoran bar petra",
        "kafe avantura",
        "avantura",
        "vladike nikolaja",
        "knez mihaila",
        "hajduk veljkova",
        "sindjelicev blok",
        "sinđelićev blok",
        "sindjeliceva",
        "sinđelićeva",
        "nusiceva",
        "nušićeva",
        "radnicka",
        "radnička",
        "selimira djordjevica",
        "selimira đorđevića",
        "dusanova",
        "dušanova",
        "kneza milosa",
        "kneza miloša",
        "cankareva",
        "milovana glisica",
        "milovana glišića",
        "bobovceva",
        "bobovčeva",
        "hadzi ruvimova",
        "hadži ruvimova",
      ],
    },
  ],
  // Taksativno poznate besplatne lokacije i prigradska naselja van sistema naplate JKP "Vidrak"
  poznate_besplatne_ulice: [
    "peti puk",
    "brdjani",
    "brđani",
    "novo naselje",
    "goric",
    "gorić",
    "popare",
    "sedlari",
    "popucke",
    "popučke",
    "belosevac",
    "beloševac",
    "gradac selo",
    "knez jova",
    "mirka obradovica",
    "mirka obradovića",
    "vojvode stepe",
    "milivoja bjelice",
    "dr paskala",
    "andrije vuckovica",
    "andrije vučkovića",
    "solunska",
    "radnicko naselje",
    "deguric",
    "degurić",
  ],
  // GPS koordinate linijskih segmenata i parkirališta u Valjevu prema mapi zona
  placene_ulice_segmenti: [
    // --- CRVENA ZONA (I ZONA) ---
    // Karađorđeva: potez od Vuka Karadžića (kod La Piazza) do Sinđelićeve / Menlija
    { naziv: "Karađorđeva (kod La Piazza / Vuka Karadžića)", zonaId: "va-1", lat: 44.2748, lng: 19.8885, maxDistMeters: 60 },
    { naziv: "Karađorđeva (Trg Desanke Maksimović / Desankin venac)", zonaId: "va-1", lat: 44.2743, lng: 19.8898, maxDistMeters: 60 },
    { naziv: "Karađorđeva (kod Vojvode Mišića / Restoran Bar Petra)", zonaId: "va-1", lat: 44.2738, lng: 19.8908, maxDistMeters: 60 },
    { naziv: "Karađorđeva (Trg Živojina Mišića / Grand hotel)", zonaId: "va-1", lat: 44.2734, lng: 19.8915, maxDistMeters: 60 },
    { naziv: "Karađorđeva (kod restorana Menli)", zonaId: "va-1", lat: 44.2727, lng: 19.8924, maxDistMeters: 45 },
    { naziv: "Karađorđeva (južni deo crvene zone)", zonaId: "va-1", lat: 44.2718, lng: 19.8930, maxDistMeters: 60 },
    // Poprečni crveni segmenti:
    { naziv: "Ulica Vuka Karadžića (od Dr Pantića do Karađorđeve)", zonaId: "va-1", lat: 44.2752, lng: 19.8892, maxDistMeters: 55 },
    { naziv: "Ulica Vojvode Mišića (centar od Dr Pantića do Karađorđeve)", zonaId: "va-1", lat: 44.2742, lng: 19.8915, maxDistMeters: 55 },
    { naziv: "Ulica Vlade Danilovića", zonaId: "va-1", lat: 44.2756, lng: 19.8882, maxDistMeters: 55 },
    { naziv: "Čika Ljubina ulica", zonaId: "va-1", lat: 44.2738, lng: 19.8885, maxDistMeters: 55 },
    { naziv: "Prilaz Tešnjaru kod O La La (most / plato)", zonaId: "va-1", lat: 44.2741, lng: 19.8848, maxDistMeters: 50 },

    // --- PLAVA ZONA (II ZONA) ---
    // 1. Zapadno od Kolubare (Pijačni kej, Jugovićeva, Stari grad)
    { naziv: "Pijačni kej (sever)", zonaId: "va-plava", lat: 44.2740, lng: 19.8840, maxDistMeters: 60 },
    { naziv: "Pijačni kej (jug duž Kolubare)", zonaId: "va-plava", lat: 44.2725, lng: 19.8835, maxDistMeters: 65 },
    { naziv: "Jugovićeva ulica (kod Poslastičarnice Rim)", zonaId: "va-plava", lat: 44.2735, lng: 19.8820, maxDistMeters: 60 },
    { naziv: "Stari grad / Pijaca (veliki parking plac)", zonaId: "va-plava", lat: 44.2718, lng: 19.8828, maxDistMeters: 65 },

    // 2. Karađorđeva sever i severni ulaz (Kafe Avantura)
    { naziv: "Karađorđeva (sever kod Pop Lukine i Andra Savčić)", zonaId: "va-plava", lat: 44.2760, lng: 19.8878, maxDistMeters: 60 },
    { naziv: "Karađorđeva (sever kod Kafe Avantura)", zonaId: "va-plava", lat: 44.2785, lng: 19.8870, maxDistMeters: 65 },
    { naziv: "Bairska / Suvoborska (severni prilaz)", zonaId: "va-plava", lat: 44.2778, lng: 19.8860, maxDistMeters: 60 },

    // 3. Pop Lukina ulica (pun profil od reke do Železničke)
    { naziv: "Pop Lukina (zapad kod Kolubare)", zonaId: "va-plava", lat: 44.2762, lng: 19.8855, maxDistMeters: 60 },
    { naziv: "Pop Lukina (centar kod Dr Pantića)", zonaId: "va-plava", lat: 44.2765, lng: 19.8890, maxDistMeters: 60 },
    { naziv: "Pop Lukina (istok kod Železničke)", zonaId: "va-plava", lat: 44.2767, lng: 19.8925, maxDistMeters: 60 },

    // 4. Ulica Doktora Pantića (pun profil od Pop Lukine do juga)
    { naziv: "Doktora Pantića (sever kod Pop Lukine)", zonaId: "va-plava", lat: 44.2762, lng: 19.8895, maxDistMeters: 60 },
    { naziv: "Doktora Pantića (kod Andra Savčić / Vuka Karadžića)", zonaId: "va-plava", lat: 44.2752, lng: 19.8905, maxDistMeters: 60 },
    { naziv: "Doktora Pantića (centar kod Vojvode Mišića)", zonaId: "va-plava", lat: 44.2742, lng: 19.8918, maxDistMeters: 60 },
    { naziv: "Doktora Pantića (kod Sinđelićeve)", zonaId: "va-plava", lat: 44.2730, lng: 19.8932, maxDistMeters: 60 },
    { naziv: "Doktora Pantića (južni deo ka Vladike Nikolaja)", zonaId: "va-plava", lat: 44.2715, lng: 19.8942, maxDistMeters: 60 },

    // 5. Železnička ulica i parkinzi
    { naziv: "Železnička ulica (sever)", zonaId: "va-plava", lat: 44.2760, lng: 19.8935, maxDistMeters: 60 },
    { naziv: "Železnička ulica (centar kod Mišarske)", zonaId: "va-plava", lat: 44.2745, lng: 19.8945, maxDistMeters: 60 },
    { naziv: "Železnička ulica (kod Doma zdravlja i suda)", zonaId: "va-plava", lat: 44.2730, lng: 19.8955, maxDistMeters: 60 },
    { naziv: "Železnička ulica (južni kraj ka pruzi)", zonaId: "va-plava", lat: 44.2715, lng: 19.8962, maxDistMeters: 60 },

    // 6. Ljubostinjska ulica (istočno od Železničke)
    { naziv: "Ljubostinjska ulica (sever)", zonaId: "va-plava", lat: 44.2745, lng: 19.8980, maxDistMeters: 55 },
    { naziv: "Ljubostinjska ulica (centar i jug)", zonaId: "va-plava", lat: 44.2730, lng: 19.8988, maxDistMeters: 55 },

    // 7. Mišarska ulica i unutrašnji blokovi
    { naziv: "Mišarska ulica", zonaId: "va-plava", lat: 44.2745, lng: 19.8930, maxDistMeters: 55 },
    { naziv: "Blok Mišarska (unutrašnji parking)", zonaId: "va-plava", lat: 44.2748, lng: 19.8938, maxDistMeters: 50 },
    { naziv: "Blok iza Restorana Bar Petra (parking)", zonaId: "va-plava", lat: 44.2744, lng: 19.8912, maxDistMeters: 50 },
    { naziv: "Blok kod La Piazza (unutrašnji parking)", zonaId: "va-plava", lat: 44.2750, lng: 19.8875, maxDistMeters: 50 },
    { naziv: "Blok Menli (unutrašnji parking platoi)", zonaId: "va-plava", lat: 44.2728, lng: 19.8905, maxDistMeters: 55 },

    // 8. Južni potez: Žikica Jovanović Španac i bulevar Vladike Nikolaja
    { naziv: "Ulica Žikice Jovanovića Španca", zonaId: "va-plava", lat: 44.2705, lng: 19.8920, maxDistMeters: 60 },
    { naziv: "Vladike Nikolaja (parkinzi kod raskrsnica 21 i 27)", zonaId: "va-plava", lat: 44.2718, lng: 19.8950, maxDistMeters: 60 },
    { naziv: "Karađorđeva ulica (južni krak ka bulevaru)", zonaId: "va-plava", lat: 44.2708, lng: 19.8932, maxDistMeters: 60 },

    // 9. Ostale plave ulice
    { naziv: "Hajduk Veljkova ulica", zonaId: "va-plava", lat: 44.2745, lng: 19.8835, maxDistMeters: 60 },
    { naziv: "Knez Mihaila", zonaId: "va-plava", lat: 44.2722, lng: 19.8915, maxDistMeters: 60 },
    { naziv: "Sinđelićeva ulica (kod Karađorđeve i restorana Menli)", zonaId: "va-plava", lat: 44.2730, lng: 19.8932, maxDistMeters: 60 },
    { naziv: "Sinđelićeva ulica (srednji deo kod Dr Pantića)", zonaId: "va-plava", lat: 44.2736, lng: 19.8945, maxDistMeters: 60 },
    { naziv: "Sinđelićeva ulica i blok (ka pruzi i keju)", zonaId: "va-plava", lat: 44.2742, lng: 19.8960, maxDistMeters: 60 },
    { naziv: "Nušićeva ulica", zonaId: "va-plava", lat: 44.2735, lng: 19.8980, maxDistMeters: 60 },
    { naziv: "Selimira Đorđevića", zonaId: "va-plava", lat: 44.2750, lng: 19.8935, maxDistMeters: 60 },
    { naziv: "Dušanova ulica", zonaId: "va-plava", lat: 44.2730, lng: 19.8860, maxDistMeters: 60 },
    { naziv: "Vojvode Mišića (sever ka Železničkoj)", zonaId: "va-plava", lat: 44.2765, lng: 19.8905, maxDistMeters: 60 },
    { naziv: "Ulica Kneza Miloša", zonaId: "va-plava", lat: 44.2730, lng: 19.8840, maxDistMeters: 60 },
    { naziv: "Milovana Glišića", zonaId: "va-plava", lat: 44.2715, lng: 19.8885, maxDistMeters: 60 },
  ],
} as const;

export type ValjevoParkingData = typeof VALJEVO_PARKING_JSON;

export interface ValjevoStreetItem {
  id: string;
  name: string;
  segmentDescription: string;
  zoneId: 'va-1' | 'va-plava' | 'free';
  zoneName: string;
  smsNumber: string;
  priceRsd: number;
  timeLimit?: string;
  isPopular?: boolean;
}

/**
 * Kompletna lista zvaničnih ulica u Valjevu prema Odluci o javnim parkiralištima
 * i evidenciji JKP "Vidrak" Valjevo.
 */
export const VALJEVO_OFFICIAL_STREETS: ValjevoStreetItem[] = [
  // --- CRVENA ZONA (I ZONA) ---
  {
    id: 'va-str-karadjordjeva-centar',
    name: 'Karađorđeva ulica (Centar)',
    segmentDescription: 'Centralni deo od Vuka Karadžića / La Piazza do Sinđelićeve / Menlija (Trg Desanke Maksimović i Trg Živojina Mišića)',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
    isPopular: true,
  },
  {
    id: 'va-str-vuka-karadzica',
    name: 'Ulica Vuka Karadžića',
    segmentDescription: 'Od ulice Dr Pantića do Karađorđeve i pešačke zone',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
    isPopular: true,
  },
  {
    id: 'va-str-vojvode-misica-centar',
    name: 'Ulica Vojvode Mišića (Centar)',
    segmentDescription: 'Od pešačke zone / Trga Živojina Mišića do ulice Dr Pantića (kod Restoran Bar Petra)',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
    isPopular: true,
  },
  {
    id: 'va-str-vlade-danilovica',
    name: 'Ulica Vlade Danilovića',
    segmentDescription: 'Od ulice Dr Pantića do Karađorđeve ulice',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
    isPopular: true,
  },
  {
    id: 'va-str-cika-ljubina',
    name: 'Čika Ljubina ulica',
    segmentDescription: 'Od ulice Vuka Karadžića do pešačke zone / Grand hotela',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
    isPopular: true,
  },
  {
    id: 'va-str-trg-desanke-maksimovic',
    name: 'Trg Desanke Maksimović / Desankin venac',
    segmentDescription: 'Trg i parkirališta uz Karađorđevu ulicu',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
    isPopular: true,
  },
  {
    id: 'va-str-gradski-trg',
    name: 'Trg Živojina Mišića (Gradski trg)',
    segmentDescription: 'Parkirališta u najužem gradskom jezgru',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
  },
  {
    id: 'va-str-olala-most',
    name: 'Prilaz Tešnjaru kod poslastičarnice „O La La“',
    segmentDescription: 'Prelaz preko mosta i prilazni plato',
    zoneId: 'va-1',
    zoneName: 'Crvena zona (I Zona)',
    smsNumber: '9141',
    priceRsd: 60,
    timeLimit: 'Maks. 180 min (3h)',
  },

  // --- PLAVA ZONA (II ZONA) ---
  {
    id: 'va-str-ljubostinjska',
    name: 'Ljubostinjska ulica',
    segmentDescription: 'Cela ulica istočno od Železničke (od severa do juga)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-jugovica',
    name: 'Jugovićeva ulica',
    segmentDescription: 'Zapadno od Kolubare (kod poslastičarnice Rim i starog grada)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-pijacni-kej',
    name: 'Pijačni kej',
    segmentDescription: 'Duž reke Kolubare sa zapadne strane (od mosta do pijace)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-stari-grad-parking',
    name: 'Stari grad / Pijaca (veliko parkiralište)',
    segmentDescription: 'Veliki parking plac kod zelene površine i keja',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-zikice-jovanovica-spanca',
    name: 'Ulica Žikice Jovanovića Španca',
    segmentDescription: 'Južni potez centra kod raskrsnice 21 i 27 (bulevar)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-vladike-nikolaja',
    name: 'Bulevar Vladike Nikolaja (parkinzi 21 / 27)',
    segmentDescription: 'Ulična parkirališta i servisne saobraćajnice kod raskrsnica 21 i 27',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-karadjordjeva-sever',
    name: 'Karađorđeva ulica (Severni deo)',
    segmentDescription: 'Od Pop Lukine i škole „Andra Savčić“ na sever ka Kafe Avantura i reci',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-karadjordjeva-jug',
    name: 'Karađorđeva ulica (Južni krak)',
    segmentDescription: 'Potez od Sinđelićeve ka Žikici Jovanoviću Špancu i Vladike Nikolaja',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-blok-menli',
    name: 'Blok oko restorana „Menli“',
    segmentDescription: 'Unutrašnji parkinzi i platoi između Karađorđeve i keja (Gimnazija / Centar za kulturu)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-blok-petra',
    name: 'Blok iza restorana „Bar Petra“',
    segmentDescription: 'Unutrašnji stambeni parking između Karađorđeve i Dr Pantića',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-blok-la-piazza',
    name: 'Blok oko „La Piazza“',
    segmentDescription: 'Unutrašnji prolazi i parkinzi iza Karađorđeve i Vuka Karadžića',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-dr-pantica',
    name: 'Ulica Dr Pantića (Pantićeva)',
    segmentDescription: 'Pun profil od Pop Lukine ulice do Vladike Nikolaja (na mapi označena duž celog toka)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-pop-lukina',
    name: 'Pop Lukina ulica',
    segmentDescription: 'Pun profil od Tešnjara / reke Kolubare, preko Dr Pantića do Železničke ulice',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-knez-mihaila',
    name: 'Ulica Knez Mihaila',
    segmentDescription: 'Od ulice Milovana Glišića do mosta na reci Gradac',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-sindjeliceva',
    name: 'Sinđelićeva ulica (cela ulica i blok)',
    segmentDescription: 'Celom dužinom (od Doktora Pantića i Karađorđeve kod Menlija do keja i pruge) i Sinđelićev blok',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-zeleznicka',
    name: 'Železnička ulica',
    segmentDescription: 'Od Vojvode Mišića do Sinđelićeve (kod Doma zdravlja, suda i stanice)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-hajduk-veljkova',
    name: 'Hajduk Veljkova ulica',
    segmentDescription: 'Od Dr Pantića do Vladike Nikolaja (duple trake)',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
    isPopular: true,
  },
  {
    id: 'va-str-vojvode-misica-sever',
    name: 'Ulica Vojvode Mišića (Sever)',
    segmentDescription: 'Od ulice Dr Pantića do Železničke ulice',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-karadjordjeva-istok',
    name: 'Karađorđeva ulica (Istok / Zapad)',
    segmentDescription: 'Produženi delovi: od Nušićeve do Uzun Mirkove (kod parka Vide Jocić) i zapadno od Hajduk Veljkove',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-misarska',
    name: 'Mišarska ulica',
    segmentDescription: 'Od Dr Pantića do Železničke ulice',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-nusiceva',
    name: 'Nušićeva ulica',
    segmentDescription: 'Od Karađorđeve do Dr Pantića i keja',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-dusanova',
    name: 'Dušanova ulica',
    segmentDescription: 'Od mosta na Jadru do Filijale za zapošljavanje',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-selimira-djordjevica',
    name: 'Ulica Selimira Đorđevića',
    segmentDescription: 'Od Sinđelićeve do Vojvode Mišića',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-radnicka',
    name: 'Radnička ulica',
    segmentDescription: 'Spoj sa ulicom Dr Pantića',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-kneza-milosa',
    name: 'Ulica Kneza Miloša',
    segmentDescription: 'Od ulice Dr Pantića do Suvoborske',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-cankareva',
    name: 'Cankareva ulica',
    segmentDescription: 'Ulična parkirališta u zoni naplate',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-prote-mateje',
    name: 'Ulica Prote Mateje',
    segmentDescription: 'Izvan segmenta Vuka Karadžića',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-milovana-glisica',
    name: 'Ulica Milovana Glišića',
    segmentDescription: 'Od Marka Kraljevića do Bobovčeve / spoj sa Knez Mihailovom',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-park-vide-jocic',
    name: 'Park Vide Jocić',
    segmentDescription: 'Parking prostor oko parka',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-kej-prvog-ustanka',
    name: 'Kej Prvog ustanka',
    segmentDescription: 'Od Vuka Karadžića uz Kolubaru prema Birčaninovoj',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-bobovceva',
    name: 'Bobovčeva ulica',
    segmentDescription: 'Od Birčaninove do Milovana Glišića',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
  {
    id: 'va-str-hadzi-ruvimova',
    name: 'Hadži Ruvimova ulica',
    segmentDescription: 'Od Milovana Glišića do broja 2',
    zoneId: 'va-plava',
    zoneName: 'Plava zona (II Zona)',
    smsNumber: '9142',
    priceRsd: 38,
  },
];

/**
 * Najčešće birane ulice u Valjevu za brzi 1-klik izbor
 */
export const VALJEVO_POPULAR_STREETS = [
  'Karađorđeva (Centar)',
  'Dr Pantića',
  'Ljubostinjska',
  'Železnička',
  'Pop Lukina',
  'Jugovićeva',
  'Pijačni kej',
  'Vuka Karadžića',
  'Vojvode Mišića',
  'Ulica Žikice Jovanovića Španca',
  'Knez Mihaila',
  'Sinđelićeva',
  'Vlade Danilovića',
  'Hajduk Veljkova',
];

/**
 * Pomaže u inteligentnom prepoznavanju ulica u Valjevu prema odluci JKP Vidrak.
 */
export function matchValjevoStreet(input: string | undefined): {
  streetItem: ValjevoStreetItem | null;
  zoneId: 'va-1' | 'va-plava' | 'free';
  zoneName: string;
  smsNumber: string;
  isFreeArea: boolean;
  reason: string;
  matchedName: string;
} | null {
  if (!input || input.trim().length < 2) return null;
  const raw = input.trim();
  const lower = raw.toLowerCase()
    .replace(/đ/g, 'dj')
    .replace(/ž/g, 'z')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ulica\s+/g, '')
    .replace(/^ul\.\s*/g, '')
    .replace(/[,\.\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Provera eksplicitnih besplatnih naselja i ulica van sistema JKP Vidrak
  for (const freeStreet of VALJEVO_PARKING_JSON.poznate_besplatne_ulice) {
    const cleanFree = freeStreet
      .replace(/đ/g, 'dj')
      .replace(/ž/g, 'z')
      .replace(/č/g, 'c')
      .replace(/ć/g, 'c')
      .replace(/š/g, 's');
    if (lower.includes(cleanFree)) {
      return {
        streetItem: null,
        zoneId: 'free',
        zoneName: 'Van zone naplate',
        smsNumber: '',
        isFreeArea: true,
        reason: `Ulica/naselje "${raw}" nije u sistemu naplate JKP "Vidrak" Valjevo (Besplatan parking 0 RSD)`,
        matchedName: raw,
      };
    }
  }

  // 2. Pretraga u zvaničnim ulicama JKP Vidrak
  // Sinđelićeva ulica (cela ulica celom dužinom i Sinđelićev blok je isključivo PLAVA ZONA - 9142!)
  if (lower.includes('sindjelic')) {
    const item = VALJEVO_OFFICIAL_STREETS.find((s) => s.id === 'va-str-sindjeliceva') || null;
    return {
      streetItem: item,
      zoneId: 'va-plava',
      zoneName: 'Plava zona (II Zona)',
      smsNumber: '9142',
      isFreeArea: false,
      reason: 'Zvanična ulica JKP Vidrak: Sinđelićeva ulica (cela ulica je Plava zona)',
      matchedName: 'Sinđelićeva ulica',
    };
  }

  // Karađorđeva severni segment (Kafe Avantura, Bairska, Suvoborska, Pop Lukina)
  if (
    lower.includes('karadjordjev') &&
    (lower.includes('sever') || lower.includes('avantur') || lower.includes('andra savcic') || lower.includes('bair'))
  ) {
    const item = VALJEVO_OFFICIAL_STREETS.find((s) => s.id === 'va-str-karadjordjeva-sever')!;
    return {
      streetItem: item,
      zoneId: 'va-plava',
      zoneName: item.zoneName,
      smsNumber: '9142',
      isFreeArea: false,
      reason: `Zvanična ulica JKP Vidrak: ${item.name} (${item.segmentDescription})`,
      matchedName: item.name,
    };
  }

  // Karađorđeva južni segment (ka Žikici Jovanoviću Špancu i Vladike Nikolaja)
  if (
    lower.includes('karadjordjev') &&
    (lower.includes('jug') || lower.includes('spanc') || lower.includes('vladik') || lower.includes('nikolaj'))
  ) {
    const item = VALJEVO_OFFICIAL_STREETS.find((s) => s.id === 'va-str-karadjordjeva-jug')!;
    return {
      streetItem: item,
      zoneId: 'va-plava',
      zoneName: item.zoneName,
      smsNumber: '9142',
      isFreeArea: false,
      reason: `Zvanična ulica JKP Vidrak: ${item.name} (${item.segmentDescription})`,
      matchedName: item.name,
    };
  }

  // Karađorđeva istok (Nušićeva, Uzun Mirkova, park Vide Jocić, Hajduk Veljkova)
  if (
    lower.includes('karadjordjev') &&
    (lower.includes('nusic') || lower.includes('uzun mirkov') || lower.includes('vide jocic') || lower.includes('jadar'))
  ) {
    const item = VALJEVO_OFFICIAL_STREETS.find((s) => s.id === 'va-str-karadjordjeva-istok')!;
    return {
      streetItem: item,
      zoneId: 'va-plava',
      zoneName: item.zoneName,
      smsNumber: '9142',
      isFreeArea: false,
      reason: `Zvanična ulica JKP Vidrak: ${item.name} (${item.segmentDescription})`,
      matchedName: item.name,
    };
  }

  // Karađorđeva centar (ako nije eksplicitno sever/jug/istok, Karađorđeva u srcu grada je CRVENA ZONA!)
  if (lower === 'karadjordjeva' || lower === 'karadjordjeve' || lower.includes('karadjordjev centar')) {
    const item = VALJEVO_OFFICIAL_STREETS.find((s) => s.id === 'va-str-karadjordjeva-centar')!;
    return {
      streetItem: item,
      zoneId: 'va-1',
      zoneName: item.zoneName,
      smsNumber: '9141',
      isFreeArea: false,
      reason: `Zvanična ulica JKP Vidrak: ${item.name} (${item.segmentDescription})`,
      matchedName: item.name,
    };
  }

  // Vojvode Mišića sever (od Pantićeve do Železničke)
  if (
    lower.includes('vojvode misic') &&
    (lower.includes('zeleznick') || lower.includes('sever') || lower.includes('stanic'))
  ) {
    const item = VALJEVO_OFFICIAL_STREETS.find((s) => s.id === 'va-str-vojvode-misica-sever')!;
    return {
      streetItem: item,
      zoneId: 'va-plava',
      zoneName: item.zoneName,
      smsNumber: '9142',
      isFreeArea: false,
      reason: `Zvanična ulica JKP Vidrak: ${item.name} (${item.segmentDescription})`,
      matchedName: item.name,
    };
  }

  // Proveri sve zvanične ulice iz kataloga
  for (const street of VALJEVO_OFFICIAL_STREETS) {
    const sNameClean = street.name.toLowerCase()
      .replace(/đ/g, 'dj')
      .replace(/ž/g, 'z')
      .replace(/č/g, 'c')
      .replace(/ć/g, 'c')
      .replace(/š/g, 's')
      .replace(/ulica\s+/g, '')
      .replace(/^ul\.\s*/g, '')
      .replace(/\(.*\)/g, '')
      .trim();

    const parts = sNameClean.split(/\s+/).filter((p) => p.length >= 3);
    // Tačno poklapanje ili podstring
    if (lower.includes(sNameClean) || sNameClean.includes(lower)) {
      return {
        streetItem: street,
        zoneId: street.zoneId,
        zoneName: street.zoneName,
        smsNumber: street.smsNumber,
        isFreeArea: false,
        reason: `Zvanična ulica JKP Vidrak: ${street.name} (${street.zoneName})`,
        matchedName: street.name,
      };
    }
    // Poklapanje ključnih reči (npr. "pantićeva", "danilovića", "ljubina")
    const matchesAllKeyParts = parts.length > 0 && parts.every((p) => {
      // Skrati nastavke (npr. -a, -e, -i, -u, -oj, -evoj, -ovoj, -ića, -ić)
      const stem = p.replace(/(evoj|ovoj|inoj|eva|eve|evi|ova|ove|ovi|ina|ine|ini|ica|icu|ice|ici|ića)$/, '');
      return lower.includes(stem.length >= 3 ? stem : p);
    });
    if (matchesAllKeyParts) {
      return {
        streetItem: street,
        zoneId: street.zoneId,
        zoneName: street.zoneName,
        smsNumber: street.smsNumber,
        isFreeArea: false,
        reason: `Zvanična ulica JKP Vidrak: ${street.name} (${street.zoneName})`,
        matchedName: street.name,
      };
    }
  }

  // Dodatne ključne reči iz VALJEVO_PARKING_JSON
  for (const zone of VALJEVO_PARKING_JSON.zone) {
    for (const kw of zone.kljucne_reci) {
      const cleanKw = kw
        .replace(/đ/g, 'dj')
        .replace(/ž/g, 'z')
        .replace(/č/g, 'c')
        .replace(/ć/g, 'c')
        .replace(/š/g, 's');
      if (lower.includes(cleanKw) || cleanKw.includes(lower)) {
        const zoneId = zone.zoneId as 'va-1' | 'va-plava';
        return {
          streetItem: null,
          zoneId,
          zoneName: zone.naziv,
          smsNumber: zone.sms_broj,
          isFreeArea: false,
          reason: `Prepoznata ulica prema JKP Vidrak: ${raw} (${zone.naziv})`,
          matchedName: raw,
        };
      }
    }
  }

  return null;
}
