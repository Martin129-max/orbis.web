import type { Metadata } from "next";
import Link from "next/link";
import * as Template from "@template";

export const metadata: Metadata = {
  title: "Terms of service · Orbis",
  description: "The terms that apply when you use Orbis.",
};

export default function TermsPage() {
  return (
    <Template.LegalTemplate title="Terms of service" updated="October 22, 2026">
      <p>
        These terms govern your use of Orbis. By creating an account or using
        the service, you agree to them. If you do not agree, do not use Orbis.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be at least 13 years old to use Orbis.</li>
        <li>
          You are responsible for the information you provide, for keeping your
          password secure, and for all activity under your account.
        </li>
        <li>
          Do not share your account or create an account for someone else
          without their permission.
        </li>
      </ul>

      <h2>Your content</h2>
      <p>
        You own the content you post on Orbis. By posting it, you give Orbis a
        non-exclusive, worldwide, royalty-free license to store, display, and
        distribute that content as needed to operate the service, for example
        to show your posts to the communities you share them with. This license
        ends when your content is deleted, except where it has been shared with
        others who have not deleted it.
      </p>
      <p>
        You are responsible for what you post and confirm that you have the
        rights to share it.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree to follow our{" "}
        <Link href="/guidelines">Community guidelines</Link>. You also agree
        not to:
      </p>
      <ul>
        <li>Break the law or encourage others to break it.</li>
        <li>
          Interfere with or disrupt the service, or try to access accounts,
          systems, or data you are not authorized to access.
        </li>
        <li>
          Use bots, scrapers, or other automated tools without our permission.
        </li>
        <li>Reverse engineer the service, except where the law allows it.</li>
      </ul>

      <h2>Communities</h2>
      <p>
        Anyone can create a community. Community owners and admins can set
        rules, manage settings, and moderate their communities, and they are
        responsible for doing so in line with these terms. Orbis may remove
        content or communities that violate these terms or our guidelines.
      </p>

      <h2>Privacy</h2>
      <p>
        Our <Link href="/privacy">Privacy policy</Link> explains how we collect
        and use your information.
      </p>

      <h2>Suspension and termination</h2>
      <p>
        You may stop using Orbis at any time. We may suspend or terminate your
        access if you violate these terms or our guidelines, or if we need to
        do so to protect other members or the service.
      </p>

      <h2>Disclaimers</h2>
      <p>
        Orbis is provided &quot;as is&quot; and &quot;as available&quot;,
        without warranties of any kind. We do not guarantee that the service
        will always be available, secure, or free of errors. Content posted by
        members reflects their own views, not those of Orbis.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, Orbis is not liable for any indirect,
        incidental, special, consequential, or punitive damages, or for any
        loss of data, arising from your use of the service.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. When we do, we will change
        the date at the top of this page. If the changes are significant, we
        will let you know through Orbis. Continuing to use Orbis after changes
        take effect means you accept the updated terms.
      </p>
    </Template.LegalTemplate>
  );
}
