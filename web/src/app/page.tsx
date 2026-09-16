import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { odjava } from "./actions";
import { ustvariPrazenDokument } from "./dokumenti/ustvari-prazen-dokument";

export default async function ZacetnaStran() {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  const authUserId = podatkiZetona?.claims?.sub;

  if (napakaZetona || !authUserId) {
    redirect("/prijava");
  }

  const { data: uporabnik, error: napakaUporabnika } =
    await supabase
      .from("uporabnik")
      .select("uporabnisko_ime, uporabniske_pravice")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

  if (napakaUporabnika || !uporabnik) {
    redirect("/prijava");
  }

  const jePartner =
    uporabnik.uporabniske_pravice === "partner";

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Okviri V
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Sistem naročil
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {uporabnik.uporabnisko_ime}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {uporabnik.uporabniske_pravice}
              </p>
            </div>

            <form action={odjava}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Odjava
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Nadzorna plošča
            </h2>

            <p className="mt-2 text-slate-600">
              Izberi del sistema, ki ga želiš uporabljati.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <form
              action={ustvariPrazenDokument.bind(
                null,
                "ponudba",
              )}
            >
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Nova ponudba
              </button>
            </form>

            {!jePartner && (
              <form
                action={ustvariPrazenDokument.bind(
                  null,
                  "narocilo",
                )}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                >
                  Novo naročilo
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Glavni del */}
        <div
          className={
            jePartner
              ? "grid max-w-xl gap-6"
              : "grid gap-6 md:grid-cols-2"
          }
        >
          <Link
            href="/dokumenti?vrsta=ponudba"
            className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <h3 className="text-2xl font-bold text-slate-900">
              Ponudbe
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Priprava in pregled informativnih izračunov.
            </p>

            <p className="mt-6 text-sm font-semibold text-slate-900">
              Odpri ponudbe →
            </p>
          </Link>

          {!jePartner && (
            <Link
              href="/dokumenti?vrsta=narocilo"
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <h3 className="text-2xl font-bold text-slate-900">
                Naročila
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Upravljanje naročil, rokov in statusov.
              </p>

              <p className="mt-6 text-sm font-semibold text-slate-900">
                Odpri naročila →
              </p>
            </Link>
          )}
        </div>

        {/* Stranke in katalogi so vidni samo internim uporabnikom */}
        {!jePartner && (
          <div className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Stranke in katalogi
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Upravljanje strank, materialov in storitev.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/stranke"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Stranke
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Dodajanje in pregled strank.
                </p>
              </Link>

              <Link
                href="/materiali/okvirji"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Okvirji
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Katalog okvirjev in cen.
                </p>
              </Link>

              <Link
                href="/materiali/paspartuji"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Paspartuji
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Katalog paspartujev.
                </p>
              </Link>

              <Link
                href="/materiali/stekla"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Stekla
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Vrste stekel in cene.
                </p>
              </Link>

              <Link
                href="/materiali/podokvirji"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Podokvirji
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Mere in cene podokvirjev.
                </p>
              </Link>

              <Link
                href="/materiali/dodatna-dela"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Dodatna dela
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Storitve in načini obračuna.
                </p>
              </Link>

              <Link
                href="/materiali/dobavitelji"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Dobavitelji
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Kontakti dobaviteljev.
                </p>
              </Link>

              <Link
                href="/materiali/barve"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  Barve
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Barve za katalog okvirjev.
                </p>
              </Link>
            </div>

            <Link
              href="/materiali"
              className="mt-5 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Odpri celoten katalog
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}