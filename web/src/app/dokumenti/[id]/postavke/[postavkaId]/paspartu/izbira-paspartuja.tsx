"use client";

import { useMemo, useState } from "react";

type Paspartu = {
  id: number;
  oznaka: string | null;
  naziv: string;
  barva: string | null;
  dodatni_opis: string | null;
  prodajna_cena: number;
  dobavitelj: {
    naziv: string;
  } | null;
};

type IzbiraPaspartujaProps = {
  paspartuji: Paspartu[];
  dolzina: number;
  sirina: number;
  kolicina: number;
};

function oblikujZnesek(znesek: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(znesek);
}

export function IzbiraPaspartuja({
  paspartuji,
  dolzina,
  sirina,
  kolicina,
}: IzbiraPaspartujaProps) {
  const [iskanje, setIskanje] = useState("");
  const [izbraniPaspartuId, setIzbraniPaspartuId] =
    useState<number | null>(null);

  const filtriraniPaspartuji = useMemo(() => {
    const izraz = iskanje.trim().toLocaleLowerCase("sl");

    if (!izraz) {
      return paspartuji.slice(0, 100);
    }

    return paspartuji
      .filter((paspartu) => {
        const besedilo = [
          paspartu.oznaka,
          paspartu.naziv,
          paspartu.barva,
          paspartu.dodatni_opis,
          paspartu.dobavitelj?.naziv,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("sl");

        return besedilo.includes(izraz);
      })
      .slice(0, 100);
  }, [iskanje, paspartuji]);

  const izbraniPaspartu =
    paspartuji.find(
      (paspartu) => paspartu.id === izbraniPaspartuId,
    ) ?? null;

  const izracunajCeno = (prodajnaCena: number) =>
    (dolzina / 100) *
    (sirina / 100) *
    prodajnaCena *
    kolicina;

  return (
    <div className="space-y-5">
      <input
        type="hidden"
        name="paspartuId"
        value={izbraniPaspartuId ?? ""}
      />

      <div>
        <label
          htmlFor="iskanjePaspartuja"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Iskanje paspartuja
        </label>

        <input
          id="iskanjePaspartuja"
          type="search"
          value={iskanje}
          onChange={(event) => setIskanje(event.target.value)}
          placeholder="Išči po oznaki, barvi, opisu ali dobavitelju"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
        />

        <p className="mt-2 text-xs text-slate-500">
          Prikazanih je največ 100 rezultatov.
        </p>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {filtriraniPaspartuji.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-600">
            Noben paspartu ne ustreza iskanju.
          </p>
        ) : (
          filtriraniPaspartuji.map((paspartu) => {
            const jeIzbran = izbraniPaspartuId === paspartu.id;
            const cena = izracunajCeno(paspartu.prodajna_cena);

            return (
              <button
                key={paspartu.id}
                type="button"
                onClick={() => setIzbraniPaspartuId(paspartu.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  jeIzbran
                    ? "border-slate-900 bg-slate-100 ring-2 ring-slate-200"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {paspartu.oznaka ?? "Brez oznake"} –{" "}
                      {paspartu.barva ?? paspartu.naziv}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {paspartu.dodatni_opis ?? "Brez dodatnega opisa"}
                      {" · "}
                      {paspartu.dobavitelj?.naziv ?? "Brez dobavitelja"}
                    </p>
                  </div>

                  <div className="shrink-0 text-sm sm:text-right">
                    <p className="font-semibold text-slate-900">
                      {oblikujZnesek(cena)}
                    </p>

                    <p className="text-slate-600">
                      {oblikujZnesek(paspartu.prodajna_cena)} / m²
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {izbraniPaspartu && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Izbran paspartu:{" "}
          <strong>
            {izbraniPaspartu.oznaka ?? izbraniPaspartu.naziv}
          </strong>
          {" · "}
          {oblikujZnesek(
            izracunajCeno(izbraniPaspartu.prodajna_cena),
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!izbraniPaspartuId}
        className="w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Dodaj paspartu
      </button>
    </div>
  );
}