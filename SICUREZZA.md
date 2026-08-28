# Sicurezza del sito

Nota su cos'è questo sito, perché cambia tutto: sono **pagine statiche** su
Vercel più **Supabase** come database. Non c'è un server nostro che riceve le
richieste, quindi non esiste un punto dove mettere un "rate limiter" fatto da
noi. Tutto quello che conta davvero succede in due posti: le **intestazioni
HTTP** (Vercel) e le **policy RLS** (Supabase).

---

## Fatto: intestazioni di sicurezza (`vercel.json`)

| Intestazione | A cosa serve |
|---|---|
| `Strict-Transport-Security` | Il browser rifiuta di parlare col sito in HTTP: niente downgrade, niente intercettazioni sul wifi del locale. |
| `X-Content-Type-Options: nosniff` | Il browser non "indovina" il tipo di un file. Blocca il trucco di far passare uno script per un'immagine. |
| `X-Frame-Options: DENY` | Nessuno può mettere il sito dentro un iframe sul proprio dominio per rubare i click (clickjacking). |
| `Referrer-Policy` | Uscendo dal sito non regaliamo l'indirizzo completo della pagina di partenza. |
| `Permissions-Policy` | Fotocamera, microfono, posizione e pagamenti restano spenti: se un giorno finisse in pagina uno script ostile, non può chiederli. |
| `Cross-Origin-Opener-Policy` | Le finestre aperte con "apri in una nuova scheda" non possono più toccare la nostra. |
| `X-Robots-Tag` su `/admin` | Il pannello non finisce su Google. |
| `Cache-Control: no-store` su `/admin` | Il pannello non resta nella cache del browser dopo il logout. |

### La CSP è volutamente in "solo segnalazione"

`Content-Security-Policy-Report-Only` dice al browser di **segnalare** cosa
bloccherebbe, senza bloccare niente. È di proposito: il sito carica roba da
otto domini diversi (Framer, Google Fonts, Drive, Maps, jsDelivr, Supabase,
Liveticket) e una CSP sbagliata manda in bianco mezza pagina.

**Come passare a bloccare davvero**, quando siamo tranquilli:

1. Naviga il sito (home, eventi, galleria, contatti, locale, ristorante,
   admin) con la console del browser aperta.
2. Se non compare nessun avviso `Content Security Policy`, rinomina la chiave
   in `vercel.json` da `Content-Security-Policy-Report-Only` a
   `Content-Security-Policy`.
3. Se compaiono avvisi, aggiungi il dominio segnalato alla direttiva giusta
   e ricontrolla.

Va detto: la CSP qui protegge meno del normale, perché il sito ha centinaia di
script e gestori scritti dentro l'HTML e serve `'unsafe-inline'`. Resta utile
per `connect-src` e `frame-ancestors`, che chiudono l'esfiltrazione dei dati
verso domini estranei.

---

## Come stanno le cose su Supabase

Verificato leggendo le policy vere, non la documentazione.

**Quello che va bene:**

- La chiave `anon` nel codice **è pubblica per progetto**, è normale che si
  veda. Non è una password: quello che può fare lo decidono le policy.
- Tabella `events`: chi non è autenticato può **solo leggere** gli eventi
  pubblicati. Scrittura e cancellazione richiedono l'accesso.
- Bucket `event-images`: lettura pubblica, **caricamento e cancellazione solo
  da autenticati**. Nessuno può caricare file arbitrari.
- Il login non ha password nel codice: usa la vera autenticazione Supabase,
  che ha già un limite ai tentativi lato server. Un "blocco dopo 5 tentativi"
  scritto in JavaScript sarebbe solo scenografia, si aggira con un `curl`.
- Il modulo contatti apre la mail del visitatore, non manda niente a un
  server nostro: non c'è un endpoint da inondare.

**Da sistemare, in ordine di importanza:**

### 1. ~~Le policy dicevano "chiunque sia autenticato"~~ — CHIUSA

**Era una falla vera, non teorica.** Verificato che `disable_signup` fosse
`false`: con la chiave pubblica presente nel sorgente della pagina chiunque
poteva registrarsi da solo, diventare `authenticated`, e da lì riscrivere o
cancellare tutti gli eventi e caricare file nel bucket. Il pannello con
username e password non c'entrava niente: quella è una schermata, il cancello
vero sono le policy.

Sistemata con la migrazione `restringi_scrittura_agli_admin`. Ora esiste una
tabella `public.admins` con dentro gli account autorizzati, e le policy
chiedono `public.is_admin()` invece di "sei autenticato". La tabella non ha
policy proprie, quindi dal browser non è né leggibile né scrivibile: si tocca
solo dalla dashboard.

Registrarsi ora non serve a niente: un account nuovo non può leggere le
statistiche né toccare gli eventi.

**Verificato simulando i tre casi:**

| Caso | Esito |
|---|---|
| Admin: riconosciuto | sì |
| Admin: scrive sugli eventi | sì |
| Admin: legge le statistiche | 723 righe |
| Utente registrato qualsiasi: riconosciuto come admin | no |
| Utente registrato qualsiasi: INSERT sugli eventi | respinta |
| Utente registrato qualsiasi: UPDATE sugli eventi | 0 righe modificate |
| Utente registrato qualsiasi: legge le statistiche | 0 righe |
| Visitatore non registrato: vede gli eventi | 12 |
| Visitatore non registrato: INSERT sugli eventi | respinta |

**Per aggiungere un secondo amministratore** (dall'editor SQL della dashboard):

```sql
insert into public.admins (user_id, nota)
select id, 'chi e' from auth.users where email = 'INDIRIZZO@ESEMPIO.IT';
```

**Per tornare indietro**, se qualcosa non tornasse:

```sql
drop policy if exists "Admin full access events" on public.events;
create policy "Admin full access events" on public.events
  for all to authenticated
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

Spegnere *"Allow new users to sign up"* resta comunque consigliato: non è più
una questione di sicurezza, ma evita che qualcuno riempia `auth.users` di
registrazioni inutili. **Fatto il 28/08/2026.** Da ora un amministratore
nuovo non può registrarsi da solo: va creato dalla dashboard
(**Authentication → Users → Add user**) e poi aggiunto alla tabella `admins`
con la query qui sopra.

### 2. Chiunque può riempire la tabella `analytics`

La policy di inserimento è `with check (true)`: chiunque abbia la chiave
pubblica (cioè chiunque legga il sorgente della pagina) può scriverci dentro
quanto vuole. Oggi sono 716 righe per 168 kB, nessun abuso, ma non c'è niente
che lo impedisca.

Non si può limitare per indirizzo IP senza salvarlo, e salvarlo sarebbe un
dato personale da dichiarare nella privacy policy. La strada pulita è **tenere
la tabella piccola** e mettere un tetto alla frequenza:

```sql
-- 1. tetto per sessione: max 60 visite al minuto dalla stessa sessione
create or replace function public.analytics_limite()
returns trigger language plpgsql security definer as $$
begin
  if (select count(*) from public.analytics
      where session_id = new.session_id
        and visited_at > now() - interval '1 minute') >= 60 then
    raise exception 'troppe richieste';
  end if;
  return new;
end $$;

drop trigger if exists analytics_limite_trg on public.analytics;
create trigger analytics_limite_trg before insert on public.analytics
  for each row execute function public.analytics_limite();

create index if not exists analytics_sessione_tempo
  on public.analytics (session_id, visited_at desc);

-- 2. conservazione: si buttano i dati piu' vecchi di 90 giorni
--    (da lanciare a mano, oppure con pg_cron se lo attiviamo)
delete from public.analytics where visited_at < now() - interval '90 days';
```

Da solo il tetto per sessione non ferma chi cambia `session_id` a ogni
richiesta, ma insieme alla pulizia periodica toglie il danno: la tabella non
cresce all'infinito.

### 3. Protezione password compromesse: non si può, siamo sul piano gratuito

Il controllo di Supabase la segnala e continuerà a segnalarla, ma
*"Prevent use of leaked passwords"* (il confronto con l'archivio
HaveIBeenPwned) **esiste solo dal piano Pro in su**. Sul piano gratuito
l'interruttore non compare proprio: non è nascosto, non c'è. Quella riga
dell'avviso si può ignorare finché restiamo su Free.

Quello che si può fare lo stesso, tutto in **Authentication → Sign In /
Providers → Email** (sta dentro le impostazioni del provider Email, non nella
pagina generale):

- **Minimum password length**: almeno 12. Sotto gli 8 è da evitare.
- **Password Requirements**: chiedere cifre, minuscole, maiuscole e simboli.

E le due cose che contano davvero, che non costano niente:

- **Password lunga e casuale** presa da un gestore di password per l'account
  admin. Una password generata a caso non finisce negli archivi delle
  violazioni: è esattamente il problema che il controllo Pro andrebbe a
  coprire.
- **MFA sull'account Supabase** (Account Settings → Multi-Factor
  Authentication). Questa è gratuita ed è l'unica difesa che regge anche se
  la password scappa.

### 4. Due avvisi su `is_admin()`: si possono ignorare

Il controllo segnala che `public.is_admin()` è eseguibile da chiunque, anche
senza essere registrati. **Non è un buco.** Quella funzione risponde solo
*"chi sta chiedendo è un amministratore?"*: chiamandola da fuori si ottiene
`false` e nient'altro, nessun dato esce.

E soprattutto non va "sistemata": togliendole il permesso di esecuzione si
romperebbero le policy che la usano, cioè il pannello admin smetterebbe di
funzionare.

### 5. Lo script esterno non è bloccato a una versione

Tutte le pagine caricano `@supabase/supabase-js@2` da jsDelivr. Quel `@2` vuol
dire **l'ultima 2.x, qualunque sia**: se un giorno quel pacchetto venisse
compromesso, il codice ostile girerebbe sulle nostre pagine con accesso alla
sessione admin. Da fare:

```bash
# scegliere una versione precisa e calcolarne l'impronta
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0 \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

poi in tutte le pagine:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0"
        integrity="sha384-QUI-L-IMPRONTA"
        crossorigin="anonymous"></script>
```

Così il browser rifiuta il file se non corrisponde. Non l'ho fatto da qui
perché jsDelivr è irraggiungibile dall'ambiente in cui lavoro e tirare a
indovinare la versione avrebbe rotto il sito.

---

## Rate limiting e blocco IP: come stanno le cose davvero

Domanda giusta, ma su un sito statico la risposta è meno scontata di quanto
sembri.

- **Login**: già coperto. Supabase limita i tentativi lato server, che è
  l'unico posto dove un limite non si aggira.
- **Lettura degli eventi**: è contenuto pubblico. Limitarla non protegge
  niente e romperebbe il sito ai visitatori veri.
- **Scrittura**: già chiusa dalle policy, non serve un limite.
- **Analytics**: l'unico punto davvero aperto, si chiude nel database (sopra).
- **Blocco IP e regole anti-bot**: su Vercel si fanno col **Firewall**, che è
  incluso nei piani a pagamento. Il piano Hobby ha solo la protezione DDoS di
  base, che c'è già e non si configura. L'alternativa sarebbe mettere una
  Edge Function davanti al sito, ma vorrebbe dire trasformare un sito statico
  in un progetto con build: sproporzionato per quello che ci guadagniamo.

In pratica: le due cose che spostano l'ago sono **legare le policy all'account
admin** e **spegnere la registrazione libera**. Il resto è rifinitura.
