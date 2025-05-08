export default function loadBook(bookId: string) {
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

function tryLoadBookFromIndexedDB(bookId: string) {
  if (!indexedDB) {
    return null;
  }
  const book = indexedDB.databases;
  if (!book) return null;
  return JSON.parse(book);
}

function indexedDBBookKey(bookId: string) {
  return `book-${bookId}`;
}
