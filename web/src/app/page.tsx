import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { odjava } from "./actions";

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Nadzorna plošča
          </h2>

          <p className="mt-2 text-slate-600">
            Izberi del sistema, ki ga želiš uporabljati.
          </p>
        </div>

        <div
          className={
            jePartner
              ? "grid max-w-md gap-6"
              : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {!jePartner && (
            <Link
              href="/stranke"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                Stranke
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Dodajanje in pregled strank.
              </p>
            </Link>
          )}

          <Link
            href="/dokumenti?vrsta=ponudba"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Ponudbe
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Priprava informativnih izračunov.
            </p>
          </Link>

          {!jePartner && (
            <Link
              href="/dokumenti?vrsta=narocilo"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                Naročila
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Upravljanje naročil in njihovih statusov.
              </p>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}