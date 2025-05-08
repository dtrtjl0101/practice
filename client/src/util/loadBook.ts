import API_CLIENT, { wrapApiResponse } from "../api/api";

export default function loadBook(bookId: number) {
  const book = tryLoadBookFromIndexedDB(bookId);
  if (book) {
    return book;
  }

  const bookKey = indexedDBBookKey(bookId);
  const bookString = localStorage.getItem(bookKey);
  if (!bookString) return null;

  try {
    const book = JSON.parse(bookString);
    return book;
  } catch (e) {
    console.error("Failed to parse book from localStorage", e);
    return null;
  }
}

async function fetchBookFromServer(bookId: number) {
  wrapApiResponse(API_CLIENT.ebookController.downloadFile(bookId));
}

function tryLoadBookFromIndexedDB(bookId: number) {
  if (!indexedDB) {
    return null;
  }
  const book = indexedDB.databases;
  if (!book) return null;
  return JSON.parse(book);
}

function saveBookToIndexedDB(bookId: number, book: any) {
  if (!indexedDB) {
    return;
  }
  const bookKey = indexedDBBookKey(bookId);
}

function indexedDBBookKey(bookId: number) {
  return `book-${bookId}`;
}
