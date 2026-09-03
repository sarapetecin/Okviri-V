import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediSteklo } from "./actions";

type UrediStekloPageProps = {
    params: Promise<{
        stekloId: string;
    }>;

    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function UrediStekloPage({
    params,
    searchParams,
}: UrediStekloPageProps) {
    const { stekloId: stekloIdBesedilo } = await params;
    const { napaka } = await searchParams;

    const stekloId = Number(stekloIdBesedilo);

    if (!Number.isInteger(stekloId) || stekloId <= 0) {
        notFound();
    }

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const [
        { data: steklo, error: napakaStekla },
        { data: dobavitelji, error: napakaDobaviteljev },
    ] = await Promise.all([
        supabase
            .from("steklo")
            .select(`
        id,
        oznaka,
        naziv,
        prodajna_cena,
        nabavna_cena,
        dobavitelj_id,
        na_prodaj
      `)
            .eq("id", stekloId)
            .maybeSingle(),

        supabase
            .from("dobavitelj")
            .select("id, naziv")
            .order("naziv"),
    ]);

    if (napakaStekla || !steklo) {
        notFound();
    }

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri oznako, naziv in vnesene cene."
            : napaka === "shranjevanje"
                ? "Sprememb stekla ni bilo mogoče shraniti."
                : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    const shraniSteklo = urediSteklo.bind(
        null,
        steklo.id,
    );

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali · Stekla
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi steklo
                        </h1>
                    </div>

                    <Link
                        href="/materiali/stekla"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <form
                    action={shraniSteklo}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Podatki stekla
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Spremeni podatke izbranega stekla.
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

                    {napakaDobaviteljev && (
                        <div
                            role="alert"
                            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                        >
                            Dobaviteljev ni bilo mogoče naložiti.
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="oznaka"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Oznaka *
                            </label>

                            <input
                                id="oznaka"
                                name="oznaka"
                                type="text"
                                required
                                maxLength={100}
                                defaultValue={steklo.oznaka}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="naziv"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Naziv *
                            </label>

                            <input
                                id="naziv"
                                name="naziv"
                                type="text"
                                required
                                maxLength={200}
                                defaultValue={steklo.naziv}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="prodajnaCena"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Prodajna cena na m² (€) *
                            </label>

                            <input
                                id="prodajnaCena"
                                name="prodajnaCena"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                defaultValue={steklo.prodajna_cena}
                                className={inputClassName}
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
                                defaultValue={steklo.nabavna_cena ?? ""}
                                className={inputClassName}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="dobaviteljId"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Dobavitelj
                            </label>

                            <select
                                id="dobaviteljId"
                                name="dobaviteljId"
                                defaultValue={
                                    steklo.dobavitelj_id?.toString() ?? ""
                                }
                                className={inputClassName}
                            >
                                <option value="">Brez dobavitelja</option>

                                {(dobavitelji ?? []).map((dobavitelj) => (
                                    <option
                                        key={dobavitelj.id}
                                        value={dobavitelj.id}
                                    >
                                        {dobavitelj.naziv}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                            <input
                                name="naProdaj"
                                type="checkbox"
                                defaultChecked={steklo.na_prodaj}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    Steklo je na prodaj
                                </span>

                                <span className="mt-1 block text-sm text-slate-600">
                                    Aktivno steklo bo na voljo pri sestavi postavke.
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link
                            href="/materiali/stekla"
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Prekliči
                        </Link>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
                        >
                            Shrani spremembe
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}