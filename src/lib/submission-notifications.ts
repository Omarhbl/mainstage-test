export type SubmissionNotification = { id: string; kind: "guestlist" | "contact"; title: string; detail: string; receivedAt: string; href: string };
export type SubmissionNotifications = { items: SubmissionNotification[]; guestlistCount: number; contactCount: number; checkedAt: string };

export function summarizeSubmissions(
  guestlist: { email: string; subscribedAt: string }[],
  contacts: { email: string; subject: string; receivedAt: string }[],
  seenAt: string,
  checkedAt: string,
): SubmissionNotifications {
  const cutoff = Date.parse(seenAt) || 0;
  const guestItems: SubmissionNotification[] = guestlist.filter(x => Date.parse(x.subscribedAt) > cutoff).map(x => ({ id: `guestlist:${x.email}:${x.subscribedAt}`, kind: "guestlist", title: "New guestlist signup", detail: x.email, receivedAt: x.subscribedAt, href: "/backoffice/settings/guestlist" }));
  const contactItems: SubmissionNotification[] = contacts.filter(x => Date.parse(x.receivedAt) > cutoff).map(x => ({ id: `contact:${x.email}:${x.receivedAt}:${x.subject}`, kind: "contact", title: "New contact message", detail: x.subject, receivedAt: x.receivedAt, href: "/backoffice/settings/contact-inbox" }));
  return { guestlistCount: guestItems.length, contactCount: contactItems.length, checkedAt, items: [...guestItems, ...contactItems].sort((a,b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt)).slice(0, 6) };
}
