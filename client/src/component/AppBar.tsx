import { Toolbar, Typography, AppBar as MuiAppBar } from "@mui/material";
import { Outlet } from "react-router";

export default function AppBar() {
  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6">QWERTY</Typography>
        </Toolbar>
      </MuiAppBar>
      <Outlet />
    </>
  );
}
