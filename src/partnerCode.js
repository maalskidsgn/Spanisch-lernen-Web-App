// Partner-Link: https://…/?code=ANNA20
// Der Code wird gemerkt, bis gekauft wird. So zaehlt er auch, wenn
// jemand erst ein paar Tage spaeter kauft.
import { API_URL } from './api.js'

const SPEICHER = 'partner-code'

export function gemerkterPartnerCode() {
  try {
    return localStorage.getItem(SPEICHER) || ''
  } catch {
    return ''
  }
}

export function merkePartnerLink() {
  try {
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code || !/^[A-Za-z0-9]{3,20}$/.test(code)) return
    localStorage.setItem(SPEICHER, code.toUpperCase())
    fetch(API_URL + '/api/partner/klick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {})
  } catch {
    /* ohne Speicher gilt der Code eben nicht */
  }
}
