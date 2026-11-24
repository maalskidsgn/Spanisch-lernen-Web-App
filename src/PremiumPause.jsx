// Die Einblendung der Premium-Pause (siehe pause.js): ruhig, ein Element
// zur Zeit – Pokal, Überschrift, EIN Vorteil im Wechsel, zwei Knöpfe.
// „Weiter“ wird nach den eingestellten Sekunden frei.
import { useEffect, useState } from 'react'
import { KASSEN_TEXTE } from './Bezahlen.jsx'
import BILDER from './kassenBilder.js'
import { sprache } from './sprache.js'
import { pauseSekunden } from './pause.js'

const TX = {
  de: { pause: 'Kurze Pause', titel: 'Lerne ohne Unterbrechung', satz: 'Mit Premium gibt es keine Pausen – und alles ist freigeschaltet.', premium: 'Premium', gratis: 'Gratis', ansehen: 'Premium ansehen', weiterIn: (n) => `Weiter in ${n} s`, weiter: 'Weiter lernen' },
  en: { pause: 'Short break', titel: 'Learn without interruptions', satz: 'With Premium there are no breaks – and everything is unlocked.', premium: 'Premium', gratis: 'Free', ansehen: 'See Premium', weiterIn: (n) => `Continue in ${n}s`, weiter: 'Keep learning' },
}

/**
 * @param {() => void} props.onWeiter – weiter zur Lektion
 * @param {() => void} props.onKasse – zur Kasse
 */
export default function PremiumPause({ onWeiter, onKasse }) {
  const sp = sprache() === 'en' ? 'en' : 'de'
  const tx = TX[sp]
  const KT = KASSEN_TEXTE[sp]
  const vorteile = KT.vorteile.filter((v) => !/teilen|share/i.test(v[2]))
  const gesamt = pauseSekunden()
  const [rest, setRest] = useState(gesamt)
  const [nr, setNr] = useState(0)

  useEffect(() => {
    document.body.classList.add('lektion-laeuft')
    const uhr = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000)
    const wechsel = setInterval(() => setNr((n) => (n + 1) % vorteile.length), 2500)
    return () => { clearInterval(uhr); clearInterval(wechsel); document.body.classList.remove('lektion-laeuft') }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [icon, titel, prem, gratis] = vorteile[nr % vorteile.length]
  const frei = rest === 0
  return (
    <div className="pp" role="dialog" aria-modal="true" aria-label={tx.titel}>
      <div className="pp-innen">
        <div className="pp-kopf">
          <span className="pp-marke">{tx.pause}</span>
          <span className={'pp-uhr' + (frei ? ' frei' : '')} aria-hidden="true">
            <svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" className="pp-uhr-grund" /><circle cx="18" cy="18" r="15" className="pp-uhr-lauf" style={{ strokeDashoffset: 94.2 * (rest / gesamt) }} /></svg>
            <b>{frei ? '✓' : rest}</b>
          </span>
        </div>

        <div className="pp-mitte">
          <div className="ka-pokal pp-pokal" aria-hidden="true" dangerouslySetInnerHTML={{ __html: BILDER.pokal + BILDER.buehne }} />
          <div className="pp-text">
            <h1>{tx.titel}</h1>
            <p>{tx.satz}</p>
          </div>
          <div className="pp-karte" key={nr}>
            <span className="ka-bild pp-bild" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<span class="ka-halo"></span>' + BILDER.icons[icon] + BILDER.trommel1 }} />
            <span className="pp-vorteil">
              <b>{titel}</b>
              <span className="pp-prem"><i dangerouslySetInnerHTML={{ __html: BILDER.krone }} />{prem}</span>
              <small>{tx.gratis}: {gratis}</small>
            </span>
          </div>
          <div className="pp-punkte" aria-hidden="true">{vorteile.map((v, i) => <span key={i} className={i === nr ? 'an' : ''} />)}</div>
        </div>

        <div className="pp-fuss">
          <button className="pp-knopf" onClick={onKasse}>{tx.ansehen}</button>
          <button className="pp-weiter" disabled={!frei} onClick={onWeiter}>{frei ? tx.weiter : tx.weiterIn(rest)}</button>
        </div>
      </div>
    </div>
  )
}
