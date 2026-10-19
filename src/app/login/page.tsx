import * as Organism from "@organism";
import * as Template from "@template";

export default function LoginPage() {
  return (
    <Organism.GuestGate>
      <Template.CenteredTemplate>
        <Organism.AuthForm mode="login" />
      </Template.CenteredTemplate>
    </Organism.GuestGate>
  );
}
