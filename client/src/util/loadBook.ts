import API_CLIENT from "../api/api";
class BookStorage {
  private db: Promise<IDBDatabase>;
  constructor() {
    this.db = new Promise((resolve, reject) => {
      const request = indexedDB.open("books", 1);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onerror = (event) => {
          console.error(event);
        };
        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books", { keyPath: "id" });
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

  public async getBook(bookId: number): Promise<ArrayBuffer | null> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const request = db
        .transaction("books", "readonly")
        .objectStore("books")
        .get(bookId);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          resolve(result.book);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  public async setBook(bookId: number, book: ArrayBuffer): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.db;
      const request = db
        .transaction("books", "readwrite")
        .objectStore("books")
        .put({ id: bookId, book });
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }
}

const bookStorage = new BookStorage();

export default async function loadBook(bookId: number) {
  const cachedBook = await loadBookFromIndexedDB(bookId);
  if (cachedBook) {
    return cachedBook;
  }
  return await fetchBookFromServer(bookId).then(async (book) => {
    await saveBookToIndexedDB(bookId, book);
    return book;
  });
}

async function fetchBookFromServer(bookId: number): Promise<ArrayBuffer> {
  const downloadUrlResponse =
    await API_CLIENT.ebookController.downloadFile(bookId);
  if (!downloadUrlResponse.isSuccessful) {
    throw new Error(downloadUrlResponse.errorCode);
  }
  const downloadUrl = downloadUrlResponse.data.presignedUrl!;
  const bookResponse = await fetch(downloadUrl);
  if (!bookResponse.ok) {
    throw new Error("Failed to fetch book from server");
  }
  const book = await bookResponse.arrayBuffer();

  return book;
}

async function loadBookFromIndexedDB(bookId: number) {
  if (!indexedDB) {
    return null;
  }
  const cachedBook = await bookStorage.getBook(bookId).catch((error) => {
    console.error("Failed to load book from IndexedDB", error);
    return null;
  });

  return cachedBook;
}

async function saveBookToIndexedDB(bookId: number, book: ArrayBuffer) {
  if (!indexedDB) {
    return;
  }
  await bookStorage.setBook(bookId, book).catch((error) => {
    console.error("Failed to save book to IndexedDB", error);
  });
}
