"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const dodajStekloSchema = z.object({
  dokumentId: z.number().int().positive(),
  postavkaId: z.number().int().positive(),
  stekloId: z.coerce.number().int().positive(),
});

export async function dodajSteklo(
  dokumentId: number,
  postavkaId: number,
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const rezultat = dodajStekloSchema.safeParse({
    dokumentId,
    postavkaId,
    stekloId: formData.get("stekloId"),
  });

  if (!rezultat.success) {
    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/steklo?napaka=neveljavni-podatki`,
    );
  }

  const { data: postavka } = await supabase
    .from("narocilo_postavka")
    .select("id")
    .eq("id", rezultat.data.postavkaId)
    .eq("narocilo_id", rezultat.data.dokumentId)
    .maybeSingle();

  if (!postavka) {
    redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
  }

  const { error } = await supabase.rpc("dodaj_steklo_postavki", {
    p_postavka_id: postavka.id,
    p_steklo_id: rezultat.data.stekloId,
  });

  if (error) {
    console.error("Napaka pri dodajanju stekla:", error);

    const napaka =
      error.message.includes("že ima izbrano steklo")
        ? "steklo-ze-obstaja"
        : "shranjevanje";

    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/steklo?napaka=${napaka}`,
    );
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  redirect(`/dokumenti/${dokumentId}`);
}