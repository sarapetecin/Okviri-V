"use client";

import { useMemo, useState } from "react";

type Okvir = {
  id: number;
  oznaka: string | null;
  vzorec: string;
  sirina: number | null;
  prodajna_cena: number;
  barva: {
    naziv: string;
  } | null;
  dobavitelj: {
    naziv: string;
  } | null;
};

type IzbiraOkvirjaProps = {
  okvirji: Okvir[];
};

function oblikujCeno(cena: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(cena);
}

export function IzbiraOkvirja({
  okvirji,
}: IzbiraOkvirjaProps) {
  const [iskanje, setIskanje] = useState("");
  const [izbraniOkvirId, setIzbraniOkvirId] =
    useState<number | null>(null);

  const filtriraniOkvirji = useMemo(() => {
    const izraz = iskanje.trim().toLocaleLowerCase("sl");

    if (!izraz) {
      return okvirji.slice(0, 100);
    }

    return okvirji
      .filter((okvir) => {
        const besedilo = [
          okvir.oznaka,
          okvir.vzorec,
          okvir.barva?.naziv,
          okvir.dobavitelj?.naziv,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("sl");

        return besedilo.includes(izraz);
      })
      .slice(0, 100);
  }, [iskanje, okvirji]);

  const izbraniOkvir =
    okvirji.find((okvir) => okvir.id === izbraniOkvirId) ?? null;

  return (
    <div className="space-y-5">
      <input
        type="hidden"
        name="okvirId"
        value={izbraniOkvirId ?? ""}
      />

      <div>
        <label
          htmlFor="iskanjeOkvirja"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Iskanje okvirja
        </label>

        <input
          id="iskanjeOkvirja"
          type="search"
          value={iskanje}
          onChange={(event) => setIskanje(event.target.value)}
          placeholder="Išči po oznaki, vzorcu, barvi ali dobavitelju"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
        />

        <p className="mt-2 text-xs text-slate-500">
          Prikazanih je največ 100 rezultatov. Za natančnejši seznam uporabi iskanje.
        </p>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {filtriraniOkvirji.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-600">
            Noben okvir ne ustreza iskanju.
          </p>
        ) : (
          filtriraniOkvirji.map((okvir) => {
            const jeIzbran = izbraniOkvirId === okvir.id;

            return (
              <button
                key={okvir.id}
                type="button"
                onClick={() => setIzbraniOkvirId(okvir.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  jeIzbran
                    ? "border-slate-900 bg-slate-100 ring-2 ring-slate-200"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {okvir.oznaka ?? "Brez oznake"} – {okvir.vzorec}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {okvir.barva?.naziv ?? "Brez barve"}
                      {" · "}
                      {okvir.dobavitelj?.naziv ?? "Brez dobavitelja"}
                    </p>
                  </div>

                  <div className="shrink-0 text-sm sm:text-right">
                    <p className="font-semibold text-slate-900">
                      {oblikujCeno(okvir.prodajna_cena)} / m
                    </p>
                    <p className="text-slate-600">
                      Širina:{" "}
                      {okvir.sirina !== null
                        ? `${okvir.sirina} cm`
                        : "ni vnesena"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {izbraniOkvir && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Izbran okvir:{" "}
          <strong>
            {izbraniOkvir.oznaka ?? izbraniOkvir.vzorec}
          </strong>
        </div>
      )}

      <button
        type="submit"
        disabled={!izbraniOkvirId}
        className="w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Dodaj okvir
      </button>
    </div>
  );
}