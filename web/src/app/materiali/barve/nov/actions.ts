"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ naziv: z.string().trim().min(1).max(100) });

export async function ustvariBarvo(formData: FormData) {
  const supabase = await createClient();
  const { data: token, error: napakaTokena } = await supabase.auth.getClaims();
  if (napakaTokena || !token?.claims?.sub) redirect("/prijava");
  const rezultat = schema.safeParse({ naziv: formData.get("naziv") });
  if (!rezultat.success) redirect("/materiali/barve/nov?napaka=neveljavni-podatki");
  const { error } = await supabase.from("barva").insert({ naziv: rezultat.data.naziv });
  if (error) redirect(`/materiali/barve/nov?napaka=${error.code === "23505" ? "ze-obstaja" : "shranjevanje"}`);
  revalidatePath("/materiali"); revalidatePath("/materiali/barve");
  redirect("/materiali/barve");
}
