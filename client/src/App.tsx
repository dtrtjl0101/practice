import {
  AppBar,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import createThemeWithUserColorScheme from "./util/createThemeWithUserColorScheme";

const theme = createThemeWithUserColorScheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">QWERTY</Typography>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
