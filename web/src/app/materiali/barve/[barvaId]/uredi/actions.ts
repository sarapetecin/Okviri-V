"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const barvaSchema = z.object({
    barvaId: z.number().int().positive(),
    naziv: z.string().trim().min(1).max(100),
});

export async function urediBarvo(
    barvaId: number,
    formData: FormData,
) {
    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = barvaSchema.safeParse({
        barvaId,
        naziv: formData.get("naziv"),
    });

    if (!rezultat.success) {
        redirect(
            `/materiali/barve/${barvaId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("barva")
        .update({ naziv: rezultat.data.naziv })
        .eq("id", rezultat.data.barvaId);

    if (error) {
        console.error("Napaka pri urejanju barve:", error);
        redirect(
            `/materiali/barve/${barvaId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/barve");
    redirect("/materiali/barve?uspeh=posodobljeno");
}
