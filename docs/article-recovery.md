# Article draft recovery

New and existing article editors keep automatic browser-local recovery copies, scoped by signed-in user and article ID. Separate editing sessions use separate recovery tokens so one tab does not overwrite another tab’s backup. Copies are never written to a public feed or published automatically.

Text, categories, SEO values, media URLs and crop positions are synchronously copied to localStorage on input/change. Rich-text formatting and React-updated hidden fields are observed too. Selected cover/hero/bottom image files are saved asynchronously in IndexedDB. Status text distinguishes successful recovery saves from quota/storage/file-backup failures. Inline images already uploaded remain referenced in the recovered body.

Opening the same article editor (or New article for an unfinished new story) offers Restore my work / Discard recovery copy with its timestamp. Restore fills the fields, sanitizes body HTML before inserting it, updates the rich-text and framing component states, and restores selected files where supported. If the database article changed since the copy, the prompt warns before replacement. The user still manually saves or publishes.

Dirty forms use a native beforeunload warning on refresh/close and an accessible in-app confirmation for link navigation. Recovery is flushed on pagehide/visibility changes. Browser warnings require browser support/user interaction and cannot intercept power loss; the already-written local copy protects that case. Navigation back within the SPA may not display a browser dialog, but the recovery copy is retained.

A UUID token travels with a manual save. Only the successful server-save redirect returns it as savedDraft. The matching local copy is then removed; validation, upload or server errors retain it. Other sessions’ backups are not removed. Input is blocked while a manual save is pending to avoid losing changes typed after submission.

Recovery is specific to the same browser profile and signed-in account. Clearing site/browser data, private browsing restrictions, eviction or a full disk can remove/prevent local copies. Continue using Save article for the shared server copy. This feature does not create cloud autosaves or recover text lost before deployment.

Verification: production webpack/TypeScript build, targeted ESLint, draft validation/signature/storage-error tests, and a local-only browser fixture using the actual editor components. Browser checks covered title/body/SEO/categories/crop restoration, selected cover File recovery, the leave/stay dialog, and backup cleanup after a simulated successful save. The fixture bypassed authentication only in an isolated temporary checkout and did not insert/publish articles; it is not included in the release. Production editor authorization remains unchanged.
