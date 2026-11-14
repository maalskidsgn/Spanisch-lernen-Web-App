// Hinweis „Bitte aktualisieren“ für die Store-Apps (14.11.2026).
// Eigener React-Root (main.jsx), damit er unabhängig von App.jsx
// erscheint – auch wenn die App selbst gerade nicht richtig lädt.
// Steuerung über den Server: /api/app/version (server/appVersion.js).
import { useEffect, useState } from 'react'
import { versionPruefen } from './push.js'
import { storeAdresse } from './storeLinks.js'
import { sprache } from './sprache.js'

const TEXT = {
  de: { pflicht: 'Bitte aktualisiere Habloo', kann: 'Neue Version verfügbar', satzP: 'Diese Version wird nicht mehr unterstützt. Mit dem Update funktioniert wieder alles – dein Lernstand bleibt erhalten.', satzK: 'Hol dir die neuesten Funktionen und Verbesserungen.', knopf: 'Jetzt aktualisieren', spaeter: 'Später' },
  en: { pflicht: 'Please update Habloo', kann: 'New version available', satzP: 'This version is no longer supported. Update to get everything working again – your progress is kept.', satzK: 'Get the latest features and improvements.', knopf: 'Update now', spaeter: 'Later' },
}

async function zumStore() {
  const url = storeAdresse()
  if (!url) return
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } catch {
    window.open(url, '_blank')
  }
}

export default function UpdateHinweis() {
  const [info, setInfo] = useState(null)
  useEffect(() => { versionPruefen().then(setInfo) }, [])
  if (!info) return null
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']
  const karte = (
    <div role="dialog" aria-modal={info.pflicht} style={{ background: '#fff', borderRadius: 24, padding: '28px 24px 22px', maxWidth: 360, width: '100%', boxShadow: '0 18px 50px rgba(20,10,40,.25)', textAlign: 'center', fontFamily: 'inherit' }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: '#ff6c00', margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
      </div>
      <h2 style={{ margin: '0 0 8px', fontSize: 21, color: '#000041' }}>{info.pflicht ? T.pflicht : T.kann}</h2>
      <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.5, color: '#6b6478' }}>{info.pflicht ? T.satzP : T.satzK}</p>
      <button type="button" onClick={zumStore} style={{ width: '100%', border: 0, borderRadius: 14, padding: '14px 18px', background: '#ff6c00', color: '#fff', fontWeight: 800, fontSize: 16 }}>{T.knopf}</button>
      {!info.pflicht && <button type="button" onClick={() => setInfo(null)} style={{ marginTop: 10, border: 0, background: 'none', color: '#8a8397', fontSize: 14, padding: 8 }}>{T.spaeter}</button>}
    </div>
  )
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'grid', placeItems: 'center', padding: 20, background: info.pflicht ? 'rgba(20,12,40,.55)' : 'rgba(20,12,40,.35)' }}>
      {karte}
    </div>
  )
}
