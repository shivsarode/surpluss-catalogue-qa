# Findings

## F-001: Staff Can Publish a Draft Catalogue

Severity: High
Type: Authorization / Security

Description:
A Staff user can publish a draft catalogue through the catalogue update API.

Reproduction:
1. Login as Staff.
2. Send PATCH request to `/api/admin/catalogues/{id}`.
3. Set `status` to `published`.
4. The API returns 200 and publishes the catalogue.

Expected:
Only Admin users should be able to publish catalogues.

Impact:
A Staff user can expose confidential draft catalogue data to buyers.

Automated Test:
`tests/staff-publish.test.ts` fails because the API returns 200 instead of 403.


## F-002: Catalogue Expiry Logic Is Reversed

Severity: Medium
Type: Logic Bug

Description:
The `effectiveStatus()` function incorrectly handles expiry dates.

Reproduction:
- Future expiry date returns `expired`.
- Past expiry date returns `published`.

Expected:
Future expiry → published
Past expiry → expired

Impact:
Catalogue lifecycle status can be reported incorrectly.

Automated Test:
`tests/catalogue-lifecycle.test.ts` has 2 failing tests.


## F-003: Draft Catalogue Exposed Through Public Search API

Severity: High
Type: Access Control / Security

Description:
The public catalogue search API does not verify whether the catalogue is published or expired.

Reproduction:
1. Use a draft catalogue slug.
2. Call `/api/catalogues/{slug}/search`.
3. The API returns catalogue product data.

Expected:
Draft catalogues should not be accessible publicly.

Impact:
Confidential draft catalogue information may be exposed.

Automated Test:
`tests/draft-catalogue-access.test.ts` fails because the API returns 200.


## F-004: Staff Can Delete a Catalogue

Severity: High
Type: Authorization / Security

Description:
The `deleteCatalogue` server action checks authentication but does not verify Admin role.

Reproduction:
1. Login as Staff.
2. Call the `deleteCatalogue` server action.
3. The catalogue deletion succeeds.

Expected:
Only Admin users should be able to delete catalogues.

Impact:
A Staff user can delete catalogue data without Admin permission.

Automated Test:
`tests/server-actions-access.test.ts` fails because deletion succeeds.


## F-005: Listing ID Tampering Allows Cross-Catalogue Modification

Severity: High
Type: Authorization / Security

Description:
The listing update API validates the catalogue ID and listing ID separately but does not verify that the listing belongs to that catalogue.

Reproduction:
1. Use Catalogue A ID.
2. Use a Listing B ID belonging to another catalogue.
3. Send a PATCH request.
4. The listing update succeeds.

Expected:
A listing should only be modified within its own catalogue.

Impact:
An authorized user may modify data belonging to another catalogue.

Automated Test:
`tests/id-tampering.test.ts` fails because the API returns 200.


## Summary

Total findings: 5

- High severity: 4
- Medium severity: 1
- Security / authorization issues: 4
- Logic issue: 1