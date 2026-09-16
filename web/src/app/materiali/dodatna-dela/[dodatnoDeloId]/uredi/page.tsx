import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Obrazec } from "../../nov/page";
import { urediDodatnoDelo } from "./actions";
type Props = { params: Promise<{ dodatnoDeloId: string }>; searchParams: Promise<{ napaka?: string }> };
export default async function UrediDodatnoDeloPage({ params, searchParams }: Props) { const id = Number((await params).dodatnoDeloId); if (!Number.isInteger(id) || id <= 0) notFound(); const supabase = await createClient(); const { data: token, error: authError } = await supabase.auth.getClaims(); if (authError || !token?.claims?.sub) redirect("/prijava"); const { data, error } = await supabase.from("dodatna_dela").select("naziv, cena, cena_na_m, cena_na_m2, na_prodaj").eq("id", id).maybeSingle(); if (error || !data) notFound(); const { napaka } = await searchParams; const sporocilo = napaka === "ze-obstaja" ? "Dodatno delo s tem nazivom že obstaja." : napaka ? "Sprememb ni bilo mogoče shraniti." : null; return <Obrazec naslov="Uredi dodatno delo" action={urediDodatnoDelo.bind(null, id)} sporocilo={sporocilo} vrednosti={data}/>; }
