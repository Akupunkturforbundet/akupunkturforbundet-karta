import type { Practitioner } from "../types";

// Samtliga poster är fiktiva och används endast för utveckling och test.
export const practitioners: Practitioner[] = [
  { id: "test-01", name: "Anna Lind", clinic: "Lugnets mottagning", streetAddress: "Kungsgatan 18", postalCode: "111 35", locality: "Stockholm", latitude: 59.3352, longitude: 18.0641, phone: "070-000 00 01", email: "anna.lind@example.com", website: "https://example.com" },
  { id: "test-02", name: "Erik Sjöberg", clinic: "Balanskliniken", streetAddress: "S:t Olofsgatan 12", postalCode: "753 12", locality: "Uppsala", latitude: 59.8605, longitude: 17.6428, phone: "070-000 00 02", email: "erik.sjoberg@example.com" },
  { id: "test-03", name: "Maria Ek", clinic: "Västerhöjds mottagning", streetAddress: "Linnégatan 31", postalCode: "413 04", locality: "Göteborg", latitude: 57.6989, longitude: 11.9511, phone: "070-000 00 03", email: "maria.ek@example.com", website: "https://example.com" },
  { id: "test-04", name: "Johan Berg", clinic: "Sundets akupunktur", streetAddress: "Stora Nygatan 22", postalCode: "211 37", locality: "Malmö", latitude: 55.6045, longitude: 13.0002 },
  { id: "test-05", name: "Sara Holm", clinic: "Harmoni i norr", streetAddress: "Rådhusesplanaden 7", postalCode: "903 28", locality: "Umeå", latitude: 63.8268, longitude: 20.263 },
  { id: "test-06", name: "Lena Nyström", clinic: "Örebro hälsorum", streetAddress: "Drottninggatan 16", postalCode: "702 10", locality: "Örebro", latitude: 59.2719, longitude: 15.2106, phone: "070-000 00 06", email: "lena.nystrom@example.com", website: "https://example.com" },
  { id: "test-07", name: "Oskar Vik", clinic: "Trädgårdens mottagning", streetAddress: "Borgmästargränd 4", postalCode: "553 20", locality: "Jönköping", latitude: 57.7815, longitude: 14.1618 },
  { id: "test-08", name: "Karin Lund", clinic: "Kustens klinik", streetAddress: "Norra Kyrkogatan 8", postalCode: "252 23", locality: "Helsingborg", latitude: 56.047, longitude: 12.694 },
  { id: "test-09", name: "David Ström", clinic: "Ekhagens mottagning", streetAddress: "Storgatan 38", postalCode: "582 23", locality: "Linköping", latitude: 58.4102, longitude: 15.6215 },
  { id: "test-10", name: "Eva Norén", clinic: "Koppardalens akupunktur", streetAddress: "Åsgatan 19", postalCode: "791 71", locality: "Falun", latitude: 60.6075, longitude: 15.6323 },
  { id: "test-11", name: "Nils Håkansson", clinic: "Hamngatans mottagning", streetAddress: "Hamngatan 11", postalCode: "972 34", locality: "Luleå", latitude: 65.5837, longitude: 22.1533 },
  { id: "test-12", name: "Ingrid Dahl", clinic: "Västerås akupunktur", streetAddress: "Kopparbergsvägen 14", postalCode: "722 13", locality: "Västerås", latitude: 59.6106, longitude: 16.5451 },
  { id: "test-13", name: "Maja Frisk", clinic: "Stadsträdgårdens klinik", streetAddress: "Vasagatan 9", postalCode: "411 24", locality: "Göteborg", latitude: 57.7017, longitude: 11.9715 },
  { id: "test-14", name: "Per Öst", clinic: "Akademiska mottagningen", streetAddress: "Sysslomansgatan 20", postalCode: "752 23", locality: "Uppsala", latitude: 59.8608, longitude: 17.6317 },
  { id: "test-15", name: "Sofia Linde", clinic: "Söderkliniken", streetAddress: "Götgatan 46", postalCode: "118 26", locality: "Stockholm", latitude: 59.3152, longitude: 18.0723 }
];
