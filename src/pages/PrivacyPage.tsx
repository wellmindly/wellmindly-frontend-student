import { LegalPage } from "./legal/LegalPage";
import { PRIVACY_POLICY } from "./legal/legalContent";

export function PrivacyPage() {
  return <LegalPage doc={PRIVACY_POLICY} />;
}
