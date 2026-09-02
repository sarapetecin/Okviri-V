"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function izbrisiPostavko(
  dokumentId: number,
  postavkaId: number,
) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  if (
    !Number.isInteger(dokumentId) ||
    dokumentId <= 0 ||
    !Number.isInteger(postavkaId) ||
    postavkaId <= 0
  ) {
    redirect("/dokumenti");
  }

  const { data: postavka, error: napakaPostavke } = await supabase
    .from("narocilo_postavka")
    .select("id")
    .eq("id", postavkaId)
    .eq("narocilo_id", dokumentId)
    .maybeSingle();

  if (napakaPostavke || !postavka) {
    redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
  }

  const { error: napakaBrisanja } = await supabase.rpc(
    "izbrisi_celotno_postavko",
    {
      p_postavka_id: postavka.id,
    },
  );

  if (napakaBrisanja) {
    console.error(
      "Napaka pri brisanju celotne postavke:",
      napakaBrisanja,
    );

    redirect(`/dokumenti/${dokumentId}?napaka=brisanje-postavke`);
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  revalidatePath(`/dokumenti/${dokumentId}/natisni`);
  revalidatePath("/dokumenti");

  redirect(`/dokumenti/${dokumentId}`);
}