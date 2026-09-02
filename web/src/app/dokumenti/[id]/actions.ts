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