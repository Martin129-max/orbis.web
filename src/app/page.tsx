import { Suspense } from "react";
import { Heading } from "@/components/atoms/heading";
import { MainNav } from "@/components/organisms/main-nav";
import { ServerStatus } from "@/components/organisms/server-status";
import { CenteredTemplate } from "@/components/templates/centered-template";

export default function Home() {
  return (
    <CenteredTemplate>
      <Heading>Orbis</Heading>
      <Suspense fallback={<p>Connecting to server...</p>}>
        <ServerStatus />
      </Suspense>
      <MainNav />
    </CenteredTemplate>
  );
}
