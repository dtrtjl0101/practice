import { Rendition } from "epubjs";
import { ENV } from "../env";

class LocationsStorage {
  private db: Promise<IDBDatabase>;
  constructor() {
    this.db = new Promise((resolve, reject) => {
      const request = indexedDB.open("locations", 1);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onerror = (event) => {
          console.error(event);
        };
        if (!db.objectStoreNames.contains("locations")) {
          db.createObjectStore("locations", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  public async getLocations(bookId: number): Promise<string | null> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const request = db
        .transaction("locations", "readonly")
        .objectStore("locations")
        .get(getLocationsKey(bookId));

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          resolve(result.locations);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  public async setLocations(bookId: number, locations: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const request = db
        .transaction("locations", "readwrite")
        .objectStore("locations")
        .put({ id: getLocationsKey(bookId), locations });
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }
}

const locationsStorage = new LocationsStorage();

export default async function loadLocations(
  bookId: number,
  rendition?: Rendition
) {
  if (!rendition || !rendition.book || !rendition.book.locations) {
    return;
  }
  if (rendition.book.locations.length()) {
    return;
  }
  const cached = await locationsStorage.getLocations(bookId);
  if (cached) {
    rendition.book.locations.load(cached);
    return;
  }
  await rendition.book.locations.generate(1000);
  await locationsStorage.setLocations(bookId, rendition.book.locations.save());
}

function getLocationsKey(bookId: number): string {
  return `${ENV.CHAEKIT_API_ENDPOINT}-${bookId}`;
}
