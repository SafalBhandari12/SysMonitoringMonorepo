import { Domain } from "@/prisma/generated/prisma/browser";
import DomainVerificationButton from "./domainVerificationButton";

export default async function DomainVerification({
  domain,
}: {
  userId: string;
  domain: Domain;
}) {
  const verificationCode = domain.verificationCode;

  return (
    <div>
      <DomainVerificationButton />
      <div>
        <h1>Add this to the dns record</h1>
        <ul>
          <li>{verificationCode}</li>
          <li>Go to your DNS provider and add the TXT record</li>
          <li>TTL: 300</li>
          <li>Once added, click the verify button</li>
        </ul>
      </div>
      <div className="border-b-2" />
      <div>
        <h1>Add this to the meta tag</h1>
        <ul>
          <li>{verificationCode}</li>
          <li>Go to your website and add the meta tag in the head section</li>
          <li>
            <code>
              {`<meta name="sysMonitoring-Verification" content="${verificationCode}" />`}
            </code>
          </li>
          <li>Once added, click the verify button</li>
        </ul>
      </div>
      <div className="border-b-4"></div>
    </div>
  );
}
