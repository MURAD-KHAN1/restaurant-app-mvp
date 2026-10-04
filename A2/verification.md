# Assignment 2 Question 1 ? Verification

Date: 2 October 2026. Deliverable scope: SRS update and API design only.

## Preservation

All 95 pre-existing project files captured before creation were compared with SHA-256 and remain byte-identical. No existing file was modified or deleted. This includes A1/SRS.pdf, all five A1 UML images, README.md, src, package files and the pre-existing untracked server folder. No backend runtime code was added for Questions 2?7.

Original A1/SRS.pdf SHA-256 before and after:

c1f8bd7a7c2cb8379aefb302fec04edc0ad3d7c6709edc1b22dbaa4f807c119f

## Requirement Checklist

- [x] A2/SRS_v2.pdf exists and parses successfully; 27 A4 pages.
- [x] A1 section numbering 1?7, FR-01?FR-35 and Appendix A retained; section 8 added.
- [x] Section 1.2 includes Node.js, Express, REST APIs, MongoDB, centralized data, authentication, server validation and persistent menu/orders/reservations.
- [x] Backend/database removed from exclusions; real payments and push notifications remain excluded.
- [x] All 12 requested A1 problems have individual A2 server/database solutions.
- [x] Section 1.3 includes all ten requested new terms and original definitions.
- [x] Section 5 documents Users, MenuItems, Tables, Reservations and Orders.
- [x] Every collection has field types, required/unique/default/enum/minimum rules and ObjectId relationships.
- [x] Required email/password/role, menu price/availability, table uniqueness/seats, booking fields/status/timestamps and order fields/status/timestamps covered.
- [x] Server totals use MongoDB prices; unavailable items cannot be ordered.
- [x] Pending ? Preparing ? Ready ? Served; cancellation only while Pending.
- [x] Section 8 table contains all 17 requested endpoints and Method/Endpoint/Access/Request Body/Response columns.
- [x] JWT authorization, role/ownership restrictions, errors and health contract documented.
- [x] Menu category=Mains and search=burger documented; search is case-insensitive.
- [x] Required sequence PNG is valid and visually reviewed: exactly React Native App, Express Server and MongoDB lifelines; JWT POST, receive/query/prices/availability/validate/total/save/saved response/201/confirmation flow.
- [x] Required deployment PNG is valid and visually reviewed: Customer/Manager Phone, React Native/Expo, laptop Node.js/Express/5000, MongoDB restaurant_app; HTTP/JSON and Mongoose bidirectional connectors.
- [x] Both requested diagrams embedded in the PDF, alongside three clearly labeled A1 baseline figures (five image pages total).
- [x] No application changes, database provisioning or backend implementation performed.

## Checks

Content assertions passed for required sections, 35 FR IDs, 12 problem/solution rows, ten new terms, all 17 endpoint paths, embedded images and PNG validity. Diagram spacing was visually checked and corrected. All 27 final PDF pages were rendered with Windows PDF rendering for layout review; key pages were inspected at full resolution. Numbered stories and appendix table widths were corrected. PDF text-position checks found no text outside page boundaries; fonts are embedded, bookmarks and a page-numbered contents list are present.

Lint: passed (exit 0), using local ESLint against App.js, index.js and src, with --no-cache.

Strict JavaScript typecheck: attempted with local TypeScript --noEmit --allowJs --checkJs --jsx react-jsx --skipLibCheck --moduleResolution bundler --module esnext --target es2020 against App.js/index.js/all src JS. It returned exit 2 with 165 diagnostic lines in the unchanged A1 source. Examples: inferred required onPressIn/onPressOut props in Motion components, Animated JSX signatures, icon-name types and missing image-module declarations. The project has no tsconfig.json. These pre-existing issues were not changed because the user explicitly requested A1 preservation; they do not prevent the documentation-only deliverables.

## Files Created

- A2/SRS_v2.pdf
- A2/SRS_v2.md (editable SRS source)
- A2/build_documents.py (documentation/diagram builder; not backend code)
- A2/diagrams/order-sequence-diagram.png
- A2/diagrams/deployment-diagram.png
- A2/verification.md (this report)

Files modified: none of the pre-existing project files.

To rebuild on Windows: install reportlab and pillow for Python, then run python A2/build_documents.py. The builder uses Windows Arial fonts and only writes the A2 PDF/diagrams. Technical design references are linked in SRS Appendix B.3.
