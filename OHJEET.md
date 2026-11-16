# Sivuston päivittäminen – ohje seuran jäsenille

Sivustoa päivitetään selaimella sisällönhallinnan (CMS) kautta. Koodia ei tarvitse osata.

## Kirjautuminen

1. Mene osoitteeseen **https://hemajoensuu.fi/admin/**.
2. Valitse **Kirjaudu GitHub-tunnuksella**.
   - Jos sinulla ei ole tunnusta, luo ilmainen tunnus osoitteessa github.com.
   - Pyydä sitten ylläpitäjää lisäämään sinut sivuston muokkaajaksi (ohje ylläpitäjälle on tämän sivun lopussa).

Sisällönhallinta on kokonaan suomeksi. Oikeassa alakulmassa oleva punainen **?**-painike avaa tämän ohjeen uuteen välilehteen.

### Näin sisällönhallinta toimii

- Vasemmalla ovat **osiot**: Uutiset, Sivut, Omat sivut, Asetukset ja Ylläpito.
- Kun avaat jonkin sisällön, vasemmalla on lomake ja oikealla **esikatselu**. Esikatselu näyttää, miltä sisältö näyttää sivustolla, ja päivittyy sitä mukaa kuin kirjoitat.
- Jokaisen kentän alla on lyhyt ohje ja esimerkki. Kentät, joissa lukee *(valinnainen)*, voi jättää tyhjiksi.

## Uuden uutisen lisääminen

1. Valitse vasemmalta **Uutiset** ja paina **＋ Uusi uutinen**.
2. Täytä kentät:
   - **Otsikko**. Päivämääräksi tulee valmiiksi tämä päivä.
   - **Kirjoittaja** ja **Lyhyt tiivistelmä**. Tiivistelmä näkyy uutiskortissa Ajankohtaista-sivulla.
   - **Kortin kuva**, joka näkyy uutiskortissa. Kuva on vapaaehtoinen.
   - **Teksti**, eli itse uutinen. Työkalurivillä voit lihavoida ja kursivoida tekstiä, lisätä linkkejä, väliotsikoita ja luetteloita sekä lisätä kuvia.
   - Tarvittaessa **artikkelin kuva**, esimerkiksi kurssin mainosjuliste. Muista täyttää myös kuvan kuvaus.
3. Tarkista esikatselusta, miltä uutinen ja sen uutiskortti näyttävät.
4. Paina ylhäältä **Tallenna**. Uutinen tallentuu luonnokseksi, eikä se vielä näy sivustolla.
5. Kun uutinen on valmis, vaihda tilaksi **Valmis**.
6. Ylläpitäjä julkaisee uutisen. Jos sinulla on julkaisuoikeus, voit itse valita **Julkaise → Julkaise nyt**.

Sivusto päivittyy noin 1–2 minuutin kuluttua julkaisusta.

Uutislistassa luonnokset on merkitty sanalla **LUONNOS**. Kohdasta **Suodata → Luonnokset** näet pelkät luonnokset, ja kohdasta **Ryhmittele → Vuosi** uutiset ryhmiteltyinä vuosittain.

### Luonnos ja ajastettu julkaisu

- **Luonnos – ei näy sivustolla**: kun ruutu on valittuna, uutinen pysyy piilossa myös julkaisun jälkeen. Poista valinta, kun uutinen saa näkyä.
- **Julkaise automaattisesti**: valitse päivä ja kellonaika, jolloin uutinen tulee näkyviin. Sivusto tarkistaa ajastetut uutiset kerran tunnissa, joten uutinen näkyy viimeistään tunnin kuluttua valitusta ajasta. Muista silti julkaista uutinen (**Julkaise**) etukäteen.

Nämä kaksi kenttää ovat lomakkeen lopussa.

## Uuden sivun luominen (Omat sivut)

1. Valitse **Omat sivut** ja paina **＋ Uusi sivu**.
2. Kirjoita **Sivun nimi** ja valitse **Sivun tyyli**: *Tavallinen* (tumma tausta) tai *Iso taustakuva*.
3. Lisää osat painikkeella **Lisää osio**. Osioita voi järjestää vetämällä, ja esikatselu näyttää ne heti. Vaihtoehdot ovat:
   - Teksti
   - Kuva ja teksti
   - Painikkeet
   - Kuvagalleria
   - Kysymykset ja vastaukset
   - Tietolaatikko
4. Tallenna ja julkaise kuten uutinen. Sivun osoite on otsikon mukainen, esimerkiksi otsikosta ”Kesäleiri 2027” tulee osoite `/kesaleiri-2027/`.
5. Lisää sivu valikkoon kohdassa **Asetukset → Päävalikko**.

## Sivujen muokkaaminen

Valitse **Sivut** ja sen jälkeen sivu, jota haluat muokata. Lomakkeessa ovat ensin sivun tekstit ja sen jälkeen ulkoasu (taustakuva, tummennus ja otsikon väri). Lopussa ovat hakukoneille näkyvät tiedot.

- **Etusivu**: esittelyteksti, painikkeet ja harjoitusaikojen tietolaatikko. Muista päivittää tietolaatikko, jos harjoitusajat muuttuvat.
- **Tietoa lajista**
- **Ota yhteyttä** (valikossa ”Yhteystiedot”): harjoitusajat, harjoituspaikat ja sähköposti.
- **Usein kysyttyä**: kysymyksiä voi lisätä, poistaa ja järjestää uudelleen vetämällä.
- **Galleria**: kuvia voi lisätä, poistaa ja järjestää uudelleen.
- **Ajankohtaista**: uutisten listaussivun otsikko ja taustakuva.

**Asetukset**-kohdasta voi muuttaa:

- **Sivuston tiedot**: nimi, sähköposti, somelinkit ja alatunniste.
- **Päävalikko**: valikon kohdat ja niiden järjestys.

**Ylläpito (vain ylläpitäjälle)** sisältää tekniset asetukset. Virheellinen muutos niissä voi muuttaa koko sivuston ulkoasua tai osoitetta. Jokainen muokkaaja pystyy teknisesti avaamaan ne, mutta ne on erotettu omaksi osiokseen, ettei niitä muuteta vahingossa.

- **Värit**: otsikoiden, linkkien, painikkeiden ja taustojen värit. Jos valittu väri tekisi tekstistä vaikealukuisen, sivusto käyttää sen sijaan oletusväriä.
- **Uudelleenohjaukset**: vanha osoite ohjataan uuteen, esimerkiksi kun sivu siirretään. Vanha osoite ei saa olla minkään olemassa olevan sivun osoite.
- **Verkkotunnus**: sivuston oma osoite (hemajoensuu.fi). Muuta vain, jos verkkotunnuksen asetukset on jo tehty.

## Kuvat

- Lisää kuvat kuvakenttien kautta: **Valitse kuva → Lataa uusi kuva**. Jo ladatun kuvan voi valita listasta.
- Sivusto pienentää ja pakkaa kuvat automaattisesti. Käytä kuitenkin mieluiten alle 3 Mt:n kuvia.
- Taustakuvien kannattaa olla tummia tai tummennettuja, jotta valkoinen teksti erottuu niiden päältä.
- Kirjoita jokaiselle kuvalle lyhyt **kuvaus**, esimerkiksi ”Kaksi miekkailijaa harjoittelee pitkämiekoilla”. Ruudunlukijat lukevat kuvauksen ääneen näkövammaisille käyttäjille, ja kuvaus auttaa myös hakukoneita.
- Varmista, että sinulla on lupa käyttää kuvaa, ja merkitse kuvaaja kuvatekstiin.

## Varmuuskopiointi ja palautus

Varmuuskopioita on kahta tyyppiä:

- **Sisältö**: sivut, uutiset, omat sivut, asetukset, värit ja kuvat. Tätä tarvitaan yleensä.
- **Koko sivusto**: sisällön lisäksi myös sivuston ohjelmakoodi.

Sisällöstä tehdään varmuuskopio automaattisesti joka sunnuntaiyö. GitHub säilyttää varmuuskopiot 90 päivää.

### Varmuuskopion tekeminen ja lataaminen

1. Avaa sivuston repositorio GitHubissa: **github.com/joensuuhms/hemajoensuu**.
2. Valitse **Actions** ja vasemmalta **Varmuuskopio**.
3. Paina **Run workflow**, valitse *sisalto* tai *koko* ja paina vihreää **Run workflow** -painiketta.
4. Odota noin minuutti ja avaa valmistunut ajo.
5. Lataa tiedosto kohdasta **Artifacts**. GitHub antaa sen zip-tiedoston sisällä: pura ladattu tiedosto, niin saat varsinaisen varmuuskopion (`hemajoensuu-…zip`).
6. Säilytä varmuuskopio turvallisessa paikassa.

### Palauttaminen

Palautus ei muuta sivustoa heti. Ensin syntyy **pull request**, jossa näkyy tarkasti, mitkä tiedostot lisätään, muutetaan tai poistetaan. Sivusto muuttuu vasta, kun pull request yhdistetään (**Merge**). Palautuksen voi myöhemmin perua painamalla **Revert**.

Huom! Palautus palauttaa sisällön täsmälleen varmuuskopion mukaiseksi. Varmuuskopion jälkeen lisätyt uutiset ja sivut poistuvat.

**Tapa 1 – omalta koneelta tallennetusta tiedostosta:**

1. Avaa repositorio GitHubissa ja valitse **Add file → Upload files**.
2. Kirjoita tiedoston nimen eteen kansio `palautus/`, tai luo ensin kansio `palautus`. Lisää varmuuskopiotiedosto (`hemajoensuu-…zip`) ja paina **Commit changes**.
3. Avaa **Actions → Palautus** ja odota, että ajo valmistuu.
4. Avaa **Pull requests**, tarkista muutokset ja paina **Merge pull request**.

**Tapa 2 – GitHubiin tallennetusta varmuuskopiosta:**

1. Avaa haluamasi **Varmuuskopio**-ajo ja kopioi sen numero. Numero näkyy ajon yhteenvedossa ja selaimen osoiterivillä (`…/actions/runs/123456789`).
2. Valitse **Actions → Palautus → Run workflow**, liitä numero kenttään ja paina **Run workflow**.
3. Tarkista ja yhdistä syntynyt pull request.

Jos varmuuskopiotiedosto on vioittunut tai muokattu, palautus pysähtyy virheeseen eikä mitään muuteta.

## Ylläpitäjälle: muokkaajien lisääminen ja poistaminen

Sivustoa voi muokata jokainen, jolla on kirjoitusoikeus GitHub-repositorioon `joensuuhms/hemajoensuu`. Oikeuksia voi muuttaa vain repositorion omistaja eli joensuuhms-tunnus.

### Muokkaajan lisääminen

1. Pyydä uutta muokkaajaa luomaan ilmainen tunnus osoitteessa **github.com** ja kertomaan sinulle käyttäjätunnuksensa.
2. Kirjaudu GitHubiin joensuuhms-tunnuksella ja avaa **github.com/joensuuhms/hemajoensuu**.
3. Valitse ylävalikosta **Settings** ja vasemmalta **Collaborators**. GitHub voi pyytää salasanan tai kaksivaiheisen tunnistautumisen uudelleen.
4. Paina **Add people**, kirjoita käyttäjätunnus tai sähköpostiosoite ja valitse oikea henkilö listasta.
5. Paina **Add … to this repository**. GitHub lähettää kutsun sähköpostitse.
6. Muokkaaja hyväksyy kutsun sähköpostin linkistä tai osoitteessa **github.com/notifications**. Kutsu on voimassa 7 päivää.
7. Muokkaaja voi nyt kirjautua sisällönhallintaan osoitteessa **https://hemajoensuu.fi/admin/** (ks. Kirjautuminen).

Muokkaaja saa samalla oikeuden ajaa varmuuskopiointia ja palautusta GitHubin Actions-sivulla.

### Julkaisuoikeus

Muokkaajan tallennukset menevät ensin luonnoksiksi (**Tallenna → Valmis**). Kaikki odottavat muutokset näkyvät sisällönhallinnan **Julkaisujono**-näkymässä. Huomaa, että kaikilla muokkaajilla on teknisesti oikeus myös julkaista (**Julkaise**). Jos haluat, että vain ylläpitäjä julkaisee, sopikaa siitä yhdessä. Vaihtoehtoisesti kehittäjä voi ottaa käyttöön GitHubin haarasuojauksen (ks. README.md).

### Muokkaajan poistaminen

1. Avaa **Settings → Collaborators**.
2. Paina poistettavan henkilön kohdalla **Remove** ja vahvista.

Oikeus poistuu heti. Henkilön aiemmat muutokset jäävät sivuston historiaan.

## Jos jokin menee pieleen

Jokaisesta muutoksesta jää historiaan versio, joten mitään ei voi rikkoa pysyvästi. Ota yhteyttä ylläpitäjään, niin hän palauttaa aiemman version.
