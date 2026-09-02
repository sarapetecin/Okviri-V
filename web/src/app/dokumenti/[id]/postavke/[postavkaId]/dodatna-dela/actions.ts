"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const dodajDodatnoDeloSchema = z.object({
  dokumentId: z.number().int().positive(),
  postavkaId: z.number().int().positive(),
  dodatnoDeloId: z.coerce.number().int().positive(),
});

export async function dodajDodatnoDelo(
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

  const rezultat = dodajDodatnoDeloSchema.safeParse({
    dokumentId,
    postavkaId,
    dodatnoDeloId: formData.get("dodatnoDeloId"),
  });

  if (!rezultat.success) {
    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/dodatna-dela?napaka=neveljavni-podatki`,
    );
  }

  const { data: postavka } = await supabase
    .from("narocilo_postavka")
    .select("id")
    .eq("id", rezultat.data.postavkaId)
    .eq("narocilo_id", rezultat.data.dokumentId)
    .maybeSingle();

  if (!postavka) {
    redirect(`/dokumenti/${dokumentId}`);
  }

  const { error } = await supabase.rpc(
    "dodaj_dodatno_delo_postavki",
    {
      p_postavka_id: postavka.id,
      p_dodatno_delo_id: rezultat.data.dodatnoDeloId,
    },
  );

  if (error) {
    console.error("Napaka pri dodajanju dodatnega dela:", error);

    const napaka = error.message.includes("že dodano")
      ? "delo-ze-obstaja"
      : "dodajanje";

    redirect(
      `/dokumenti/${dokumentId}/postavke/${postavkaId}/dodatna-dela?napaka=${napaka}`,
    );
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  redirect(`/dokumenti/${dokumentId}`);
}