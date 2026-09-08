import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariPostavko } from "./actions";
import { urediPostavko } from "../[postavkaId]/uredi/actions";
import {
  IzbiraDodatnihDel,
  IzbiraMaterialov,
} from "./iskalni-izbirnik";

type NovaPostavkaPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
    _vdelano?: string;
    urediPostavko?: string;
  }>;
};

function oblikujCeno(cena: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(cena);
}

export default async function NovaPostavkaPage({
  params,
  searchParams,
}: NovaPostavkaPageProps) {
  const { id } = await params;
  const dokumentId = Number(id);

  if (!Number.isInteger(dokumentId) || dokumentId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const { data: dokument } = await supabase
    .from("narocilo")
    .select("id, vrsta, stranka_naziv")
    .eq("id", dokumentId)
    .maybeSingle();

  if (!dokument) {
    notFound();
  }

  const { data: uporabniskaVloga, error: napakaVloge } =
    await supabase.rpc("trenutna_uporabniska_vloga");

  if (napakaVloge || !uporabniskaVloga) {
    redirect("/");
  }

  const jePartner = uporabniskaVloga === "partner";

  const poizvedbaOkvirjev = (od: number, doVkljucno: number) =>
    jePartner
      ? supabase
        .from("partner_katalog_okvirjev")
        .select(
          "id, vzorec, oznaka, sirina, prodajna_cena, barva",
        )
        .order("vzorec")
        .range(od, doVkljucno)
      : supabase
        .from("okvir")
        .select(
          `
            id,
            vzorec,
            oznaka,
            sirina,
            prodajna_cena,
            barva:barva_id (
              naziv
            )
          `,
        )
        .eq("na_prodaj", true)
        .order("vzorec")
        .range(od, doVkljucno);

  const [
    rezultatOkvirjev1,
    rezultatOkvirjev2,
    rezultatOkvirjev3,
    rezultatStekel,
    rezultatPaspartujev,
    rezultatDodatnihDel,
  ] = await Promise.all([
    poizvedbaOkvirjev(0, 999),
    poizvedbaOkvirjev(1000, 1999),
    poizvedbaOkvirjev(2000, 2999),

    jePartner
      ? supabase
        .from("partner_katalog_stekel")
        .select("id, oznaka, naziv, prodajna_cena")
        .order("naziv")
      : supabase
        .from("steklo")
        .select("id, oznaka, naziv, prodajna_cena")
        .eq("na_prodaj", true)
        .order("naziv"),

    jePartner
      ? supabase
        .from("partner_katalog_paspartujev")
        .select(
          "id, oznaka, naziv, barva, dodatni_opis, prodajna_cena",
        )
        .order("oznaka")
      : supabase
        .from("paspartu")
        .select(
          "id, oznaka, naziv, barva, dodatni_opis, prodajna_cena",
        )
        .eq("na_prodaj", true)
        .order("oznaka"),

    jePartner
      ? supabase
        .from("partner_katalog_dodatnih_del")
        .select("id, naziv, cena, cena_na_m2, cena_na_m")
        .order("naziv")
      : supabase
        .from("dodatna_dela")
        .select("id, naziv, cena, cena_na_m2, cena_na_m")
        .eq("na_prodaj", true)
        .order("naziv"),
  ]);

  const napakaKatalogov =
    rezultatOkvirjev1.error ||
    rezultatOkvirjev2.error ||
    rezultatOkvirjev3.error ||
    rezultatStekel.error ||
    rezultatPaspartujev.error ||
    rezultatDodatnihDel.error;

  const okviri = [
    ...(rezultatOkvirjev1.data ?? []),
    ...(rezultatOkvirjev2.data ?? []),
    ...(rezultatOkvirjev3.data ?? []),
  ];

  const moznostiOkvirjev = okviri.flatMap((okvir) => {
    if (
      okvir.id === null ||
      okvir.vzorec === null ||
      okvir.prodajna_cena === null
    ) {
      return [];
    }

    return [
      {
        id: okvir.id,
        naziv: okvir.vzorec,
        opis: [
          okvir.sirina !== null
            ? `Širina ${okvir.sirina} cm`
            : null,
          `${oblikujCeno(okvir.prodajna_cena)}/m`,
        ]
          .filter(Boolean)
          .join(" · "),
      },
    ];
  });

  const moznostiStekel = (rezultatStekel.data ?? []).flatMap(
    (steklo) => {
      if (
        steklo.id === null ||
        steklo.oznaka === null ||
        steklo.naziv === null ||
        steklo.prodajna_cena === null
      ) {
        return [];
      }

      return [
        {
          id: steklo.id,
          naziv: `${steklo.oznaka} – ${steklo.naziv}`,
          opis: `${oblikujCeno(steklo.prodajna_cena)}/m²`,
        },
      ];
    },
  );

  const moznostiPaspartujev = (
    rezultatPaspartujev.data ?? []
  ).flatMap((paspartu) => {
    if (
      paspartu.id === null ||
      paspartu.naziv === null ||
      paspartu.prodajna_cena === null
    ) {
      return [];
    }

    return [
      {
        id: paspartu.id,
        naziv: paspartu.naziv,
        opis: [
          paspartu.dodatni_opis,
          `${oblikujCeno(paspartu.prodajna_cena)}/m²`,
        ]
          .filter(Boolean)
          .join(" · "),
      },
    ];
  });

  const dodatnaDela = (rezultatDodatnihDel.data ?? []).flatMap(
    (delo) => {
      if (delo.id === null || delo.naziv === null) {
        return [];
      }

      return [
        {
          ...delo,
          id: delo.id,
          naziv: delo.naziv,
        },
      ];
    },
  );

  const moznostiDodatnihDel = dodatnaDela.map(
    (delo) => {
      const deliCene = [
        delo.cena
          ? `${oblikujCeno(delo.cena)}/kos`
          : null,

        delo.cena_na_m2
          ? `${oblikujCeno(delo.cena_na_m2)}/m²`
          : null,

        delo.cena_na_m
          ? `${oblikujCeno(delo.cena_na_m)}/m`
          : null,
      ].filter(Boolean);

      return {
        id: delo.id,
        naziv: delo.naziv,
        opis: deliCene.join(" + "),
      };
    },
  );

  const { napaka, _vdelano, urediPostavko: urediPostavkoBesedilo } =
    await searchParams;
  const vdelano = _vdelano === "da";
  const urejanaPostavkaId = Number(urediPostavkoBesedilo);
  const imaVeljavenIdZaUrejanje =
    Number.isInteger(urejanaPostavkaId) && urejanaPostavkaId > 0;

  const { data: urejanaPostavka } = imaVeljavenIdZaUrejanje
    ? await supabase
      .from("narocilo_postavka")
      .select(
        `
          id,
          kolicina,
          dolzina,
          sirina,
          opis_slike,
          opombe,
          ogledalo,
          postavka_okvir (okvir_id, vrstni_red),
          postavka_paspartu (paspartu_id, nacin_paspartu, vrstni_red),
          postavka_steklo (steklo_id),
          postavka_podokvir (je_podokvir),
          postavka_dodatno_delo (dodatno_delo_id)
        `,
      )
      .eq("id", urejanaPostavkaId)
      .eq("narocilo_id", dokumentId)
      .maybeSingle()
    : { data: null };

  const izbraniOkvirji = urejanaPostavka
    ? [...urejanaPostavka.postavka_okvir]
      .sort((a, b) => a.vrstni_red - b.vrstni_red)
      .map((okvir) => okvir.okvir_id)
      .filter((id): id is number => id !== null)
    : [];

  const urejeniPaspartuji = urejanaPostavka
    ? [...urejanaPostavka.postavka_paspartu].sort(
      (a, b) => a.vrstni_red - b.vrstni_red,
    )
    : [];

  const izbraniPaspartuji = urejeniPaspartuji
    .map((paspartu) => paspartu.paspartu_id)
    .filter((id): id is number => id !== null);

  const izbraniNaciniPaspartuja = urejeniPaspartuji.map((paspartu) =>
    paspartu.nacin_paspartu === "polozen" ? "polozen" as const : "vrezan" as const,
  );

  const izbranaDodatnaDela = urejanaPostavka
    ? urejanaPostavka.postavka_dodatno_delo
      .map((delo) => delo.dodatno_delo_id)
      .filter((id): id is number => id !== null)
    : [];

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Preveri količino, dimenzije in izbrane materiale."
      : napaka === "shranjevanje"
        ? "Celotne postavke ni bilo mogoče shraniti."
        : null;

  const shraniPostavko = urejanaPostavka
    ? urediPostavko.bind(null, dokumentId, urejanaPostavka.id)
    : ustvariPostavko.bind(null, dokumentId);

  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";
  return (
    <div className={vdelano ? "" : "min-h-screen bg-slate-100"}>
      {!vdelano && (
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {dokument.vrsta === "ponudba" ? "Ponudba" : "Naročilo"} #
                {dokument.id}
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                {urejanaPostavka ? "Uredi postavko" : "Nova postavka"}
              </h1>
            </div>

            <Link
              href={`/dokumenti/${dokument.id}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Prekliči
            </Link>
          </div>
        </header>
      )}
      <section
        className={
          vdelano ? "" : "mx-auto max-w-7xl px-6 py-8"
        }
      >        <div className={vdelano ? "mb-5" : "mb-7"}>
          <h2 className="text-2xl font-bold text-slate-900">
            {urejanaPostavka
              ? `Urejanje postavke #${urejanaPostavka.id}`
              : "Dodajanje celotne postavke"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Stranka: {dokument.stranka_naziv}. Osnovne podatke in vse
            materiale izberi na eni strani.
          </p>
        </div>

        {sporociloNapake && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {sporociloNapake}
          </div>
        )}

        {napakaKatalogov ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            Katalogov materialov ni bilo mogoče naložiti.
          </div>
        ) : (
          <form
            action={shraniPostavko}
            className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
          >
            {vdelano && (
              <input
                type="hidden"
                name="vdelano"
                value="da"
              />
            )}

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    1. Osnovni podatki
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Slika in dimenzije
                  </h3>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="opisSlike"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Opis slike
                    </label>

                    <input
                      id="opisSlike"
                      name="opisSlike"
                      type="text"
                      placeholder="Na primer: družinska fotografija"
                      defaultValue={urejanaPostavka?.opis_slike ?? ""}
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
                    <div>
                      <label
                        htmlFor="dolzina"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Dolžina (cm) *
                      </label>

                      <input
                        id="dolzina"
                        name="dolzina"
                        type="number"
                        min="0.1"
                        max="10000"
                        step="0.1"
                        defaultValue={urejanaPostavka?.dolzina}
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="sirina"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Širina (cm) *
                      </label>

                      <input
                        id="sirina"
                        name="sirina"
                        type="number"
                        min="0.1"
                        max="10000"
                        step="0.1"
                        defaultValue={urejanaPostavka?.sirina}
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="kolicina"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Količina *
                      </label>

                      <input
                        id="kolicina"
                        name="kolicina"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        defaultValue={urejanaPostavka?.kolicina ?? 1}
                        required
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label
                      htmlFor="opombe"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Opombe
                    </label>

                    <textarea
                      id="opombe"
                      name="opombe"
                      rows={3}
                      placeholder="Navodila za izdelavo"
                      defaultValue={urejanaPostavka?.opombe ?? ""}
                      className={inputClassName}
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                    <input
                      name="ogledalo"
                      type="checkbox"
                      defaultChecked={urejanaPostavka?.ogledalo ?? false}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        Postavka je ogledalo
                      </span>

                      <span className="mt-1 block text-sm text-slate-600">
                        Označi, kadar se namesto slike okvirja ogledalo.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    2. Materiali
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Okvir, paspartu in steklo
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Dodatni okvir ali paspartu se odpre pod
                    prvim izborom.
                  </p>
                </div>

                <IzbiraMaterialov
                  key={`materiali-${urejanaPostavka?.id ?? "nova"}`}
                  moznostiOkvirjev={moznostiOkvirjev}
                  moznostiPaspartujev={moznostiPaspartujev}
                  moznostiStekel={moznostiStekel}
                  privzetiOkvirIds={izbraniOkvirji}
                  privzetiPaspartuIds={izbraniPaspartuji}
                  privzetiNaciniPaspartuja={izbraniNaciniPaspartuja}
                  privzetoStekloId={
                    urejanaPostavka?.postavka_steklo?.steklo_id ?? null
                  }
                />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    3. Podokvir in dodatna dela
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Dodatne možnosti
                  </h3>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    name="dodajPodokvir"
                    type="checkbox"
                    defaultChecked={
                      urejanaPostavka?.postavka_podokvir?.je_podokvir ?? false
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Dodaj podokvir
                    </span>

                    <span className="mt-1 block text-sm text-slate-600">
                      Primerna dimenzija in cena se določita samodejno.
                    </span>
                  </span>
                </label>

                <div className="mt-5">
                  {moznostiDodatnihDel.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Dodatna dela niso na voljo.
                    </p>
                  ) : (
                    <IzbiraDodatnihDel
                      key={`dela-${urejanaPostavka?.id ?? "nova"}`}
                      moznosti={moznostiDodatnihDel}
                      privzetiIds={izbranaDodatnaDela}
                    />
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Celotna postavka
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ob shranjevanju se bodo hkrati dodali osnovni podatki
                  in vsi izbrani materiali.
                </p>

                <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Dokument</span>
                    <span className="font-medium text-slate-900">
                      #{dokument.id}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Stranka</span>
                    <span className="text-right font-medium text-slate-900">
                      {dokument.stranka_naziv}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Izračun</span>
                    <span className="text-right font-medium text-slate-900">
                      Samodejen
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  {urejanaPostavka
                    ? "Shrani spremembe"
                    : "Shrani celotno postavko"}
                </button>

                {vdelano && urejanaPostavka && (
                  <Link
                    href={`/dokumenti/${dokument.id}#nova-postavka`}
                    className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Prekliči urejanje
                  </Link>
                )}

                {!vdelano && (
                  <Link
                    href={`/dokumenti/${dokument.id}`}
                    className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Prekliči
                  </Link>
                )}
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                Cena postavke in skupni znesek dokumenta se izračunata
                po shranjevanju.
              </div>
            </aside>
          </form>
        )}
      </section>
    </div>
  );
}
