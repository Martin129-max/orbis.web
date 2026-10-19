import * as Organism from "@organism";
import * as Template from "@template";

export default function RegisterPage() {
  return (
    <Template.CenteredTemplate>
      <Organism.RedirectIfAuthenticated />
      <Organism.AuthForm mode="signup" />
    </Template.CenteredTemplate>
  );
}
