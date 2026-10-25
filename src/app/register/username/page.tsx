import * as Organism from "@organism";
import * as Template from "@template";

export default function RegisterUsernamePage() {
  return (
    <Organism.GuestGate>
      <Template.AuthTemplate illustration="/images/signup-illustration.jpg">
        <Organism.OAuthUsernameForm />
      </Template.AuthTemplate>
    </Organism.GuestGate>
  );
}
