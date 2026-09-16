import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ustvariBarvo } from "./actions";

type Props = { searchParams: Promise<{ napaka?: string }> };
export default async function NovaBarvaPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: token, error } = await supabase.auth.getClaims();
  if (error || !token?.claims?.sub) redirect("/prijava");
  const { napaka } = await searchParams;
  const sporocilo = napaka === "ze-obstaja" ? "Barva s tem nazivom že obstaja." : napaka ? "Barve ni bilo mogoče shraniti." : null;
  return <Obrazec naslov="Nova barva" opis="Vnesi naziv barve." action={ustvariBarvo} sporocilo={sporocilo}/>;
}

export function Obrazec({ naslov, opis, action, sporocilo, naziv = "" }: { naslov: string; opis: string; action: (data: FormData) => void | Promise<void>; sporocilo: string | null; naziv?: string }) {
  return <main className="min-h-screen bg-slate-100"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4"><div><p className="text-sm font-semibold uppercase text-slate-500">Materiali · Barve</p><h1 className="text-xl font-bold text-slate-900">{naslov}</h1></div><Link href="/materiali/barve" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Prekliči</Link></div></header><section className="mx-auto max-w-4xl px-6 py-10"><form action={action} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-2xl font-bold text-slate-900">Podatki barve</h2><p className="mt-2 text-sm text-slate-600">{opis}</p>{sporocilo && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{sporocilo}</p>}<label className="mt-7 block text-sm font-medium text-slate-700">Naziv *<input name="naziv" required maxLength={100} defaultValue={naziv} autoFocus className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"/></label><div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6"><Link href="/materiali/barve" className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700">Prekliči</Link><button className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white">Shrani barvo</button></div></form></section></main>;
}
