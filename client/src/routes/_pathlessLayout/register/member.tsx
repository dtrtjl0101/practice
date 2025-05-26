import { createFileRoute } from "@tanstack/react-router";
import RegisterForm from "../../../component/RegisterForm";

export const Route = createFileRoute("/_pathlessLayout/register/member")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  return (
    <RegisterForm
      registerType="member"
      handleBack={() =>
        navigate({
          to: "../..",
        })
      }
    />
  );
}
