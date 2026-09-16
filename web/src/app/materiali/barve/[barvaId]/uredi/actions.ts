"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({ id: z.number().int().positive(), naziv: z.string().trim().min(1).max(100) });
export async function urediBarvo(id: number, formData: FormData) {
  const supabase = await createClient(); const { data: token, error: authError } = await supabase.auth.getClaims();
  if (authError || !token?.claims?.sub) redirect("/prijava");
  const rezultat = schema.safeParse({ id, naziv: formData.get("naziv") });
  if (!rezultat.success) redirect(`/materiali/barve/${id}/uredi?napaka=neveljavni-podatki`);
  const { error } = await supabase.from("barva").update({ naziv: rezultat.data.naziv }).eq("id", id);
  if (error) redirect(`/materiali/barve/${id}/uredi?napaka=${error.code === "23505" ? "ze-obstaja" : "shranjevanje"}`);
  revalidatePath("/materiali"); revalidatePath("/materiali/barve"); redirect("/materiali/barve");
}
