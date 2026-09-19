import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediStranko } from "./actions";

type UrediStrankoPageProps = {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function UrediStrankoPage({
    params,
    searchParams,
}: UrediStrankoPageProps) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { id } = await params;
    const strankaId = Number(id);

    if (!Number.isInteger(strankaId) || strankaId <= 0) {
        notFound();
    }

    const { data: stranka, error } = await supabase
        .from("stranka")
        .select(
            "id, naziv, telefonska_stevilka, email, hisni_naslov, davcni_zavezanec, davcna_stevilka",
        )
        .eq("id", strankaId)
        .maybeSingle();

    if (error || !stranka) {
        notFound();
    }

    const { napaka } = await searchParams;

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri vnesene podatke. Naziv je obvezen, e-poštni naslov pa mora biti veljaven."
            : napaka === "shranjevanje"
                ? "Sprememb ni bilo mogoče shraniti. Poskusi ponovno."
                : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Okviri V
                        </p>
                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi stranko
                        </h1>
                    </div>

                    <Link
                        href="/stranke"
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
                            Podatki stranke
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Spremeni podatke in jih shrani.
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

                    <form
                        action={urediStranko.bind(null, stranka.id)}
                        className="space-y-6"
                    >
                        <div>
                            <label
                                htmlFor="naziv"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Naziv stranke *
                            </label>
                            <input
                                id="naziv"
                                name="naziv"
                                type="text"
                                required
                                maxLength={200}
                                autoFocus
                                defaultValue={stranka.naziv}
                                className={inputClassName}
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="telefonskaStevilka"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Telefonska številka *
                                </label>
                                <input
                                    id="telefonskaStevilka"
                                    name="telefonskaStevilka"
                                    type="tel"
                                    required
                                    maxLength={50}
                                    autoComplete="tel"
                                    defaultValue={
                                        stranka.telefonska_stevilka ?? ""
                                    }
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    E-poštni naslov
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    defaultValue={stranka.email ?? ""}
                                    className={inputClassName}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="hisniNaslov"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Naslov
                            </label>
                            <input
                                id="hisniNaslov"
                                name="hisniNaslov"
                                type="text"
                                autoComplete="street-address"
                                defaultValue={stranka.hisni_naslov ?? ""}
                                className={inputClassName}
                            />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    name="davcniZavezanec"
                                    type="checkbox"
                                    defaultChecked={stranka.davcni_zavezanec}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-sm font-medium text-slate-800">
                                    Stranka je davčni zavezanec
                                </span>
                            </label>

                            <div className="mt-5">
                                <label
                                    htmlFor="davcnaStevilka"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Davčna številka
                                </label>
                                <input
                                    id="davcnaStevilka"
                                    name="davcnaStevilka"
                                    type="text"
                                    defaultValue={
                                        stranka.davcna_stevilka ?? ""
                                    }
                                    className={inputClassName}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                            <Link
                                href="/stranke"
                                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Prekliči
                            </Link>

                            <button
                                type="submit"
                                className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                Shrani spremembe
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
