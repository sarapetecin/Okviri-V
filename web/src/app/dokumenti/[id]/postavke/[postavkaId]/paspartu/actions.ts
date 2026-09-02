"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const dodajPaspartuSchema = z.object({
  dokumentId: z.number().int().positive(),
  postavkaId: z.number().int().positive(),
  paspartuId: z.coerce.number().int().positive(),
});

export async function dodajPaspartu(
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

  const rezultat = dodajPaspartuSchema.safeParse({
    dokumentId,
    postavkaId,
    paspartuId: formData.get("paspartuId"),
  });

  if (!rezultat.success) {
    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/paspartu?napaka=neveljavni-podatki`,
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

  const { error } = await supabase.rpc("dodaj_paspartu_postavki", {
    p_postavka_id: postavka.id,
    p_paspartu_id: rezultat.data.paspartuId,
  });

  if (error) {
    console.error("Napaka pri dodajanju paspartuja:", error);

    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/paspartu?napaka=shranjevanje`,
    );
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  redirect(`/dokumenti/${dokumentId}`);
}