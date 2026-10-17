import * as Organism from "@organism";
import * as Template from "@template";

export default function SignupPage() {
  return (
    <Template.CenteredTemplate>
      <Organism.AuthForm mode="signup" />
    </Template.CenteredTemplate>
  );
}
