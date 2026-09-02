import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariPostavko } from "./actions";
import { IskalniIzbirnik } from "./iskalni-izbirnik";

type NovaPostavkaPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
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

  const [
    rezultatOkvirjev1,
    rezultatOkvirjev2,
    rezultatOkvirjev3,
    rezultatStekel,
    rezultatPaspartujev,
    rezultatDodatnihDel,
  ] = await Promise.all([
    supabase
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
      .range(0, 999),

    supabase
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
      .range(1000, 1999),

    supabase
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
      .range(2000, 2999),

    supabase
      .from("steklo")
      .select("id, oznaka, naziv, prodajna_cena")
      .eq("na_prodaj", true)
      .order("naziv"),

    supabase
      .from("paspartu")
      .select(
        "id, oznaka, naziv, barva, dodatni_opis, prodajna_cena",
      )
      .eq("na_prodaj", true)
      .order("oznaka"),

    supabase
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

  const moznostiOkvirjev = okviri.map((okvir) => ({
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
  }));

  const moznostiStekel = (rezultatStekel.data ?? []).map(
    (steklo) => ({
      id: steklo.id,
      naziv: `${steklo.oznaka} – ${steklo.naziv}`,
      opis: `${oblikujCeno(steklo.prodajna_cena)}/m²`,
    }),
  );

  const moznostiPaspartujev = (
    rezultatPaspartujev.data ?? []
  ).map((paspartu) => ({
    id: paspartu.id,
    naziv: paspartu.naziv,

    opis: [
      paspartu.dodatni_opis,
      `${oblikujCeno(paspartu.prodajna_cena)}/m²`,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  
  const dodatnaDela = rezultatDodatnihDel.data ?? [];

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Preveri količino, dimenzije in izbrane materiale."
      : napaka === "shranjevanje"
        ? "Celotne postavke ni bilo mogoče shraniti."
        : null;

  const shraniPostavko = ustvariPostavko.bind(
    null,
    dokumentId,
  );

  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {dokument.vrsta === "ponudba" ? "Ponudba" : "Naročilo"} #
              {dokument.id}
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Nova postavka
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

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-slate-900">
            Dodajanje celotne postavke
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
                        defaultValue="1"
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
                      className={inputClassName}
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                    <input
                      name="ogledalo"
                      type="checkbox"
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

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    2. Okvirji
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Glavni in zunanji okvirji
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Začni vpisovati vzorec, oznako ali barvo. Drugi in
                    tretji okvir sta neobvezna.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <IskalniIzbirnik
                    name="okvirId"
                    label="Glavni okvir"
                    placeholder="Poišči okvir"
                    moznosti={moznostiOkvirjev}
                  />

                  <IskalniIzbirnik
                    name="okvirId"
                    label="Zunanji okvir 2"
                    placeholder="Neobvezno"
                    moznosti={moznostiOkvirjev}
                  />

                  <IskalniIzbirnik
                    name="okvirId"
                    label="Zunanji okvir 3"
                    placeholder="Neobvezno"
                    moznosti={moznostiOkvirjev}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    3. Steklo in paspartu
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Zaščita in notranja obroba
                  </h3>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <IskalniIzbirnik
                    name="stekloId"
                    label="Steklo"
                    placeholder="Poišči steklo"
                    moznosti={moznostiStekel}
                  />

                  <IskalniIzbirnik
                    name="paspartuId"
                    label="Paspartu"
                    placeholder="Poišči paspartu"
                    moznosti={moznostiPaspartujev}
                  />

                  <IskalniIzbirnik
                    name="paspartuId"
                    label="Drugi paspartu"
                    placeholder="Neobvezno"
                    moznosti={moznostiPaspartujev}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    4. Podokvir in dodatna dela
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Dodatne možnosti
                  </h3>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    name="dodajPodokvir"
                    type="checkbox"
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

                <fieldset className="mt-6">
                  <legend className="mb-3 text-sm font-semibold text-slate-900">
                    Dodatna dela
                  </legend>

                  {dodatnaDela.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Dodatna dela niso na voljo.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {dodatnaDela.map((delo) => {
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

                        return (
                          <label
                            key={delo.id}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                          >
                            <input
                              name="dodatnoDeloId"
                              type="checkbox"
                              value={delo.id}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                              <span className="block text-sm font-medium text-slate-900">
                                {delo.naziv}
                              </span>

                              {deliCene.length > 0 && (
                                <span className="mt-1 block text-xs text-slate-500">
                                  {deliCene.join(" + ")}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </fieldset>
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
                  Shrani celotno postavko
                </button>

                <Link
                  href={`/dokumenti/${dokument.id}`}
                  className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Prekliči
                </Link>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                Cena postavke in skupni znesek dokumenta se izračunata
                po shranjevanju.
              </div>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}