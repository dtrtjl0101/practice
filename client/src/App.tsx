import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAtomValue } from "jotai";
import State from "./states";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const themes = {
  light: createTheme({
    palette: {
      mode: "light",
    },
  }),
  dark: createTheme({
    palette: {
      mode: "dark",
    },
  }),
};

const queryClient = new QueryClient();

export default function App() {
  const userColorScheme = useAtomValue(State.UI.userColorScheme);

  return (
    <ThemeProvider theme={themes[userColorScheme]}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
