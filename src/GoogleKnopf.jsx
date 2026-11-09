import { useEffect, useRef, useState } from 'react'
import { zeigeGoogleKnopf } from './googleKnopf.js'
import { sprache } from './sprache.js'

/** Googles eigener Anmeldeknopf (Browser). Fällt bei Fehlern auf den alten Weg zurück. */
export default function GoogleKnopf({ onErfolg, ersatz }) {
  const ref = useRef(null)
  const [kaputt, setKaputt] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    zeigeGoogleKnopf(ref.current, { sprache: sprache() === 'en' ? 'en' : 'de', onErfolg, onFehler: () => setKaputt(true) }).catch(() => setKaputt(true))
  }, [])
  if (kaputt) return ersatz ?? null
  return <div ref={ref} className="google-knopf" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
}
