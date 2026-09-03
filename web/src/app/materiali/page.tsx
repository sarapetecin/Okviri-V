import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const kategorije = [
  {
    kljuc: "okvirji",
    naziv: "Okvirji",
    opis: "Vzorec, barva, širina, cene in dobavitelj.",
    href: "/materiali/okvirji",
  },
  {
    kljuc: "paspartuji",
    naziv: "Paspartuji",
    opis: "Oznaka, naziv, barva, opis in cena na m².",
    href: "/materiali/paspartuji",
  },
  {
    kljuc: "stekla",
    naziv: "Stekla",
    opis: "Vrste stekel, oznake in cena na m².",
    href: "/materiali/stekla",
  },
  {
    kljuc: "podokvirji",
    naziv: "Podokvirji",
    opis: "Standardne dimenzije in cena na meter.",
    href: "/materiali/podokvirji",
  },
  {
    kljuc: "dodatnaDela",
    naziv: "Dodatna dela",
    opis: "Storitve ter obračun na kos, meter ali m².",
    href: "/materiali/dodatna-dela",
  },
  {
    kljuc: "dobavitelji",
    naziv: "Dobavitelji",
    opis: "Kontakti in podatki dobaviteljev.",
    href: "/materiali/dobavitelji",
  },
  {
    kljuc: "barve",
    naziv: "Barve",
    opis: "Seznam barv za okvirje.",
    href: "/materiali/barve",
  },
] as const;

export default async function MaterialiPage() {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const [
    rezultatOkvirjev,
    rezultatPaspartujev,
    rezultatStekel,
    rezultatPodokvirjev,
    rezultatDodatnihDel,
    rezultatDobaviteljev,
    rezultatBarv,
  ] = await Promise.all([
    supabase
      .from("okvir")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("paspartu")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("steklo")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("podokvir")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("dodatna_dela")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("dobavitelj")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("barva")
      .select("*", { count: "exact", head: true }),
  ]);

  const stevila: Record<(typeof kategorije)[number]["kljuc"], number> = {
    okvirji: rezultatOkvirjev.count ?? 0,
    paspartuji: rezultatPaspartujev.count ?? 0,
    stekla: rezultatStekel.count ?? 0,
    podokvirji: rezultatPodokvirjev.count ?? 0,
    dodatnaDela: rezultatDodatnihDel.count ?? 0,
    dobavitelji: rezultatDobaviteljev.count ?? 0,
    barve: rezultatBarv.count ?? 0,
  };

  const napaka =
    rezultatOkvirjev.error ||
    rezultatPaspartujev.error ||
    rezultatStekel.error ||
    rezultatPodokvirjev.error ||
    rezultatDodatnihDel.error ||
    rezultatDobaviteljev.error ||
    rezultatBarv.error;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Okviri V
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Materiali in storitve
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Nazaj na nadzorno ploščo
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Katalog
          </h2>

          <p className="mt-2 max-w-2xl text-slate-600">
            Pregled materialov, prodajnih cen in dobaviteljev.
          </p>
        </div>

        {napaka && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
          >
            Nekaterih podatkov kataloga ni bilo mogoče naložiti.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {kategorije.map((kategorija) => (
            <Link
              key={kategorija.kljuc}
              href={kategorija.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {kategorija.naziv}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {kategorija.opis}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                  {stevila[kategorija.kljuc]}
                </span>
              </div>

              <p className="mt-6 text-sm font-semibold text-slate-900">
                Odpri pregled →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}