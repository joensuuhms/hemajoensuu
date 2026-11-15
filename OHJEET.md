# Sivuston päivittäminen – ohje seuran jäsenille

Sivustoa päivitetään selaimella sisällönhallinnan (CMS) kautta. Koodia ei tarvitse osata.

## Kirjautuminen

1. Mene osoitteeseen **https://hemajoensuu.fi/admin/**.
2. Valitse **Login with GitHub** ja kirjaudu GitHub-tunnuksellasi.
   - Jos sinulla ei ole tunnusta, luo ilmainen tunnus osoitteessa github.com.
   - Pyydä sitten ylläpitäjää lisäämään sinut sivuston muokkaajaksi.

Sisällönhallinnan omat painikkeet ovat englanniksi, mutta kaikki kentät on nimetty suomeksi.

## Uuden uutisen lisääminen

1. Valitse vasemmalta **Uutiset** ja paina **New uutinen**.
2. Täytä kentät:
   - **Otsikko**, **Päivämäärä** ja **Kirjoittaja**.
   - **Lyhyt tiivistelmä**, joka näkyy uutiskortissa Ajankohtaista-sivulla.
   - **Kortin kuva**, joka näkyy uutiskortissa. Kuva on vapaaehtoinen.
   - **Artikkelin kuva**, esimerkiksi kurssin mainosjuliste. Muista täyttää myös kuvan kuvaus.
   - **Teksti**, eli itse uutinen. Tekstiä voi lihavoida ja kursivoida, ja siihen voi lisätä linkkejä samaan tapaan kuin Wordissa.
3. Paina ylhäältä **Save**. Uutinen tallentuu luonnokseksi, eikä se vielä näy sivustolla.
4. Kun uutinen on valmis, vaihda tilaksi **Ready** (Set status → Ready).
5. Ylläpitäjä julkaisee uutisen. Jos sinulla on julkaisuoikeus, voit painaa itse **Publish → Publish now**.

Sivusto päivittyy noin 1–2 minuutin kuluttua julkaisusta.

### Luonnos ja ajastettu julkaisu

- **Luonnos – ei näy sivustolla**: kun ruutu on valittuna, uutinen pysyy piilossa myös julkaisun jälkeen. Poista valinta, kun uutinen saa näkyä.
- **Julkaise automaattisesti**: valitse päivä ja kellonaika, jolloin uutinen tulee näkyviin. Sivusto tarkistaa ajastetut uutiset kerran tunnissa, joten uutinen näkyy viimeistään tunnin kuluttua valitusta ajasta. Muista silti julkaista uutinen (Publish) etukäteen.

## Uuden sivun luominen (Omat sivut)

1. Valitse **Omat sivut** ja paina **New sivu**.
2. Valitse **Sivun tyyli**: *Tavallinen* (tumma tausta) tai *Taustakuvalla*.
3. Lisää **Osiot**-kohtaan haluamasi osat. Niitä voi järjestää vetämällä. Vaihtoehdot ovat:
   - Teksti
   - Kuva ja teksti
   - Painikkeet
   - Kuvagalleria
   - Kysymykset ja vastaukset
   - Tietolaatikko
4. Tallenna ja julkaise kuten uutinen. Sivun osoite on otsikon mukainen, esimerkiksi otsikosta ”Kesäleiri 2027” tulee osoite `/kesaleiri-2027/`.
5. Lisää sivu valikkoon kohdassa **Asetukset → Päävalikko**.

## Sivujen muokkaaminen

Valitse **Sivut** ja sen jälkeen sivu, jota haluat muokata:

- **Etusivu**: esittelyteksti, painikkeet ja harjoitusaikojen tietolaatikko. Muista päivittää tietolaatikko, jos harjoitusajat muuttuvat.
- **Tietoa lajista**
- **Ota yhteyttä** (valikossa ”Yhteystiedot”): harjoitusajat, harjoituspaikat ja sähköposti.
- **Usein kysyttyä**: kysymyksiä voi lisätä, poistaa ja järjestää uudelleen vetämällä.
- **Galleria**: kuvia voi lisätä, poistaa ja järjestää uudelleen.
- **Ajankohtaista**: uutisten listaussivun otsikko ja taustakuva.

**Asetukset**-kohdasta voi muuttaa:

- **Sivuston tiedot**: nimi, somelinkit, sähköposti ja alatunniste.
- **Päävalikko**: valikon kohdat ja niiden järjestys.
- **Värit**: otsikoiden, linkkien, painikkeiden ja taustojen värit. Jos valittu väri tekisi tekstistä vaikealukuisen, sivusto käyttää sen sijaan oletusväriä.
- **Uudelleenohjaukset**: vanha osoite ohjataan uuteen, esimerkiksi kun sivu siirretään. Vanha osoite ei saa olla minkään olemassa olevan sivun osoite.

## Kuvat

- Lisää kuvat kuvakenttien kautta (**Choose an image → Upload**).
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

1. Avaa sivuston repositorio GitHubissa: **github.com/joensuuhms/web**.
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

## Jos jokin menee pieleen

Jokaisesta muutoksesta jää historiaan versio, joten mitään ei voi rikkoa pysyvästi. Ota yhteyttä ylläpitäjään, niin hän palauttaa aiemman version.
