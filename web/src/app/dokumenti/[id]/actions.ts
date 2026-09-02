"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const odstraniOkvirSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaOkvirId: z.number().int().positive(),
});

export async function odstraniOkvir(
    dokumentId: number,
    postavkaId: number,
    postavkaOkvirId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniOkvirSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaOkvirId,
    });

    if (!rezultat.success) {
        redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
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

    const { data: povezavaOkvirja } = await supabase
        .from("postavka_okvir")
        .select("id")
        .eq("id", rezultat.data.postavkaOkvirId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezavaOkvirja) {
        redirect(`/dokumenti/${dokumentId}?napaka=okvir-ne-obstaja`);
    }

    const { error } = await supabase.rpc("odstrani_okvir_postavke", {
        p_postavka_okvir_id: povezavaOkvirja.id,
    });

    if (error) {
        console.error("Napaka pri odstranjevanju okvirja:", error);
        redirect(`/dokumenti/${dokumentId}?napaka=odstranjevanje-okvirja`);
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const odstraniStekloSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaStekloId: z.number().int().positive(),
});

export async function odstraniSteklo(
    dokumentId: number,
    postavkaId: number,
    postavkaStekloId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniStekloSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaStekloId,
    });

    if (!rezultat.success) {
        redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
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

    const { data: povezavaStekla } = await supabase
        .from("postavka_steklo")
        .select("id")
        .eq("id", rezultat.data.postavkaStekloId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezavaStekla) {
        redirect(`/dokumenti/${dokumentId}?napaka=steklo-ne-obstaja`);
    }

    const { error } = await supabase.rpc("odstrani_steklo_postavke", {
        p_postavka_steklo_id: povezavaStekla.id,
    });

    if (error) {
        console.error("Napaka pri odstranjevanju stekla:", error);
        redirect(`/dokumenti/${dokumentId}?napaka=odstranjevanje-stekla`);
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const odstraniPaspartuSchema = z.object({
  dokumentId: z.number().int().positive(),
  postavkaId: z.number().int().positive(),
  postavkaPaspartuId: z.number().int().positive(),
});

export async function odstraniPaspartu(
  dokumentId: number,
  postavkaId: number,
  postavkaPaspartuId: number,
  formData: FormData,
) {
  void formData;

  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const rezultat = odstraniPaspartuSchema.safeParse({
    dokumentId,
    postavkaId,
    postavkaPaspartuId,
  });

  if (!rezultat.success) {
    redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
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

  const { data: povezavaPaspartuja } = await supabase
    .from("postavka_paspartu")
    .select("id")
    .eq("id", rezultat.data.postavkaPaspartuId)
    .eq("postavka_id", postavka.id)
    .maybeSingle();

  if (!povezavaPaspartuja) {
    redirect(`/dokumenti/${dokumentId}?napaka=paspartu-ne-obstaja`);
  }

  const { error } = await supabase.rpc("odstrani_paspartu_postavke", {
    p_postavka_paspartu_id: povezavaPaspartuja.id,
  });

  if (error) {
    console.error("Napaka pri odstranjevanju paspartuja:", error);

    redirect(
      `/dokumenti/${dokumentId}?napaka=odstranjevanje-paspartuja`,
    );
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  redirect(`/dokumenti/${dokumentId}`);
}