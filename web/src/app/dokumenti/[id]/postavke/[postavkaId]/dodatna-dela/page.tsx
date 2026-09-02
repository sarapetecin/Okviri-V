import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { dodajDodatnoDelo } from "./actions";

type DodatnaDelaPageProps = {
  params: Promise<{
    id: string;
    postavkaId: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
  }>;
};

function oblikujZnesek(znesek: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(znesek);
}

function oblikujStevilo(stevilo: number) {
  return new Intl.NumberFormat("sl-SI", {
    maximumFractionDigits: 2,
  }).format(stevilo);
}

export default async function DodatnaDelaPage({
  params,
  searchParams,
}: DodatnaDelaPageProps) {
  const { id, postavkaId: postavkaIdBesedilo } = await params;

  const dokumentId = Number(id);
  const postavkaId = Number(postavkaIdBesedilo);

  if (
    !Number.isInteger(dokumentId) ||
    dokumentId <= 0 ||
    !Number.isInteger(postavkaId) ||
    postavkaId <= 0
  ) {
    notFound();
  }

  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const { data: postavka } = await supabase
    .from("narocilo_postavka")
    .select("id, narocilo_id, dolzina, sirina, kolicina, opis_slike")
    .eq("id", postavkaId)
    .eq("narocilo_id", dokumentId)
    .maybeSingle();

  if (!postavka) {
    notFound();
  }

  const [
    { data: dodatnaDela, error: napakaDodatnihDel },
    { data: obstojecaDela },
  ] = await Promise.all([
    supabase
      .from("dodatna_dela")
      .select("id, naziv, cena, cena_na_m2, cena_na_m")
      .eq("na_prodaj", true)
      .order("naziv"),

    supabase
      .from("postavka_dodatno_delo")
      .select("dodatno_delo_id")
      .eq("postavka_id", postavkaId),
  ]);

  const dodaniIdji = new Set(
    (obstojecaDela ?? []).map((delo) => delo.dodatno_delo_id),
  );

  const povrsina =
    (Number(postavka.dolzina) / 100) *
    (Number(postavka.sirina) / 100);

  const obseg =
    (2 *
      (Number(postavka.dolzina) + Number(postavka.sirina))) /
    100;

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Izbrano dodatno delo ni veljavno."
      : napaka === "delo-ze-obstaja"
        ? "To dodatno delo je že dodano."
        : napaka === "dodajanje"
          ? "Dodatnega dela ni bilo mogoče dodati."
          : null;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Dokument #{dokumentId}
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Dodaj dodatno delo
            </h1>
          </div>

          <Link
            href={`/dokumenti/${dokumentId}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Nazaj
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            {postavka.opis_slike ?? "Postavka"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Mere: {postavka.dolzina} × {postavka.sirina} cm
            {" · "}
            Površina: {oblikujStevilo(povrsina)} m²
            {" · "}
            Obseg: {oblikujStevilo(obseg)} m
            {" · "}
            Količina: {postavka.kolicina}
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

        {napakaDodatnihDel ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            Dodatnih del ni bilo mogoče naložiti.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(dodatnaDela ?? []).map((delo) => {
              const osnovnaCena = Number(delo.cena ?? 0);
              const cenaNaM2 = Number(delo.cena_na_m2 ?? 0);
              const cenaNaM = Number(delo.cena_na_m ?? 0);

              const cenaEnote =
                osnovnaCena +
                povrsina * cenaNaM2 +
                obseg * cenaNaM;

              const skupnaCena =
                cenaEnote * Number(postavka.kolicina);

              const jeDodano = dodaniIdji.has(delo.id);

              return (
                <article
                  key={delo.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-bold text-slate-900">
                        {delo.naziv}
                      </h2>

                      {jeDodano && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Dodano
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      {osnovnaCena > 0 && (
                        <p>
                          Osnovna cena:{" "}
                          {oblikujZnesek(osnovnaCena)}
                        </p>
                      )}

                      {cenaNaM2 > 0 && (
                        <p>
                          {oblikujStevilo(povrsina)} m² ×{" "}
                          {oblikujZnesek(cenaNaM2)}
                        </p>
                      )}

                      {cenaNaM > 0 && (
                        <p>
                          {oblikujStevilo(obseg)} m ×{" "}
                          {oblikujZnesek(cenaNaM)}
                        </p>
                      )}
                    </div>

                    <p className="mt-5 text-2xl font-bold text-slate-900">
                      {oblikujZnesek(skupnaCena)}
                    </p>

                    {postavka.kolicina > 1 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Za {postavka.kolicina} kosov
                      </p>
                    )}
                  </div>

                  <form
                    action={dodajDodatnoDelo.bind(
                      null,
                      dokumentId,
                      postavkaId,
                    )}
                    className="mt-6"
                  >
                    <input
                      type="hidden"
                      name="dodatnoDeloId"
                      value={delo.id}
                    />

                    <button
                      type="submit"
                      disabled={jeDodano}
                      className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {jeDodano ? "Že dodano" : "Dodaj delo"}
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}