import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import { KlikabilnaVrstica } from "./klikabilna-vrstica";

type StatusDokumenta =
    Database["public"]["Enums"]["status_prodajnega_dokumenta"];

type DokumentiPageProps = {
    searchParams: Promise<{
        vrsta?: string;
        avtor?: string;
    }>;
};

const naziviStatusov: Record<StatusDokumenta, string> = {
    osnutek: "Osnutek",
    poslano_v_pregled: "Poslano v pregled",
    zavrnjeno: "Zavrnjeno",
    potrjeno: "Potrjeno",
    v_izdelavi: "V izdelavi",
    dokoncano: "Dokončano",
    rocno_zaprto: "Ročno zaprto",
    preklicano: "Preklicano",
};

function oblikujDatum(datum: string) {
    return new Intl.DateTimeFormat("sl-SI").format(
        new Date(`${datum}T00:00:00`),
    );
}

function oblikujZnesek(znesek: number) {
    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR",
    }).format(znesek);
}

export default async function DokumentiPage({
    searchParams,
}: DokumentiPageProps) {
    const { vrsta, avtor } = await searchParams;

    const izbranaVrsta =
        vrsta === "ponudba" || vrsta === "narocilo"
            ? vrsta
            : null;

    const izbraniAvtorId = Number(avtor);
    const imaIzbranegaAvtorja =
        izbranaVrsta === "ponudba" &&
        Number.isInteger(izbraniAvtorId) &&
        izbraniAvtorId > 0;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: zapisiAvtorjev } =
        izbranaVrsta === "ponudba"
            ? await supabase
                .from("narocilo")
                .select("izdal_uporabnik_id, izdal_ime")
                .eq("vrsta", "ponudba")
            : { data: [] };

    const avtorjiPonudb = Array.from(
        new Map(
            (zapisiAvtorjev ?? [])
                .filter(
                    (zapis) => zapis.izdal_uporabnik_id !== null,
                )
                .map((zapis) => [
                    zapis.izdal_uporabnik_id as number,
                    {
                        id: zapis.izdal_uporabnik_id as number,
                        ime: zapis.izdal_ime,
                    },
                ]),
        ).values(),
    ).sort((a, b) => a.ime.localeCompare(b.ime, "sl"));

    let poizvedba = supabase
        .from("narocilo")
        .select(
            "id, datum_sprejema, rok_izdelave, stranka_naziv, vrsta, status, skupni_znesek, izdal_uporabnik_id, izdal_ime",
        )
        .order("ustvarjeno_at", {
            ascending: false,
        });

    if (izbranaVrsta) {
        poizvedba = poizvedba.eq(
            "vrsta",
            izbranaVrsta,
        );
    }

    if (imaIzbranegaAvtorja) {
        poizvedba = poizvedba.eq(
            "izdal_uporabnik_id",
            izbraniAvtorId,
        );
    }

    const { data: dokumenti, error } =
        await poizvedba;

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Okviri V
                        </p>
                        <h1 className="text-xl font-bold text-slate-900">
                            {izbranaVrsta === "ponudba"
                                ? "Ponudbe"
                                : izbranaVrsta === "narocilo"
                                    ? "Naročila"
                                    : "Ponudbe in naročila"}
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

            <div className="mb-5 flex flex-wrap gap-2">
                <Link
                    href="/dokumenti?vrsta=ponudba"
                    className={
                        izbranaVrsta === "ponudba"
                            ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    }
                >
                    Ponudbe
                </Link>

                <Link
                    href="/dokumenti?vrsta=narocilo"
                    className={
                        izbranaVrsta === "narocilo"
                            ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    }
                >
                    Naročila
                </Link>

                <Link
                    href="/dokumenti"
                    className={
                        izbranaVrsta === null
                            ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    }
                >
                    Vsi dokumenti
                </Link>
            </div>

            <section className="mx-auto max-w-7xl px-6 py-10">
                {izbranaVrsta === "ponudba" && avtorjiPonudb.length > 0 && (
                    <form
                        method="get"
                        className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
                    >
                        <input type="hidden" name="vrsta" value="ponudba" />

                        <div className="min-w-0 flex-1 sm:max-w-sm">
                            <label
                                htmlFor="avtor"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Avtor ponudbe
                            </label>

                            <select
                                id="avtor"
                                name="avtor"
                                defaultValue={imaIzbranegaAvtorja ? String(izbraniAvtorId) : ""}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                            >
                                <option value="">Vsi avtorji</option>
                                {avtorjiPonudb.map((avtorPonudbe) => (
                                    <option
                                        key={avtorPonudbe.id}
                                        value={avtorPonudbe.id}
                                    >
                                        {avtorPonudbe.ime}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Filtriraj
                        </button>

                        {imaIzbranegaAvtorja && (
                            <Link
                                href="/dokumenti?vrsta=ponudba"
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Počisti filter
                            </Link>
                        )}
                    </form>
                )}

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Prodajni dokumenti
                        </h2>
                        <p className="mt-2 text-slate-600">
                            Pregled ponudb in naročil.
                        </p>
                    </div>

                    <Link
                        href="/dokumenti/nov"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700"
                    >
                        Nov dokument
                    </Link>
                </div>

                {error ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                    >
                        Dokumentov ni bilo mogoče naložiti.
                    </div>
                ) : dokumenti.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Ni ponudb ali naročil
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Prvi dokument bomo ustvarili v naslednjem koraku.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Številka
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Vrsta
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Stranka
                                        </th>
                                        {izbranaVrsta === "ponudba" && (
                                            <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                                Avtor
                                            </th>
                                        )}
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Datum
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Rok izdelave
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                                            Znesek
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200">
                                    {dokumenti.map((dokument) => (
                                        <KlikabilnaVrstica
                                            key={dokument.id}
                                            href={`/dokumenti/${dokument.id}`}
                                            oznaka={`Odpri dokument ${dokument.id}`}
                                        >
                                            <td className="px-5 py-4 text-sm text-slate-900">
                                                {dokument.id}
                                            </td>
                                            <td className="px-5 py-4 text-sm capitalize text-slate-700">
                                                {dokument.vrsta}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {dokument.stranka_naziv}
                                            </td>
                                            {izbranaVrsta === "ponudba" && (
                                                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                    {dokument.izdal_ime}
                                                </td>
                                            )}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {oblikujDatum(dokument.datum_sprejema)}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {dokument.rok_izdelave
                                                    ? oblikujDatum(dokument.rok_izdelave)
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {naziviStatusov[dokument.status]}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                                                {oblikujZnesek(dokument.skupni_znesek)}
                                            </td>
                                        </KlikabilnaVrstica>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
