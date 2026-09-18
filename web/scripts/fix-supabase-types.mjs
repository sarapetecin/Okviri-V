import fs from "node:fs";

const pot = "src/types/database.types.ts";

const vrstice = fs
    .readFileSync(pot, "utf8")
    .split(/\r?\n/);

const funkcije = [
    "partner_uredi_celotno_postavko",
    "partner_ustvari_celotno_postavko",
    "uredi_celotno_postavko",
    "ustvari_celotno_postavko",
];

function zamik(vrstica) {
    return vrstica.length -
        vrstica.trimStart().length;
}

function jeLastnostNaIstiRavni(
    vrstica,
    zahtevaniZamik,
) {
    if (zamik(vrstica) !== zahtevaniZamik) {
        return false;
    }

    return /^(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_]*):/.test(
        vrstica.trim(),
    );
}

const blokiZaOdstranitev = [];

for (const funkcija of funkcije) {
    const zacetki = [];

    for (
        let indeks = 0;
        indeks < vrstice.length;
        indeks += 1
    ) {
        const vsebina = vrstice[indeks].trim();

        if (
            vsebina === `${funkcija}:` ||
            vsebina === `"${funkcija}":`
        ) {
            zacetki.push(indeks);
        }
    }

    if (zacetki.length <= 1) {
        continue;
    }

    const zacetek = zacetki[0];
    const zahtevaniZamik =
        zamik(vrstice[zacetek]);

    let konec = vrstice.length - 1;

    for (
        let indeks = zacetek + 1;
        indeks < vrstice.length;
        indeks += 1
    ) {
        if (
            jeLastnostNaIstiRavni(
                vrstice[indeks],
                zahtevaniZamik,
            )
        ) {
            konec = indeks - 1;
            break;
        }
    }

    blokiZaOdstranitev.push({
        zacetek,
        konec,
        funkcija,
    });
}

/*
 * Odstrani stare funkcijske bloke od spodaj navzgor.
 */
blokiZaOdstranitev
    .sort((a, b) => b.zacetek - a.zacetek)
    .forEach(
        ({ zacetek, konec, funkcija }) => {
            vrstice.splice(
                zacetek,
                konec - zacetek + 1,
            );

            console.log(
                `Odstranjen podvojen blok: ${funkcija}`,
            );
        },
    );

/*
 * Odstrani samo podvojene vrstice vrsta_podokvirja.
 * Drugih enakih vrstic ne spreminja.
 */
for (
    let indeks = vrstice.length - 1;
    indeks > 0;
    indeks -= 1
) {
    if (
        vrstice[indeks].trim().startsWith(
            "vrsta_podokvirja",
        ) &&
        vrstice[indeks] === vrstice[indeks - 1]
    ) {
        vrstice.splice(indeks, 1);
    }
}

fs.writeFileSync(
    pot,
    `${vrstice.join("\n")}\n`,
    "utf8",
);

console.log(
    `Odstranjenih blokov: ${blokiZaOdstranitev.length}`,
);