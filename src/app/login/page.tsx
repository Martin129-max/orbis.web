import { AuthForm } from "@/components/organisms/auth-form";
import { CenteredTemplate } from "@/components/templates/centered-template";

export default function LoginPage() {
  return (
    <CenteredTemplate>
      <AuthForm mode="login" />
    </CenteredTemplate>
  );
}
