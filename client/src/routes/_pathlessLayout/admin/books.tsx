import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/admin/books")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader title="Books" />
      <CardContent>
        <Typography>books</Typography>
      </CardContent>
    </Card>
  );
}
