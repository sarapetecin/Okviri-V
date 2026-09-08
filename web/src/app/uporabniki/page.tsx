import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { posodobiUporabnika } from "./actions";

type UporabnikiPageProps = {
    searchParams: Promise<{
        napaka?: string;
        uspeh?: string;
    }>;
};

function oblikujDatum(datum: string | null) {
    if (!datum) {
        return "—";
    }

    return new Intl.DateTimeFormat("sl-SI", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(datum));
}

const naziviPravic = {
    administrator: "Administrator",
    zaposleni: "Zaposleni",
    partner: "Partner",
} as const;

export default async function UporabnikiPage({
    searchParams,
}: UporabnikiPageProps) {
    const { napaka, uspeh } = await searchParams;
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    const trenutniAuthUserId =
        podatkiZetona?.claims?.sub;

    if (napakaZetona || !trenutniAuthUserId) {
        redirect("/prijava");
    }

    const { data: uporabniki, error } = await supabase.rpc(
        "admin_seznam_uporabnikov",
    );

    if (error?.code === "42501") {
        redirect("/?napaka=ni-dovoljenja");
    }

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Izbrani podatki niso veljavni."
            : napaka === "lastni-racun"
                ? "Svojega administratorskega računa ne moreš deaktivirati ali mu spremeniti vloge."
                : napaka === "zadnji-administrator"
                    ? "Zadnjega aktivnega administratorja ni mogoče odstraniti."
                    : napaka === "ni-dovoljenja"
                        ? "Za to dejanje nimaš dovoljenja."
                        : napaka === "shranjevanje"
                            ? "Sprememb ni bilo mogoče shraniti."
                            : null;

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Administracija
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Uporabniki
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
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Upravljanje uporabnikov
                        </h2>

                        <p className="mt-2 text-slate-600">
                            Preglej račune, dodeli pravice in upravljaj dostop.
                        </p>
                    </div>

                    <Link
                        href="/uporabniki/nov"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700"
                    >
                        Nov uporabnik
                    </Link>
                </div>

                {(uspeh === "posodobljeno" ||
                    uspeh === "uporabnik-ustvarjen") && (
                        <div
                            role="status"
                            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700"
                        >
                            {uspeh === "uporabnik-ustvarjen"
                                ? "Uporabnik je bil uspešno ustvarjen."
                                : "Uporabnik je bil uspešno posodobljen."}
                        </div>
                    )}

                {sporociloNapake && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                    >
                        {sporociloNapake}
                    </div>
                )}

                {error ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                    >
                        Uporabnikov ni bilo mogoče naložiti.
                    </div>
                ) : uporabniki?.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Ni uporabnikov
                        </h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Uporabnik
                                        </th>

                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            E-pošta
                                        </th>

                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Ustvarjen
                                        </th>

                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Zadnja prijava
                                        </th>

                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Pravice
                                        </th>

                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Aktiven
                                        </th>

                                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                                            Dejanja
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200">
                                    {(uporabniki ?? []).map((uporabnik) => {
                                        const jeTrenutniUporabnik =
                                            uporabnik.auth_user_id ===
                                            trenutniAuthUserId;

                                        const profilManjka =
                                            !uporabnik.uporabnik_id ||
                                            !uporabnik.uporabniske_pravice;

                                        const shraniUporabnika =
                                            posodobiUporabnika.bind(
                                                null,
                                                uporabnik.auth_user_id,
                                            );

                                        return (
                                            <tr
                                                key={uporabnik.auth_user_id}
                                                className="align-top hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-slate-900">
                                                        {uporabnik.uporabnisko_ime ||
                                                            "Profil manjka"}
                                                    </p>

                                                    {jeTrenutniUporabnik && (
                                                        <p className="mt-1 text-xs font-medium text-blue-700">
                                                            Tvoj račun
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {uporabnik.email || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {oblikujDatum(
                                                        uporabnik.ustvarjeno_at,
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {oblikujDatum(
                                                        uporabnik.zadnja_prijava_at,
                                                    )}
                                                </td>

                                                {profilManjka ? (
                                                    <td
                                                        colSpan={3}
                                                        className="px-5 py-4 text-sm font-medium text-amber-700"
                                                    >
                                                        Račun nima uporabniškega profila.
                                                    </td>
                                                ) : jeTrenutniUporabnik ? (
                                                    <>
                                                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                            {
                                                                naziviPravic[
                                                                uporabnik.uporabniske_pravice as keyof typeof naziviPravic
                                                                ]
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                                Aktiven
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 text-right text-sm text-slate-500">
                                                            Brez sprememb
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td
                                                            colSpan={3}
                                                            className="px-5 py-4"
                                                        >
                                                            <form
                                                                action={shraniUporabnika}
                                                                className="flex flex-wrap items-center justify-end gap-4"
                                                            >
                                                                <select
                                                                    name="uporabniskePravice"
                                                                    defaultValue={
                                                                        uporabnik.uporabniske_pravice
                                                                    }
                                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                                                >
                                                                    <option value="administrator">
                                                                        Administrator
                                                                    </option>

                                                                    <option value="zaposleni">
                                                                        Zaposleni
                                                                    </option>

                                                                    <option value="partner">
                                                                        Partner
                                                                    </option>
                                                                </select>

                                                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                                    <input
                                                                        name="aktiven"
                                                                        type="checkbox"
                                                                        defaultChecked={
                                                                            uporabnik.aktiven
                                                                        }
                                                                        className="h-4 w-4 rounded border-slate-300"
                                                                    />

                                                                    Aktiven
                                                                </label>

                                                                <button
                                                                    type="submit"
                                                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                                                >
                                                                    Shrani
                                                                </button>
                                                            </form>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}