import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediOkvir } from "./actions";

type UrediOkvirPageProps = {
    params: Promise<{
        okvirId: string;
    }>;

    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function UrediOkvirPage({
    params,
    searchParams,
}: UrediOkvirPageProps) {
    const { okvirId: okvirIdBesedilo } = await params;
    const okvirId = Number(okvirIdBesedilo);

    if (!Number.isInteger(okvirId) || okvirId <= 0) {
        notFound();
    }

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const [
        rezultatOkvirja,
        rezultatBarv,
        rezultatDobaviteljev,
    ] = await Promise.all([
        supabase
            .from("okvir")
            .select(
                `
          id,
          vzorec,
          oznaka,
          barva_id,
          dobavitelj_id,
          sirina,
          prodajna_cena,
          nabavna_cena,
          na_prodaj
        `,
            )
            .eq("id", okvirId)
            .maybeSingle(),

        supabase.from("barva").select("id, naziv").order("naziv"),

        supabase
            .from("dobavitelj")
            .select("id, naziv")
            .order("naziv"),
    ]);

    if (rezultatOkvirja.error || !rezultatOkvirja.data) {
        notFound();
    }

    const okvir = rezultatOkvirja.data;
    const shraniOkvir = urediOkvir.bind(null, okvir.id);

    const { napaka } = await searchParams;

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri vzorec, širino in vnesene cene."
            : napaka === "shranjevanje"
                ? "Okvirja ni bilo mogoče shraniti."
                : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali · Okvirji
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi okvir
                        </h1>
                    </div>

                    <Link
                        href="/materiali/okvirji"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <form
                    action={shraniOkvir}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Urejanje podatkov okvirja
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Prodajna cena je cena na tekoči meter.
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

                    {(rezultatBarv.error || rezultatDobaviteljev.error) && (
                        <div
                            role="alert"
                            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                        >
                            Barv ali dobaviteljev ni bilo mogoče v celoti naložiti.
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="vzorec"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Vzorec *
                            </label>

                            <input
                                id="vzorec"
                                name="vzorec"
                                type="text"
                                required
                                placeholder="Na primer: 148/192 Zlata"
                                className={inputClassName}
                                defaultValue={okvir.vzorec}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="oznaka"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Oznaka
                            </label>

                            <input
                                id="oznaka"
                                name="oznaka"
                                type="text"
                                placeholder="Na primer: 148/192"
                                className={inputClassName}
                                defaultValue={okvir.oznaka ?? ""}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="barvaId"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Barva
                            </label>

                            <select
                                id="barvaId"
                                name="barvaId"
                                defaultValue={okvir.barva_id ?? ""}
                                className={inputClassName}
                            >
                                <option value="">Brez izbrane barve</option>

                                {(rezultatBarv.data ?? []).map((barva) => (
                                    <option key={barva.id} value={barva.id}>
                                        {barva.naziv}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="sirina"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Širina okvirja (cm)
                            </label>

                            <input
                                id="sirina"
                                name="sirina"
                                type="number"
                                min="0.01"
                                step="0.01"
                                className={inputClassName}
                                defaultValue={okvir.sirina ?? ""}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="dobaviteljId"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Dobavitelj
                            </label>

                            <select
                                id="dobaviteljId"
                                name="dobaviteljId"
                                defaultValue={okvir.dobavitelj_id ?? ""}
                                className={inputClassName}
                            >
                                <option value="">Brez dobavitelja</option>

                                {(rezultatDobaviteljev.data ?? []).map(
                                    (dobavitelj) => (
                                        <option
                                            key={dobavitelj.id}
                                            value={dobavitelj.id}
                                        >
                                            {dobavitelj.naziv}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="prodajnaCena"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Prodajna cena na meter (€) *
                            </label>

                            <input
                                id="prodajnaCena"
                                name="prodajnaCena"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className={inputClassName}
                                defaultValue={okvir.prodajna_cena}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="nabavnaCena"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Nabavna cena (€)
                            </label>

                            <input
                                id="nabavnaCena"
                                name="nabavnaCena"
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClassName}
                                defaultValue={okvir.nabavna_cena ?? ""}
                            />
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                            <input
                                name="naProdaj"
                                type="checkbox"
                                defaultChecked={okvir.na_prodaj}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    Okvir je na prodaj
                                </span>

                                <span className="mt-1 block text-sm text-slate-600">
                                    Aktivni okvir bo na voljo pri sestavi postavke.
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link
                            href="/materiali/okvirji"
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Prekliči
                        </Link>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                        >
                            Shrani spremembe
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}