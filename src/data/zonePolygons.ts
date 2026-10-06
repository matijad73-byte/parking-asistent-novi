export interface CityZonePolygon {
  id: string;
  cityId: string;
  zoneId: string;
  name: string;
  code: string;
  color: string;
  smsNumber: string;
  coordinates: [number, number][]; // [lat, lng] array forming a closed boundary
}

/**
 * BEOGRAD - Detaljno mapirane parking zone (Parking Servis Beograd)
 * 1. Zona A (Ljubičasta - 9114 - 30 min max)
 * 2. Zona 1 (Crvena - 9111 - 60 min max)
 * 3. Zona 2 (Žuta - 9112 - 120 min max)
 * 4. Zona 3 (Zelena - 9113 - 180 min max)
 * 5. Plava zona (Opšta parkirališta van zonskog sistema - 9119 / 9118):
 *    - Novi Beograd (svi blokovi sa naplatom: 1-4 Paviljoni/Fontana, 11a-12 YBC/Jugoslavija, 19a, 21-30 Ušće/Arena, 31-43, 61-65 West/Airport City, 70/70a/44/45 Savski blokovi, Bežanijska kosa)
 *    - Zemun (Centar, Donji Grad, Gornji Grad, Kalvarija, Kej)
 *    - Čukarica (Banovo Brdo - Požeška, Lješka)
 */
export const BELGRADE_ZONE_POLYGONS: CityZonePolygon[] = [
  // 1. ZONA A (Ljubičasta - 30 min - Knez Mihailova i pešačka zona)
  {
    id: 'bg-poly-a',
    cityId: 'beograd',
    zoneId: 'bg-zone-a',
    name: 'Zona A (Ljubičasta - 30 min)',
    code: 'A',
    color: '#8b5cf6',
    smsNumber: '9114',
    coordinates: [
      [44.8210, 20.4530], // Pariska / Uzun Mirkova
      [44.8205, 20.4580], // Studentski trg / Vase Čarapića
      [44.8172, 20.4615], // Trg Republike / Kolarčeva
      [44.8145, 20.4620], // Terazije (do Sremske)
      [44.8140, 20.4585], // Sremska / Maršala Birjuzova
      [44.8155, 20.4540], // Carice Milice / Topličin venac
      [44.8178, 20.4515], // Kosančićev venac / Pop Lukina
      [44.8198, 20.4518], // Pariska
      [44.8210, 20.4530],
    ],
  },
  // 2. ZONA 1 (Crvena - 60 min - Stari Grad istorijski centar)
  {
    id: 'bg-poly-1',
    cityId: 'beograd',
    zoneId: 'bg-zone-1',
    name: 'Zona 1 (Crvena - 60 min)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9111',
    coordinates: [
      [44.8280, 20.4515], // Kalemegdan donji ugao / Tadeuša Košćuška
      [44.8290, 20.4580], // Cara Dušana / Tadeuša Košćuška
      [44.8250, 20.4660], // Francuska / Džordža Vašingtona
      [44.8205, 20.4680], // Cetinjska / Makedonska
      [44.8148, 20.4685], // Dečanska / Trg Nikole Pašića
      [44.8115, 20.4650], // Pionirski park / Andrićev venac
      [44.8105, 20.4600], // Terazije / Balkanska početak
      [44.8125, 20.4540], // Zeleni Venac / Brankova
      [44.8175, 20.4485], // Karađorđeva pristup / Pristanište
      [44.8240, 20.4480], // Donji grad Kalemegdan
      [44.8280, 20.4515],
    ],
  },
  // 3. ZONA 2 (Žuta - 120 min - Vračar, Palilula uži centar, Gornji Dorćol)
  {
    id: 'bg-poly-2',
    cityId: 'beograd',
    zoneId: 'bg-zone-2',
    name: 'Zona 2 (Žuta - 120 min)',
    code: '2',
    color: '#f59e0b',
    smsNumber: '9112',
    coordinates: [
      [44.8295, 20.4585], // Gornji Dorćol (Cara Dušana / Francuska)
      [44.8255, 20.4735], // Bulevar despota Stefana / Cvijićeva početak
      [44.8200, 20.4795], // Takovska / 27. marta / Starine Novaka
      [44.8160, 20.4855], // Bulevar kralja Aleksandra / Vukov Spomenik
      [44.8080, 20.4865], // Sinđelićeva / Mileševska / Kalenić
      [44.8005, 20.4810], // Makenzijeva / Južni bulevar prilaz
      [44.7965, 20.4720], // Hram Svetog Save / Karađorđev park
      [44.7985, 20.4600], // Slavija / Nemanjina
      [44.8055, 20.4580], // Kralja Milana / Kneza Miloša
      [44.8120, 20.4635], // Terazijski plato spoj
      [44.8200, 20.4665], // Džordža Vašingtona
      [44.8295, 20.4585],
    ],
  },
  // 4. ZONA 3 (Zelena - 180 min - Donji Dorćol, Palilula, Zvezdara, Donji Vračar, Savski Venac, Autokomanda)
  {
    id: 'bg-poly-3',
    cityId: 'beograd',
    zoneId: 'bg-zone-3',
    name: 'Zona 3 (Zelena - 180 min)',
    code: '3',
    color: '#10b981',
    smsNumber: '9113',
    coordinates: [
      [44.8340, 20.4560], // Dunavska obala / Donji Dorćol
      [44.8320, 20.4750], // Poenkareova / Žorža Klemansoa
      [44.8285, 20.4890], // Bogoslovija / Mije Kovačevića
      [44.8215, 20.4995], // Dimitrija Tucovića / Severni bulevar
      [44.8150, 20.5050], // Gradska bolnica / Batutova / Bulevar kralja Aleksandra do Cvetkove pijace
      [44.8040, 20.5010], // Lion / Lipov lad / Stanislava Sremčevića / Vojislava Ilića
      [44.7940, 20.4880], // Crveni Krst / Južni Bulevar / Grčića Milenka
      [44.7875, 20.4720], // Autokomanda / Franš / Bulevar oslobođenja
      [44.7910, 20.4570], // Prokop / Železnička stanica Beograd Centar / Klinički Centar Srbije
      [44.7980, 20.4490], // Savamala / Sarajevska / Balkanska / Savski trg
      [44.8130, 20.4435], // Karađorđeva uz Savu
      [44.8270, 20.4440], // Pristanište / Donji grad
      [44.8340, 20.4560],
    ],
  },
  // 5. PLAVA ZONA - NOVI BEOGRAD: Centralni i poslovni blokovi (Ušće, Sava Centar, Arena, Blokovi 21-30, 37-43)
  {
    id: 'bg-poly-nbg-central',
    cityId: 'beograd',
    zoneId: 'bg-zone-opsta',
    name: 'Plava zona - Novi Beograd (Ušće, Sava Centar, Arena, Blokovi 21-43)',
    code: '4',
    color: '#3b82f6',
    smsNumber: '9119',
    coordinates: [
      [44.8250, 20.4200], // Bulevar Mihajla Pupina / Ušće
      [44.8260, 20.4420], // Ušće park / Brankov most prilaz
      [44.8160, 20.4450], // Staro Sajmište / Sava Centar uz reku
      [44.8040, 20.4350], // Gazela / Savski nasip
      [44.7970, 20.4210], // Buvljak / Železnička Novi Beograd / Milutina Milankovića
      [44.8010, 20.4080], // Omladinskih brigada / Đorđa Stanojevića
      [44.8080, 20.4020], // Tošin Bunar / Studentski grad
      [44.8180, 20.4050], // Bulevar Zorana Đinđića / Španskih boraca
      [44.8250, 20.4200],
    ],
  },
  // 6. PLAVA ZONA - NOVI BEOGRAD: Paviljoni, Fontana i Blokovi 1, 2, 3, 4, 11a, 11b, 11c (Yu Biznis Centar)
  {
    id: 'bg-poly-nbg-north',
    cityId: 'beograd',
    zoneId: 'bg-zone-opsta',
    name: 'Plava zona - Novi Beograd (Fontana, Paviljoni, Blokovi 1-4, YBC, Jugoslavija)',
    code: '4',
    color: '#3b82f6',
    smsNumber: '9119',
    coordinates: [
      [44.8340, 20.4180], // Dunavski kej / Hotel Jugoslavija
      [44.8320, 20.4310], // Bulevar Nikole Tesle / Ušće park sever
      [44.8230, 20.4300], // Bulevar Mihajla Pupina / Blok 12
      [44.8210, 20.4100], // Opština Novi Beograd / Fontana / Pariske Komune
      [44.8270, 20.4020], // Tošin Bunar / Paviljoni
      [44.8380, 20.4100], // Prilaz Zemunu / Avijatičarski trg granica
      [44.8340, 20.4180],
    ],
  },
  // 7. PLAVA ZONA - NOVI BEOGRAD: Savski blokovi (61-65, 70, 70a, 44, 45, Airport City, West 65)
  {
    id: 'bg-poly-nbg-savski',
    cityId: 'beograd',
    zoneId: 'bg-zone-opsta',
    name: 'Plava zona - Novi Beograd (Savski blokovi 61-70, West 65, Airport City)',
    code: '4',
    color: '#3b82f6',
    smsNumber: '9119',
    coordinates: [
      [44.8150, 20.3950], // Tošin bunar / Železnička stanica Tošin Bunar
      [44.8160, 20.4100], // Omladinskih brigada / West 65 / Airport City
      [44.8050, 20.4150], // Jurija Gagarina / Blok 67a / Delta City
      [44.7980, 20.4120], // Blok 70a uz Savu
      [44.7920, 20.3920], // Blok 45 / Savski kej
      [44.7980, 20.3780], // Dr Ivana Ribara / Blok 61
      [44.8060, 20.3800], // Jurija Gagarina / Gandijeva
      [44.8150, 20.3950],
    ],
  },
  // 8. PLAVA ZONA - NOVI BEOGRAD: Bežanijska Kosa
  {
    id: 'bg-poly-nbg-bezanija',
    cityId: 'beograd',
    zoneId: 'bg-zone-opsta',
    name: 'Plava zona - Bežanijska Kosa (Dr Huga Klajna, Pijaca)',
    code: '4',
    color: '#3b82f6',
    smsNumber: '9119',
    coordinates: [
      [44.8260, 20.3720], // Dr Huga Klajna / Ismeta Mujezinovića
      [44.8280, 20.3860], // Partizanske avijacije / auto-put
      [44.8160, 20.3880], // Nedeljka Gvozdenovića / Pijaca B. Kosa
      [44.8150, 20.3700], // Raška Dimitrijevića
      [44.8260, 20.3720],
    ],
  },
  // 9. PLAVA ZONA - ZEMUN (Centar, Donji i Gornji Grad, Kalvarija, Kej)
  {
    id: 'bg-poly-zemun-all',
    cityId: 'beograd',
    zoneId: 'bg-zone-opsta',
    name: 'Plava zona - Zemun (Centar, Donji Grad, Gornji Grad, Kej, Kalvarija)',
    code: '4',
    color: '#3b82f6',
    smsNumber: '9119',
    coordinates: [
      [44.8580, 20.3980], // Pregrevica / Gornji grad / Cara Dušana sever
      [44.8550, 20.4180], // Kej Oslobođenja / Dunavska obala / Gardoš
      [44.8420, 20.4240], // Dunavski kej kod Juge / Avijatičarski trg
      [44.8360, 20.4120], // 22. Oktobra / Vrtlarska
      [44.8390, 20.3960], // Kalvarija / Teodora Hercla
      [44.8460, 20.3910], // Prvomajska / Pazovački put
      [44.8520, 20.3920], // Šilerova / Ugrinovačka
      [44.8580, 20.3980],
    ],
  },
  // 10. PLAVA ZONA - ČUKARICA / BANOVO BRDO (Požeška, Lješka, Šumadijski trg)
  {
    id: 'bg-poly-banovo-brdo',
    cityId: 'beograd',
    zoneId: 'bg-zone-opsta',
    name: 'Plava zona - Banovo Brdo (Požeška, Lješka, Šumadijski trg)',
    code: '4',
    color: '#3b82f6',
    smsNumber: '9119',
    coordinates: [
      [44.7890, 20.4120], // Radnička / Kirovljeva prilaz
      [44.7880, 20.4240], // Zrmanjska / Požeška vrh
      [44.7760, 20.4250], // Požeška / Trebevićka
      [44.7720, 20.4140], // Lješka / Blagoja Parovića spoj
      [44.7780, 20.4070], // Šumadijski trg / Turgenjevljeva
      [44.7890, 20.4120],
    ],
  },
];

/**
 * NOVI SAD - Detaljno mapirane parking zone (Parking Servis Novi Sad)
 * 1. Crvena zona (8211 - Centar i pešačko jezgro)
 * 2. Plava zona (8212 - Grbavica, Liman 1-4, Podbara, Rotkvarija, Sajam, Bulevar, Železnička stanica)
 * 3. Bela zona (8213 - Celodnevna / šira područja)
 */
export const NOVI_SAD_ZONE_POLYGONS: CityZonePolygon[] = [
  // Crvena zona (Centar)
  {
    id: 'ns-poly-crvena',
    cityId: 'novi-sad',
    zoneId: 'ns-crvena',
    name: 'Crvena zona (Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '8211',
    coordinates: [
      [45.2630, 19.8390], // Jevrejska / Šafarikova
      [45.2640, 19.8490], // Pašićeva / Matice srpske
      [45.2580, 19.8540], // Dunavski park / Kej žrtava racije
      [45.2520, 19.8490], // Bulevar Mihajla Pupina / Spens
      [45.2510, 19.8410], // Kralja Aleksandra / Pozorišni trg
      [45.2570, 19.8370], // Uspenska / Šafarikova
      [45.2630, 19.8390],
    ],
  },
  // Plava zona (širi centar: Liman, Grbavica, Rotkvarija, Podbara, Sajam, Bulevar Oslobođenja)
  {
    id: 'ns-poly-plava',
    cityId: 'novi-sad',
    zoneId: 'ns-plava',
    name: 'Plava zona (Grbavica, Liman 1-4, Rotkvarija, Podbara, Sajam)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '8212',
    coordinates: [
      [45.2750, 19.8250], // Bulevar Jaše Tomića / Železnička stanica
      [45.2770, 19.8520], // Podbara / Gundulićeva / Kanal DTD
      [45.2640, 19.8660], // Dunavski kej do Petrovaradinskog mosta
      [45.2420, 19.8620], // Liman 1 & 2 uz Dunav / Štrand
      [45.2340, 19.8410], // Liman 3 & 4 / Bulevar despota Stefana
      [45.2440, 19.8250], // Grbavica / Bulevar cara Lazara
      [45.2580, 19.8180], // Novosadski sajam / Hajduk Veljkova
      [45.2700, 19.8220], // Bulevar oslobođenja / Rumenačka
      [45.2750, 19.8250],
    ],
  },
  // Bela zona (Dnevna / šire područje)
  {
    id: 'ns-poly-bela',
    cityId: 'novi-sad',
    zoneId: 'ns-bela',
    name: 'Bela zona (Celodnevna / Najlon, Štrand, Sajam okolina)',
    code: '3',
    color: '#60a5fa',
    smsNumber: '8213',
    coordinates: [
      [45.2830, 19.8150],
      [45.2850, 19.8650],
      [45.2300, 19.8680],
      [45.2280, 19.8200],
      [45.2830, 19.8150],
    ],
  },
];

/**
 * VALJEVO - JKP Vidrak
 * VAŽNO / IMPORTANT:
 * U Valjevu se parking NE određuje poligonima niti radijusima, već ISKLJUČIVO
 * po zvaničnom spisku ulica JKP "Vidrak". Poligoni su prazni i zabranjeno ih je dodavati.
 */
export const VALJEVO_ZONE_POLYGONS: CityZonePolygon[] = [];

/**
 * KRAGUJEVAC - JKP Šumadija Kragujevac
 * 1. Ekstra zona (8340)
 * 2. Zona 1 (Crvena - 8341)
 * 3. Zona 2 (Plava - 8342 - Bubanj, Erdoglija, Vašarište, Sušica)
 */
export const KRAGUJEVAC_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'kg-poly-0',
    cityId: 'kragujevac',
    zoneId: 'kg-zona-0',
    name: 'Ekstra zona (Pešačko jezgro)',
    code: '0',
    color: '#8b5cf6',
    smsNumber: '8340',
    coordinates: [
      [44.0160, 20.9110],
      [44.0165, 20.9175],
      [44.0100, 20.9185],
      [44.0090, 20.9115],
      [44.0160, 20.9110],
    ],
  },
  {
    id: 'kg-poly-1',
    cityId: 'kragujevac',
    zoneId: 'kg-zona-1',
    name: 'Zona 1 (Centar - Glavna, Save Kovačevića, 27. marta)',
    code: '1',
    color: '#ef4444',
    smsNumber: '8341',
    coordinates: [
      [44.0230, 20.9030],
      [44.0245, 20.9270],
      [44.0050, 20.9290],
      [44.0030, 20.9060],
      [44.0230, 20.9030],
    ],
  },
  {
    id: 'kg-poly-2',
    cityId: 'kragujevac',
    zoneId: 'kg-zona-2',
    name: 'Plava zona (Širi centar - Bubanj, Erdoglija, Vašarište, Sušica)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '8342',
    coordinates: [
      [44.0350, 20.8850],
      [44.0370, 20.9420],
      [43.9920, 20.9440],
      [43.9900, 20.8890],
      [44.0350, 20.8850],
    ],
  },
];

/**
 * NIŠ - Parking Servis Niš
 * 1. I Crvena zona (9181 - Strogi centar)
 * 2. II Zelena zona (9182 - Širi centar, Čair, Palilula, Bulevar Nemanjića)
 * 3. III Plava zona (9183 - Trošarina, Medijana, Park Svetog Save)
 */
export const NIS_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'nis-poly-1',
    cityId: 'nis',
    zoneId: 'nis-crvena',
    name: 'I Crvena zona (Strogi centar - Trg Kralja Milana, Obrenovićeva)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9181',
    coordinates: [
      [43.3270, 21.8890],
      [43.3280, 21.9050],
      [43.3150, 21.9065],
      [43.3140, 21.8910],
      [43.3270, 21.8890],
    ],
  },
  {
    id: 'nis-poly-2',
    cityId: 'nis',
    zoneId: 'nis-zelena',
    name: 'II Zelena zona (Širi centar, Čair, Palilula, Bulevar Nemanjića)',
    code: '2',
    color: '#10b981',
    smsNumber: '9182',
    coordinates: [
      [43.3360, 21.8790],
      [43.3380, 21.9220],
      [43.3080, 21.9260],
      [43.3050, 21.8820],
      [43.3360, 21.8790],
    ],
  },
  {
    id: 'nis-poly-3',
    cityId: 'nis',
    zoneId: 'nis-plava',
    name: 'III Plava zona (Trošarina, Park Sv. Save, Medijana)',
    code: '3',
    color: '#3b82f6',
    smsNumber: '9183',
    coordinates: [
      [43.3420, 21.8650],
      [43.3450, 21.9420],
      [43.2980, 21.9460],
      [43.2950, 21.8690],
      [43.3420, 21.8650],
    ],
  },
];

/**
 * SUBOTICA - JKP Parking Subotica
 */
export const SUBOTICA_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'su-poly-1',
    cityId: 'subotica',
    zoneId: 'su-crvena',
    name: 'Crvena zona (I Zona - Centar & Korzo)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9241',
    coordinates: [
      [46.1065, 19.6570],
      [46.1075, 19.6740],
      [46.0935, 19.6755],
      [46.0925, 19.6590],
      [46.1065, 19.6570],
    ],
  },
  {
    id: 'su-poly-2',
    cityId: 'subotica',
    zoneId: 'su-plava',
    name: 'Plava zona (II Zona - Radijalac, Senćanski put)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '9242',
    coordinates: [
      [46.1200, 19.6450],
      [46.1220, 19.6920],
      [46.0780, 19.6950],
      [46.0760, 19.6480],
      [46.1200, 19.6450],
    ],
  },
  {
    id: 'su-poly-3',
    cityId: 'subotica',
    zoneId: 'su-zelena',
    name: 'Zelena zona (III Zona - Palić)',
    code: '3',
    color: '#10b981',
    smsNumber: '9243',
    coordinates: [
      [46.1100, 19.7450],
      [46.1130, 19.7820],
      [46.0850, 19.7860],
      [46.0820, 19.7490],
      [46.1100, 19.7450],
    ],
  },
];

/**
 * ČAČAK - Parking Servis Čačak
 */
export const CACAK_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'ca-poly-1',
    cityId: 'cacak',
    zoneId: 'ca-1',
    name: 'Zona 1 (Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9321',
    coordinates: [
      [43.8975, 20.3410],
      [43.8985, 20.3590],
      [43.8850, 20.3610],
      [43.8840, 20.3430],
      [43.8975, 20.3410],
    ],
  },
  {
    id: 'ca-poly-2',
    cityId: 'cacak',
    zoneId: 'ca-2',
    name: 'Plava zona (Zona 2 - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '9322',
    coordinates: [
      [43.9090, 20.3300],
      [43.9110, 20.3730],
      [43.8730, 20.3760],
      [43.8710, 20.3330],
      [43.9090, 20.3300],
    ],
  },
];

/**
 * UŽICE - Bioktoš Užice
 */
export const UZICE_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'ue-poly-1',
    cityId: 'uzice',
    zoneId: 'ue-1',
    name: 'Crvena zona (I Zona - Centar & Trg Partizana)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9311',
    coordinates: [
      [43.8635, 19.8400],
      [43.8645, 19.8570],
      [43.8530, 19.8590],
      [43.8520, 19.8420],
      [43.8635, 19.8400],
    ],
  },
  {
    id: 'ue-poly-2',
    cityId: 'uzice',
    zoneId: 'ue-2',
    name: 'Plava zona (II Zona - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '9312',
    coordinates: [
      [43.8740, 19.8290],
      [43.8760, 19.8710],
      [43.8420, 19.8740],
      [43.8400, 19.8320],
      [43.8740, 19.8290],
    ],
  },
];

/**
 * PANČEVO - JKP Higijena Pančevo
 */
export const PANCEVO_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'pa-poly-1',
    cityId: 'pancevo',
    zoneId: 'pa-1',
    name: 'Crvena zona (I Zona - Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '8131',
    coordinates: [
      [44.8765, 20.6380],
      [44.8775, 20.6520],
      [44.8660, 20.6540],
      [44.8650, 20.6400],
      [44.8765, 20.6380],
    ],
  },
  {
    id: 'pa-poly-2',
    cityId: 'pancevo',
    zoneId: 'pa-2',
    name: 'Plava zona (II Zona - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '8132',
    coordinates: [
      [44.8870, 20.6270],
      [44.8890, 20.6650],
      [44.8550, 20.6680],
      [44.8530, 20.6300],
      [44.8870, 20.6270],
    ],
  },
];

/**
 * ZRENJANIN - JKP Pijace i parkinzi Zrenjanin
 */
export const ZRENJANIN_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'zr-poly-1',
    cityId: 'zrenjanin',
    zoneId: 'zr-crvena',
    name: 'Crvena zona (I Zona - Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '8231',
    coordinates: [
      [45.3895, 20.3810],
      [45.3905, 20.3970],
      [45.3790, 20.3990],
      [45.3780, 20.3830],
      [45.3895, 20.3810],
    ],
  },
  {
    id: 'zr-poly-2',
    cityId: 'zrenjanin',
    zoneId: 'zr-plava',
    name: 'Plava zona (II Zona - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '8232',
    coordinates: [
      [45.4010, 20.3700],
      [45.4030, 20.4150],
      [45.3640, 20.4180],
      [45.3620, 20.3730],
      [45.4010, 20.3700],
    ],
  },
];

/**
 * KRUŠEVAC - Poslovni centar Kruševac
 */
export const KRUSEVAC_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'ks-poly-1',
    cityId: 'krusevac',
    zoneId: 'ks-1',
    name: 'Zona 1 (Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9371',
    coordinates: [
      [43.5860, 21.3250],
      [43.5870, 21.3420],
      [43.5730, 21.3440],
      [43.5720, 21.3270],
      [43.5860, 21.3250],
    ],
  },
  {
    id: 'ks-poly-2',
    cityId: 'krusevac',
    zoneId: 'ks-2',
    name: 'Plava zona (Zona 2 - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '9372',
    coordinates: [
      [43.5970, 21.3130],
      [43.5990, 21.3580],
      [43.5600, 21.3610],
      [43.5580, 21.3160],
      [43.5970, 21.3130],
    ],
  },
];

/**
 * KRALJEVO - JKP Čistoća Kraljevo
 */
export const KRALJEVO_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'kv-poly-1',
    cityId: 'kraljevo',
    zoneId: 'kv-1',
    name: 'Zona 1 (Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '9361',
    coordinates: [
      [43.7295, 20.6790],
      [43.7305, 20.6960],
      [43.7170, 20.6980],
      [43.7160, 20.6810],
      [43.7295, 20.6790],
    ],
  },
  {
    id: 'kv-poly-2',
    cityId: 'kraljevo',
    zoneId: 'kv-2',
    name: 'Plava zona (Zona 2 - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '9362',
    coordinates: [
      [43.7400, 20.6680],
      [43.7420, 20.7120],
      [43.7040, 20.7150],
      [43.7020, 20.6710],
      [43.7400, 20.6680],
    ],
  },
];

/**
 * ŠABAC - JKP Parking Šabac
 */
export const SABAC_ZONE_POLYGONS: CityZonePolygon[] = [
  {
    id: 'sa-poly-1',
    cityId: 'sabac',
    zoneId: 'sa-1',
    name: 'Zona 1 (Centar)',
    code: '1',
    color: '#ef4444',
    smsNumber: '8151',
    coordinates: [
      [44.7550, 19.6830],
      [44.7560, 19.7000],
      [44.7420, 19.7020],
      [44.7410, 19.6850],
      [44.7550, 19.6830],
    ],
  },
  {
    id: 'sa-poly-2',
    cityId: 'sabac',
    zoneId: 'sa-2',
    name: 'Plava zona (Zona 2 - Širi centar)',
    code: '2',
    color: '#3b82f6',
    smsNumber: '8152',
    coordinates: [
      [44.7670, 19.6720],
      [44.7690, 19.7170],
      [44.7290, 19.7200],
      [44.7270, 19.6750],
      [44.7670, 19.6720],
    ],
  },
];

export const ALL_CITY_ZONE_POLYGONS: Record<string, CityZonePolygon[]> = {
  beograd: BELGRADE_ZONE_POLYGONS,
  'novi-sad': NOVI_SAD_ZONE_POLYGONS,
  kragujevac: KRAGUJEVAC_ZONE_POLYGONS,
  nis: NIS_ZONE_POLYGONS,
  subotica: SUBOTICA_ZONE_POLYGONS,
  cacak: CACAK_ZONE_POLYGONS,
  uzice: UZICE_ZONE_POLYGONS,
  pancevo: PANCEVO_ZONE_POLYGONS,
  zrenjanin: ZRENJANIN_ZONE_POLYGONS,
  krusevac: KRUSEVAC_ZONE_POLYGONS,
  kraljevo: KRALJEVO_ZONE_POLYGONS,
  sabac: SABAC_ZONE_POLYGONS,
  valjevo: VALJEVO_ZONE_POLYGONS,
};
