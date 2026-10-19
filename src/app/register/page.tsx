import * as Organism from "@organism";
import * as Template from "@template";

export default function RegisterPage() {
  return (
    <Organism.GuestGate>
      <Template.CenteredTemplate>
        <Organism.AuthForm mode="signup" />
      </Template.CenteredTemplate>
    </Organism.GuestGate>
  );
}
