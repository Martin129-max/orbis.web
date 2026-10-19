import * as Organism from "@organism";
import * as Template from "@template";

export default function LoginPage() {
  return (
    <Template.CenteredTemplate>
      <Organism.RedirectIfAuthenticated />
      <Organism.AuthForm mode="login" />
    </Template.CenteredTemplate>
  );
}
