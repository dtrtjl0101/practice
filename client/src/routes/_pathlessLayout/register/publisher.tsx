import { createFileRoute } from "@tanstack/react-router";
import RegisterForm from "../../../component/RegisterForm";

export const Route = createFileRoute("/_pathlessLayout/register/publisher")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  return (
    <RegisterForm
      registerType="publisher"
      handleBack={() =>
        navigate({
          to: "../..",
        })
      }
    />
  );
}
