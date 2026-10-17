import { AuthForm } from "@/components/organisms/auth-form";
import { CenteredTemplate } from "@/components/templates/centered-template";

export default function SignupPage() {
  return (
    <CenteredTemplate>
      <AuthForm mode="signup" />
    </CenteredTemplate>
  );
}
