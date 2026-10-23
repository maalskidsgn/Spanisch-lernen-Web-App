/**
 * Baut die Adresse für eine Wort-Übersetzung – mit dem Satz, in dem
 * das Wort steht. Ohne Satz rät die KI bei mehrdeutigen Wörtern
 * ("de", "cultivo", "banco"); mit Satz trifft sie die gemeinte
 * Bedeutung. Kostet pro Anfrage ein paar Dutzend Tokens mehr.
 */
export function uebersetzungsAdresse(apiUrl, wort, umfeld) {
  let adresse = apiUrl + '/api/translate?q=' + encodeURIComponent(wort)
  const satz = satzUm(umfeld, wort)
  if (satz) adresse += '&satz=' + encodeURIComponent(satz)
  return adresse
}

/** Der Satz aus `umfeld`, in dem `wort` vorkommt (höchstens 300 Zeichen). */
export function satzUm(umfeld, wort) {
  if (!umfeld) return ''
  const saetze = umfeld.split(/(?<=[.!?…])\s+/)
  const klein = wort.toLowerCase()
  const treffer = saetze.find((s) => s.toLowerCase().includes(klein)) || umfeld
  return treffer.trim().slice(0, 300)
}
