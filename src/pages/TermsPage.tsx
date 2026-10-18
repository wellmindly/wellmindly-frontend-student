import { LegalPage } from "./legal/LegalPage";
import { TERMS_OF_SERVICE } from "./legal/legalContent";

export function TermsPage() {
  return <LegalPage doc={TERMS_OF_SERVICE} />;
}
