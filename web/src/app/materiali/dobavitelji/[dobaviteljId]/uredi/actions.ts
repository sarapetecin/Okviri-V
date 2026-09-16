"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoVNull = z
    .string()
    .trim()
    .transform((vrednost) => vrednost || null);

const dobaviteljSchema = z.object({
    dobaviteljId: z.number().int().positive(),
    naziv: z.string().trim().min(1).max(200),
    kratica: praznoVNull,
    telefonskaStevilka: praznoVNull,
    email: z
        .union([z.literal(""), z.string().trim().email()])
        .transform((vrednost) => vrednost || null),
    naslov: praznoVNull,
    spletnaStran: praznoVNull,
});

export async function urediDobavitelja(
    dobaviteljId: number,
    formData: FormData,
) {
    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = dobaviteljSchema.safeParse({
        dobaviteljId,
        naziv: formData.get("naziv"),
        kratica: formData.get("kratica"),
        telefonskaStevilka: formData.get("telefonskaStevilka"),
        email: formData.get("email"),
        naslov: formData.get("naslov"),
        spletnaStran: formData.get("spletnaStran"),
    });

    if (!rezultat.success) {
        redirect(
            `/materiali/dobavitelji/${dobaviteljId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("dobavitelj")
        .update({
            naziv: rezultat.data.naziv,
            kratica: rezultat.data.kratica,
            telefonska_stevilka:
                rezultat.data.telefonskaStevilka,
            email: rezultat.data.email,
            naslov: rezultat.data.naslov,
            spletna_stran: rezultat.data.spletnaStran,
        })
        .eq("id", rezultat.data.dobaviteljId);

    if (error) {
        console.error("Napaka pri urejanju dobavitelja:", error);
        redirect(
            `/materiali/dobavitelji/${dobaviteljId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/dobavitelji");
    redirect("/materiali/dobavitelji?uspeh=posodobljeno");
}
