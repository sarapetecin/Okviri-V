"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoVNull = z
    .string()
    .trim()
    .transform((vrednost) => vrednost || null);

const urejanjeStrankeSchema = z.object({
    strankaId: z.number().int().positive(),

    naziv: z
        .string()
        .trim()
        .min(1, "Naziv stranke je obvezen.")
        .max(200, "Naziv stranke je predolg."),

    telefonskaStevilka: z
        .string()
        .trim()
        .min(
            1,
            "Telefonska številka je obvezna.",
        )
        .max(
            50,
            "Telefonska številka je predolga.",
        ),

    email: z
        .union([
            z.literal(""),
            z.string().trim().email("E-poštni naslov ni veljaven."),
        ])
        .transform((vrednost) => vrednost || null),

    hisniNaslov: praznoVNull,
    davcnaStevilka: praznoVNull,
    davcniZavezanec: z.boolean(),
});

export async function urediStranko(
    strankaId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = urejanjeStrankeSchema.safeParse({
        strankaId,
        naziv: formData.get("naziv"),
        telefonskaStevilka: formData.get("telefonskaStevilka"),
        email: formData.get("email"),
        hisniNaslov: formData.get("hisniNaslov"),
        davcnaStevilka: formData.get("davcnaStevilka"),
        davcniZavezanec: formData.get("davcniZavezanec") === "on",
    });

    if (!rezultat.success) {
        redirect(
            `/stranke/${strankaId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("stranka")
        .update({
            naziv: rezultat.data.naziv,
            telefonska_stevilka: rezultat.data.telefonskaStevilka,
            email: rezultat.data.email,
            hisni_naslov: rezultat.data.hisniNaslov,
            davcna_stevilka: rezultat.data.davcnaStevilka,
            davcni_zavezanec: rezultat.data.davcniZavezanec,
        })
        .eq("id", rezultat.data.strankaId);

    if (error) {
        console.error("Napaka pri urejanju stranke:", error);
        redirect(
            `/stranke/${strankaId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/stranke");
    revalidatePath(`/stranke/${strankaId}/uredi`);
    redirect("/stranke?uspeh=stranka-posodobljena");
}
