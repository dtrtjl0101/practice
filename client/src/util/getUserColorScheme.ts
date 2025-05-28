export default function getUserColorScheme() {
  const userColorSchemeLocalStorage = localStorage.getItem("colorScheme") as
    | "light"
    | "dark"
    | null;

  if (userColorSchemeLocalStorage) {
    return userColorSchemeLocalStorage;
  }

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
