# Pravila projekta i ponašanja za AI asistente (AGENTS.md)

## 1. ZONSKE ODREDBE ZA VALJEVO I SVE GRADOVE (KRITIČNO PRAVILO)
- **Svi gradovi sa definisanim spiskom ulica (Valjevo, Čačak, Niš, Novi Sad, Kragujevac, Užice, Pančevo, Zrenjanin, Kraljevo, Kruševac, Šabac, Subotica, Beograd, Banja Luka, Sarajevo, Podgorica)**:
  - Zone se određuju **ISKLJUČIVO** na osnovu zvaničnih spiskova ulica i odluka javnih preduzeća koja naplaćuju parking (`detectionMethod: 'street_list'` i `CITY_ZONE_STREETS`).
  - Za Valjevo: isključivo zvaničan spisak JKP „Vidrak“ (`VALJEVO_OFFICIAL_STREETS` i `VALJEVO_PARKING_JSON`).
- **STRIKTNO ZABRANJENO**:
  - **Nikada ne koristiti radijalnu procenu udaljenosti od centra**: Zabranjeno je nagađati zone tipa "ako je <= 500m od centra grada onda Crvena zona / Zona 1, ako je <= 1600m onda Plava zona / Zona 2".
  - Ako vozilo/korisnik nije na zvaničnoj ulici ili segmentu sa spiska javnog preduzeća, status je **VAN ZONE NAPLATE (Besplatan parking)**.
  - Nikada ne vraćati poligone za Valjevo.
- **Bez obzira na to šta se menja u aplikaciji** (bilo da su u pitanju novi gradovi, dizajn, modali, PWA, Play Store export, brisanje podataka, istorija ili druga podešavanja), **ovo pravilo ostaje trajno fiksirano i ne sme se menjati bez izričitog uputstva korisnika**.
