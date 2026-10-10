# WellMindly — Legal & Play Store Compliance Pack

> **Status: DRAFT — not legal advice.** The in-app Privacy Policy (`/privacy`) and
> Terms of Service (`/terms`) are grounded in the app's actual data flows, but
> they contain `[PLACEHOLDER]` tokens that **must** be filled in and the whole
> set reviewed by a qualified lawyer before launch. WellMindly is a mental-health
> product used by students (and possibly minors), so the privacy posture is
> regulated under GDPR/UK GDPR, UAE PDPL, India DPDP, Australia Privacy Act, and
> may touch university (FERPA-adjacent) obligations.

Source of truth for the page content:
[`src/pages/legal/legalContent.ts`](../../src/pages/legal/legalContent.ts).

---

## 1. Placeholder checklist (fill before publishing)

Every `[PLACEHOLDER: ...]` in `legalContent.ts` resolves to one of these. Nothing
below can be derived from the code — the business owner + lawyer must supply them.

| # | Placeholder | Needed for | Notes |
|---|-------------|-----------|-------|
| 1 | Legal entity name | Privacy + Terms | The company/person that operates WellMindly. |
| 2 | Registered address | Privacy §13 | Also the Play Console developer address. |
| 3 | Governing jurisdiction + courts | Terms §13 | Likely UAE given the +971 contact, but confirm. |
| 4 | Minimum age | Privacy §11, Terms §1 | 16 or 18 drives children's-data obligations. |
| 5 | AI sub-processor name | Privacy §4 | Who processes WriteMindly journal text. |
| 6 | AI training stance | Privacy §4 | Confirm entries are NOT used to train the provider's models. |
| 7 | Hosting / backend provider | Privacy §5 | Named sub-processor. |
| 8 | Email delivery provider | Privacy §5 | Only if transactional email is sent. |
| 9 | Data retention period | Privacy §7 | e.g. delete within 30 days of account deletion. |
| 10 | Primary data-storage country + transfer safeguards | Privacy §10 | e.g. SCCs. |
| 11 | DPO / grievance officer | Privacy §13 | Required in some jurisdictions (e.g. India DPDP). |

**Also before Play submission:** remove the on-page "working draft" notice in
[`src/pages/legal/LegalPage.tsx`](../../src/pages/legal/LegalPage.tsx) once all
placeholders are filled and legal review is complete.

---

## 2. Required Play Store URLs

| Requirement | URL | Status |
|-------------|-----|--------|
| Privacy Policy (required) | `https://www.wellmindly.com/privacy` | ✅ live route |
| Terms of Service (recommended) | `https://www.wellmindly.com/terms` | ✅ live route |
| Account & data deletion (required for apps with accounts) | see §4 | ⚠️ action needed |

The Play Console **Data deletion** field needs a URL where a user can request
account + data deletion. Privacy §8 already states deletion is available in-app
and via `Info@wellmindly.com`; either point the field at `/privacy#your-rights`
or stand up a dedicated deletion-request page/form.

---

## 3. Google Play Data Safety form — field-by-field mapping

Grounded in the observed data flows (no analytics/ads SDKs in this build).
Confirm each row against the final backend before submitting.

### Data collected

| Data type | Collected? | Shared? | Processing | Purpose |
|-----------|-----------|---------|-----------|---------|
| Name | Yes (Google Sign-In) | No | Not ephemeral | Account management |
| Email address | Yes | No | Not ephemeral | Account management |
| User IDs (Google account ID) | Yes | No | Not ephemeral | Account management, auth |
| Photos (Google profile picture URL) | Yes | No | Not ephemeral | Account personalisation |
| Health & fitness — "Health info" (mood check-ins, assessment/PHQ-style results, journal entries) | Yes | Yes (AI sub-processor) | Not ephemeral | App functionality |
| User-generated content (TalkMindly posts/replies, journal text) | Yes | Yes (visible to peers / AI) | Not ephemeral | App functionality |
| Other (booking details, contact-form messages) | Yes | No | Not ephemeral | App functionality, support |
| App activity / in-app actions | Yes | No | Not ephemeral | App functionality |
| App info & performance (crash/diagnostic logs) | Yes (server logs) | No | Not ephemeral | Analytics / stability |
| Device or other IDs | No | — | — | — |
| Location | No | — | — | — |
| Financial info | No | — | — | — |
| Contacts | No | — | — | — |

**Advertising / third-party analytics:** None in this build. Answer "No" to
"data shared with third parties for advertising" and do not declare an ads SDK.

### Security practices (declare)

- **Data encrypted in transit:** Yes (HTTPS; `usesCleartextTraffic=false`,
  cleartext allowed only for `localhost`/`127.0.0.1` in
  `network_security_config.xml` for local dev — not production traffic).
- **Users can request data deletion:** Yes — see §2 / §4.
- **Committed to Play Families Policy:** only if you target children; given the
  student focus and a 16/18 minimum age, this is likely **not** a Families app —
  confirm with the age decision (placeholder #4).

### Sensitive-data note

Mood, assessment, and journal data are **health information**. Play requires that
such data is used only for app functionality (not advertising) and is disclosed
in the privacy policy — both satisfied here. Google may also require a
**Health apps declaration**; complete it if prompted.

---

## 4. Account & data deletion (required)

Play requires a way for users to delete their account and data, reachable from
both inside the app and a public URL. Current coverage:

- **In-app:** Privacy §8 states account deletion is available in the app — ensure
  the account/settings screen exposes a working "Delete account" action that
  deletes server-side data (verify the backend endpoint exists).
- **Public URL:** `https://www.wellmindly.com/privacy#your-rights` documents the
  email route (`Info@wellmindly.com`). If Play requires a dedicated form, add a
  `/delete-account` route; otherwise the Privacy anchor is acceptable for the
  "instructions" style of the Data deletion field.

---

## 5. Health & crisis safety

- The app is **not** a medical/emergency service — stated in both Privacy intro
  and Terms §2, with a pointer to the in-app `/crisis` screen.
- Keep the Crisis support screen reachable without login (public route) so a
  user in distress is never blocked by auth.

---

## 6. Documented follow-ups (out of scope for this pass)

- Release keystore + `signingConfigs.release` for the Play Store build (currently
  debug-signed per the agreed scope).
- Register the production SHA-1 with the Google Cloud OAuth client so native
  Google Sign-In works on the signed build.
- Legal review + placeholder fill-in (§1) before any public launch.

