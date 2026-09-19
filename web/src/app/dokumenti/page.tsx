import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import { izbrisiDokumente } from "./brisanje-dokumenta";
import { oznaciKotDokoncano } from "./oznaci-kot-dokoncano";
import { rocnoZapriDokumente } from "./rocno-zapiranje";

import { TabelaDokumentov } from "./tabela-dokumentov";

import { ustvariPrazenDokument } from "./ustvari-prazen-dokument";
import { GumbNovDokument } from "./gumb-nov-dokument";


type StatusDokumenta =
    Database["public"]["Enums"]["status_prodajnega_dokumenta"];

type DokumentiPageProps = {
    searchParams: Promise<{
        vrsta?: string;
        avtor?: string;
        razvrstitev?: string;
        stranka?: string;
        status?: string;
    }>;
};

export default async function DokumentiPage({
    searchParams,
}: DokumentiPageProps) {
    const {
        vrsta,
        avtor,
        razvrstitev,
        stranka,
        status,
    } = await searchParams;

    const izbranaVrsta =
        vrsta === "ponudba" || vrsta === "narocilo"
            ? vrsta
            : null;

    const izbraniAvtorId = Number(avtor);

    const imaIzbranegaAvtorja =
        Number.isInteger(izbraniAvtorId) &&
        izbraniAvtorId > 0;

    const izbranaRazvrstitev =
        razvrstitev === "najstarejse"
            ? "najstarejse"
            : "najnovejse";

    const iskanaStranka =
        (stranka ?? "").trim();

    const dovoljeniStatusi: StatusDokumenta[] = [
        "osnutek",
        "poslano_v_pregled",
        "zavrnjeno",
        "potrjeno",
        "v_izdelavi",
        "dokoncano",
        "rocno_zaprto",
        "preklicano",
    ];

    const izbraniStatus =
        dovoljeniStatusi.includes(
            status as StatusDokumenta,
        )
            ? status as StatusDokumenta
            : "";

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    let poizvedbaAvtorjev = supabase
        .from("narocilo")
        .select(
            "izdal_uporabnik_id, izdal_ime",
        );

    if (
        vrsta === "ponudba" ||
        vrsta === "narocilo"
    ) {
        poizvedbaAvtorjev =
            poizvedbaAvtorjev.eq("vrsta", vrsta);
    }

    const { data: zapisiAvtorjev } =
        await poizvedbaAvtorjev;

    const avtorjiDokumentov = Array.from(
        new Map(
            (zapisiAvtorjev ?? [])
                .filter(
                    (zapis) =>
                        zapis.izdal_uporabnik_id !== null,
                )
                .map((zapis) => [
                    zapis.izdal_uporabnik_id as number,
                    {
                        id: zapis.izdal_uporabnik_id as number,
                        ime: zapis.izdal_ime,
                    },
                ]),
        ).values(),
    ).sort((a, b) =>
        a.ime.localeCompare(b.ime, "sl"),
    );



    let poizvedba = supabase
        .from("narocilo")
        .select(
            "id, datum_sprejema, rok_izdelave, stranka_naziv, vrsta, status, skupni_znesek, izdal_uporabnik_id, izdal_ime",
        )
        .order("datum_sprejema", {
            ascending:
                izbranaRazvrstitev === "najstarejse",
        })
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

    if (iskanaStranka) {
        poizvedba = poizvedba.ilike(
            "stranka_naziv",
            `%${iskanaStranka}%`,
        );
    }

    if (izbraniStatus) {
        poizvedba = poizvedba.eq(
            "status",
            izbraniStatus,
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
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            {vrsta === "narocilo"
                                ? "Naročila"
                                : vrsta === "ponudba"
                                    ? "Ponudbe"
                                    : "Dokumenti"}
                        </h2>

                        <p className="mt-2 text-slate-600">
                            {vrsta === "narocilo"
                                ? "Pregled naročil."
                                : vrsta === "ponudba"
                                    ? "Pregled ponudb."
                                    : "Pregled ponudb in naročil."}
                        </p>
                    </div>
                    <GumbNovDokument
                        vrsta={
                            vrsta === "ponudba" || vrsta === "narocilo"
                                ? vrsta
                                : null
                        }
                        actionPonudba={ustvariPrazenDokument.bind(
                            null,
                            "ponudba",
                        )}
                        actionNarocilo={ustvariPrazenDokument.bind(
                            null,
                            "narocilo",
                        )}
                    />

                </div>
                <nav
                    aria-label="Vrsta dokumentov"
                    className="mb-6 flex flex-wrap gap-3"
                >
                    <Link
                        href="/dokumenti?vrsta=ponudba"
                        className={
                            vrsta === "ponudba"
                                ? "rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        }
                    >
                        Ponudbe
                    </Link>

                    <Link
                        href="/dokumenti?vrsta=narocilo"
                        className={
                            vrsta === "narocilo"
                                ? "rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        }
                    >
                        Naročila
                    </Link>
                    <Link
                        href="/dokumenti"
                        className={
                            !vrsta
                                ? "rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        }
                    >
                        Vsi dokumenti
                    </Link>
                </nav>
                {izbranaVrsta === "ponudba" && avtorjiDokumentov.length > 0 && (
                    <form
                        method="get"
                        className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                        <input
                            type="hidden"
                            name="vrsta"
                            value="ponudba"
                        />

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                                <label
                                    htmlFor="avtorPonudbe"
                                    className="sr-only"
                                >
                                    Avtor ponudbe
                                </label>

                                <select
                                    id="avtorPonudbe"
                                    name="avtor"
                                    defaultValue={
                                        imaIzbranegaAvtorja
                                            ? String(izbraniAvtorId)
                                            : ""
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">
                                        Vsi avtorji ponudb
                                    </option>

                                    {avtorjiDokumentov.map(
                                        (avtorPonudbe) => (
                                            <option
                                                key={avtorPonudbe.id}
                                                value={avtorPonudbe.id}
                                            >
                                                {avtorPonudbe.ime}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="razvrstitevPonudb"
                                    className="sr-only"
                                >
                                    Razvrstitev
                                </label>

                                <select
                                    id="razvrstitevPonudb"
                                    name="razvrstitev"
                                    defaultValue={izbranaRazvrstitev}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-52"
                                >
                                    <option value="najnovejse">
                                        Najnovejše najprej
                                    </option>

                                    <option value="najstarejse">
                                        Najstarejše najprej
                                    </option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-slate-700"
                            >
                                Filtriraj
                            </button>
                        </div>

                        {(
                            imaIzbranegaAvtorja ||
                            izbranaRazvrstitev === "najstarejse"
                        ) && (
                                <div className="mt-2 flex justify-end px-1">
                                    <Link
                                        href="/dokumenti?vrsta=ponudba"
                                        className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                                    >
                                        Počisti vse filtre
                                    </Link>
                                </div>
                            )}
                    </form>
                )}
                {vrsta === "narocilo" && (
                    <form
                        method="get"
                        className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                        <input
                            type="hidden"
                            name="vrsta"
                            value="narocilo"
                        />

                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                            <div className="min-w-0 flex-1">
                                <label
                                    htmlFor="strankaNarocila"
                                    className="sr-only"
                                >
                                    Poišči stranko
                                </label>

                                <input
                                    id="strankaNarocila"
                                    name="stranka"
                                    type="search"
                                    defaultValue={iskanaStranka}
                                    placeholder="Poišči po stranki ..."
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="avtorNarocila"
                                    className="sr-only"
                                >
                                    Avtor
                                </label>

                                <select
                                    id="avtorNarocila"
                                    name="avtor"
                                    defaultValue={
                                        imaIzbranegaAvtorja
                                            ? String(izbraniAvtorId)
                                            : ""
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-44"
                                >
                                    <option value="">
                                        Vsi avtorji
                                    </option>

                                    {avtorjiDokumentov.map(
                                        (avtorDokumenta) => (
                                            <option
                                                key={avtorDokumenta.id}
                                                value={avtorDokumenta.id}
                                            >
                                                {avtorDokumenta.ime}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="statusNarocila"
                                    className="sr-only"
                                >
                                    Status
                                </label>

                                <select
                                    id="statusNarocila"
                                    name="status"
                                    defaultValue={izbraniStatus}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-44"
                                >
                                    <option value="">
                                        Vsi statusi
                                    </option>

                                    <option value="v_izdelavi">
                                        V izdelavi
                                    </option>

                                    <option value="dokoncano">
                                        Dokončano
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="razvrstitevNarocil"
                                    className="sr-only"
                                >
                                    Razvrstitev
                                </label>

                                <select
                                    id="razvrstitevNarocil"
                                    name="razvrstitev"
                                    defaultValue={izbranaRazvrstitev}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-48"
                                >
                                    <option value="najnovejse">
                                        Najnovejše najprej
                                    </option>

                                    <option value="najstarejse">
                                        Najstarejše najprej
                                    </option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-slate-700"
                            >
                                Filtriraj
                            </button>
                        </div>

                        {(
                            imaIzbranegaAvtorja ||
                            iskanaStranka ||
                            izbraniStatus ||
                            izbranaRazvrstitev === "najstarejse"
                        ) && (
                                <div className="mt-2 flex justify-end px-1">
                                    <Link
                                        href="/dokumenti?vrsta=narocilo"
                                        className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                                    >
                                        Počisti vse filtre
                                    </Link>
                                </div>
                            )}
                    </form>
                )}
                {!vrsta && (
                    <form
                        method="get"
                        className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                            <div className="min-w-0 flex-1">
                                <label
                                    htmlFor="strankaDokumenta"
                                    className="sr-only"
                                >
                                    Poišči stranko
                                </label>

                                <input
                                    id="strankaDokumenta"
                                    name="stranka"
                                    type="search"
                                    defaultValue={iskanaStranka}
                                    placeholder="Poišči po stranki ..."
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="avtorDokumenta"
                                    className="sr-only"
                                >
                                    Avtor
                                </label>

                                <select
                                    id="avtorDokumenta"
                                    name="avtor"
                                    defaultValue={
                                        imaIzbranegaAvtorja
                                            ? String(izbraniAvtorId)
                                            : ""
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-44"
                                >
                                    <option value="">Vsi avtorji</option>

                                    {avtorjiDokumentov.map(
                                        (avtorDokumenta) => (
                                            <option
                                                key={avtorDokumenta.id}
                                                value={avtorDokumenta.id}
                                            >
                                                {avtorDokumenta.ime}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="statusDokumenta"
                                    className="sr-only"
                                >
                                    Status
                                </label>

                                <select
                                    id="statusDokumenta"
                                    name="status"
                                    defaultValue={izbraniStatus}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-44"
                                >
                                    <option value="">Vsi statusi</option>
                                    <option value="osnutek">Osnutek</option>
                                    <option value="v_izdelavi">
                                        V izdelavi
                                    </option>
                                    <option value="dokoncano">
                                        Dokončano
                                    </option>
                                    <option value="rocno_zaprto">
                                        Dokončano – ročno zaprto
                                    </option>
                                    <option value="preklicano">
                                        Preklicano
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="razvrstitevDokumentov"
                                    className="sr-only"
                                >
                                    Razvrstitev
                                </label>

                                <select
                                    id="razvrstitevDokumentov"
                                    name="razvrstitev"
                                    defaultValue={izbranaRazvrstitev}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-48"
                                >
                                    <option value="najnovejse">
                                        Najnovejše najprej
                                    </option>
                                    <option value="najstarejse">
                                        Najstarejše najprej
                                    </option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-slate-700"
                            >
                                Filtriraj
                            </button>
                        </div>

                        {(
                            imaIzbranegaAvtorja ||
                            iskanaStranka ||
                            izbraniStatus ||
                            izbranaRazvrstitev === "najstarejse"
                        ) && (
                                <div className="mt-2 flex justify-end px-1">
                                    <Link
                                        href="/dokumenti"
                                        className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                                    >
                                        Počisti vse filtre
                                    </Link>
                                </div>
                            )}
                    </form>
                )}
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
                    <TabelaDokumentov
                        dokumenti={dokumenti}
                        vrsta={izbranaVrsta}
                        actionIzbrisi={izbrisiDokumente}
                        actionDokoncano={oznaciKotDokoncano}
                        actionRocnoZapri={rocnoZapriDokumente}
                    />
                )}
            </section>
        </main >
    );
}
