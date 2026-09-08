import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariDokument } from "./actions";

type NovDokumentPageProps = {
  searchParams: Promise<{
    napaka?: string;
  }>;
};

type StrankaZaIzbiro = {
  id: number;
  naziv: string;
  telefonska_stevilka: string | null;
};

export default async function NovDokumentPage({
  searchParams,
}: NovDokumentPageProps) {
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
    redirect("/");
  }

  const jePartner =
    uporabnik.uporabniske_pravice === "partner";

  let stranke: StrankaZaIzbiro[] = [];
  let napakaStrank: string | null = null;

  if (!jePartner) {
    const rezultatStrank = await supabase
      .from("stranka")
      .select("id, naziv, telefonska_stevilka")
      .order("naziv");

    stranke = rezultatStrank.data ?? [];
    napakaStrank = rezultatStrank.error?.message ?? null;
  }

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? jePartner
        ? "Preveri rok izdelave in popust."
        : "Preveri izbrano stranko, vrsto dokumenta, rok in popust."
      : napaka === "stranka-ne-obstaja"
        ? "Izbrana stranka ne obstaja."
        : napaka === "uporabnik-ne-obstaja"
          ? "Tvoj uporabniški profil ni pravilno povezan."
          : napaka === "shranjevanje"
            ? jePartner
              ? "Ponudbe ni bilo mogoče shraniti."
              : "Dokumenta ni bilo mogoče shraniti."
            : null;

  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

  const brezStrank =
    !jePartner && !napakaStrank && stranke.length === 0;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Okviri V
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              {jePartner ? "Nova ponudba" : "Nov dokument"}
            </h1>
          </div>

          <Link
            href="/dokumenti"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Prekliči
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Osnovni podatki
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {jePartner
                ? "Ustvari ponudbo. Postavke in materiale boš dodal po ustvarjanju."
                : "Postavke in materiale boš dodal po ustvarjanju dokumenta."}
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

          {napakaStrank ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Strank ni bilo mogoče naložiti.
            </div>
          ) : brezStrank ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-slate-900">
                Pred dokumentom moraš ustvariti stranko.
              </p>

              <Link
                href="/stranke/nova"
                className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white"
              >
                Nova stranka
              </Link>
            </div>
          ) : (
            <form action={ustvariDokument} className="space-y-6">
              {jePartner ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-semibold text-blue-900">
                    Partnerska ponudba
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    Ponudba bo shranjena brez izbrane stranke in
                    povezana s partnerjem {uporabnik.uporabnisko_ime}.
                  </p>
                </div>
              ) : (
                <>
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium text-slate-700">
                      Vrsta dokumenta *
                    </legend>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4">
                        <input
                          name="vrsta"
                          type="radio"
                          value="ponudba"
                          defaultChecked
                        />

                        <span>
                          <span className="block font-semibold text-slate-900">
                            Ponudba
                          </span>

                          <span className="block text-sm text-slate-600">
                            Informativni izračun
                          </span>
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4">
                        <input
                          name="vrsta"
                          type="radio"
                          value="narocilo"
                        />

                        <span>
                          <span className="block font-semibold text-slate-900">
                            Naročilo
                          </span>

                          <span className="block text-sm text-slate-600">
                            Neposredno v postopek izdelave
                          </span>
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  <div>
                    <label
                      htmlFor="strankaId"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Stranka *
                    </label>

                    <select
                      id="strankaId"
                      name="strankaId"
                      required
                      defaultValue=""
                      className={inputClassName}
                    >
                      <option value="" disabled>
                        Izberi stranko
                      </option>

                      {stranke.map((stranka) => (
                        <option key={stranka.id} value={stranka.id}>
                          {stranka.naziv}
                          {stranka.telefonska_stevilka
                            ? ` – ${stranka.telefonska_stevilka}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="rokIzdelave"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Rok izdelave
                  </label>

                  <input
                    id="rokIzdelave"
                    name="rokIzdelave"
                    type="date"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="popust"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Popust (%)
                  </label>

                  <input
                    id="popust"
                    name="popust"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    defaultValue="0"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                <Link
                  href="/dokumenti"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Prekliči
                </Link>

                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                >
                  {jePartner
                    ? "Ustvari ponudbo"
                    : "Ustvari dokument"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}