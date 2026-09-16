import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Obrazec } from "../../nov/page";
import { urediDobavitelja } from "./actions";
type Props = { params: Promise<{ dobaviteljId: string }>; searchParams: Promise<{ napaka?: string }> };
export default async function UrediDobaviteljaPage({ params, searchParams }: Props) { const id = Number((await params).dobaviteljId); if (!Number.isInteger(id) || id <= 0) notFound(); const supabase = await createClient(); const { data: token, error: authError } = await supabase.auth.getClaims(); if (authError || !token?.claims?.sub) redirect("/prijava"); const { data, error } = await supabase.from("dobavitelj").select("naziv, kratica, telefonska_stevilka, email, naslov, spletna_stran").eq("id", id).maybeSingle(); if (error || !data) notFound(); const { napaka } = await searchParams; return <Obrazec naslov="Uredi dobavitelja" action={urediDobavitelja.bind(null, id)} sporocilo={napaka ? "Sprememb ni bilo mogoče shraniti." : null} vrednosti={data}/>; }
