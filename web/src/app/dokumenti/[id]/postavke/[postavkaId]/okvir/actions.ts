"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const dodajOkvirSchema = z.object({
  dokumentId: z.number().int().positive(),
  postavkaId: z.number().int().positive(),
  okvirId: z.coerce.number().int().positive(),
});

export async function dodajOkvir(
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

  const rezultat = dodajOkvirSchema.safeParse({
    dokumentId,
    postavkaId,
    okvirId: formData.get("okvirId"),
  });

  if (!rezultat.success) {
    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/okvir?napaka=neveljavni-podatki`,
    );
  }

  const { data: postavka, error: napakaPostavke } = await supabase
    .from("narocilo_postavka")
    .select("id, narocilo_id")
    .eq("id", rezultat.data.postavkaId)
    .eq("narocilo_id", rezultat.data.dokumentId)
    .maybeSingle();

  if (napakaPostavke || !postavka) {
    redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
  }

  const { error } = await supabase.rpc("dodaj_okvir_postavki", {
    p_postavka_id: rezultat.data.postavkaId,
    p_okvir_id: rezultat.data.okvirId,
  });

  if (error) {
    console.error("Napaka pri dodajanju okvirja:", error);

    const napaka =
      error.message.includes("nima vnesene širine")
        ? "manjka-sirina"
        : "shranjevanje";

    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/okvir?napaka=${napaka}`,
    );
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  redirect(`/dokumenti/${dokumentId}`);
}