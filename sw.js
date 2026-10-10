/* Overload: Service Worker nur für Benachrichtigungen.
   Er speichert nichts zwischen und fängt keine Anfragen ab, die App läuft also wie vorher komplett ohne ihn.
   Der Server schickt nur die Art der Nachricht (train, advice, rest, share, friend, react, test); den Text setzt dieser Worker auf dem Gerät. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const TXT = {
  train: ['Einheit heute', 'In deinem Plan steht heute noch eine Einheit offen. Wenn du schon fertig bist, trag sie kurz ein.'],
  advice: ['Heute wichtig', 'Neu für heute: ein wichtiger Hinweis. Tippe, um ihn zu sehen.'],
  rest: ['Pause vorbei', 'Weiter mit dem nächsten Satz.'],
  test: ['Benachrichtigungen sind an', 'So sieht eine Nachricht von Overload aus.'],
};

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  const k = typeof d.k === 'string' ? d.k : '';
  const nm = String(d.n || 'Jemand').slice(0, 40), em = ['👏', '🔥', '💪', '❤️', '😮'].includes(d.e) ? d.e : '';
  const t = k === 'friend' ? (d.w === 'acc' ? [nm + ' ist jetzt dein Freund', 'Deine Anfrage wurde angenommen. Schau in den Feed.'] : [nm + ' möchte mit dir befreundet sein', 'Öffne Overload, um die Anfrage anzunehmen.'])
    : k === 'react' ? [nm + ' hat reagiert ' + em, 'Auf eine deiner Aktivitäten.'] : k === 'share' ? [(String(d.n || 'Jemand').slice(0, 40)) + ' möchte Daten mit dir teilen', 'Öffne Overload und gib den Code ein, den du bekommen hast.'] : TXT[k] || ['Overload', 'Es gibt etwas Neues.'];
  e.waitUntil(self.registration.showNotification(t[0], {body: t[1], tag: 'ovl-' + (k || 'x'), renotify: true, icon: 'icon-192.png', data: {k}}));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const k = (e.notification.data && e.notification.data.k) || '';
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const c of list) {
      if ('focus' in c) { try { c.postMessage({ovlNotify: k}); } catch (x) {} return c.focus(); }
    }
    return self.clients.openWindow('./?n=' + encodeURIComponent(k));
  })());
});
