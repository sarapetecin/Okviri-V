"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const vrstaSchema = z.enum([
    "ponudba",
    "narocilo",
]);

export async function ustvariPrazenDokument(
    vrstaDokumenta: string,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    const authUserId = podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const { data: uporabnik, error: napakaUporabnika } =
        await supabase
            .from("uporabnik")
            .select(
                "id, uporabnisko_ime, uporabniske_pravice, aktiven, mora_spremeniti_geslo",
            )
            .eq("auth_user_id", authUserId)
            .single();

    if (
        napakaUporabnika ||
        !uporabnik ||
        !uporabnik.aktiven ||
        uporabnik.mora_spremeniti_geslo
    ) {
        redirect("/dokumenti?napaka=uporabnik");
    }

    const rezultat =
        vrstaSchema.safeParse(vrstaDokumenta);

    if (!rezultat.success) {
        redirect(
            "/dokumenti?napaka=neveljavna-vrsta",
        );
    }

    const vrsta =
        uporabnik.uporabniske_pravice === "partner"
            ? "ponudba"
            : rezultat.data;

    const { data: dokument, error } = await supabase
        .from("narocilo")
        .insert({
            vrsta,
            status: "osnutek",

            stranka_id: null,
            stranka_naziv: "Brez izbrane stranke",
            stranka_telefonska_stevilka: null,
            stranka_email: null,
            stranka_hisni_naslov: null,
            stranka_naziv_podjetja: null,
            stranka_davcna_stevilka: null,
            stranka_davcni_zavezanec: false,

            rok_izdelave: null,
            popust: 0,

            izdal_uporabnik_id: uporabnik.id,
            izdal_ime: uporabnik.uporabnisko_ime,
        })
        .select("id")
        .single();

    if (error || !dokument) {
        console.error(
            "Napaka pri ustvarjanju praznega dokumenta:",
            error,
        );

        redirect(
            `/dokumenti?vrsta=${vrsta}&napaka=shranjevanje`,
        );
    }

    revalidatePath("/");
    revalidatePath("/dokumenti");

    redirect(`/dokumenti/${dokument.id}`);
}