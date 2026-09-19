"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const dokumentSchema = z.object({
    dokumentId: z.number().int().positive(),
});

export async function oznaciKotDokoncano(
    dokumentId: number,
) {
    const supabase = await createClient();

    const {
        data: podatkiZetona,
        error: napakaZetona,
    } = await supabase.auth.getClaims();

    const authUserId =
        podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const rezultat =
        dokumentSchema.safeParse({
            dokumentId,
        });

    if (!rezultat.success) {
        redirect(
            "/dokumenti?napaka=neveljavni-podatki",
        );
    }

    const {
        data: uporabnik,
        error: napakaUporabnika,
    } = await supabase
        .from("uporabnik")
        .select(
            "uporabniske_pravice, aktiven, mora_spremeniti_geslo",
        )
        .eq("auth_user_id", authUserId)
        .maybeSingle();

    if (
        napakaUporabnika ||
        !uporabnik ||
        !uporabnik.aktiven ||
        uporabnik.mora_spremeniti_geslo
    ) {
        redirect("/");
    }

    const jeInterniUporabnik =
        uporabnik.uporabniske_pravice ===
        "administrator" ||
        uporabnik.uporabniske_pravice ===
        "zaposleni";

    if (!jeInterniUporabnik) {
        redirect(
            "/dokumenti?napaka=ni-dovoljenja",
        );
    }

    const {
        data: dokument,
        error: napakaDokumenta,
    } = await supabase
        .from("narocilo")
        .select("id, vrsta, status")
        .eq("id", rezultat.data.dokumentId)
        .maybeSingle();

    if (
        napakaDokumenta ||
        !dokument ||
        dokument.vrsta !== "narocilo"
    ) {
        redirect(
            "/dokumenti?napaka=dokument-ne-obstaja",
        );
    }

    if (
        dokument.status === "dokoncano" ||
        dokument.status === "rocno_zaprto" ||
        dokument.status === "preklicano"
    ) {
        redirect("/dokumenti?vrsta=narocilo");
    }

    const { error } = await supabase.rpc(
        "spremeni_status_dokumenta",
        {
            p_narocilo_id: dokument.id,
            p_novi_status: "dokoncano",
        },
    );

    if (error) {
        console.error(
            "Napaka pri zaključevanju naročila:",
            error,
        );

        redirect(
            "/dokumenti?vrsta=narocilo&napaka=sprememba-statusa",
        );
    }

    revalidatePath("/");
    revalidatePath("/dokumenti");
    revalidatePath(
        `/dokumenti/${dokument.id}`,
    );

    redirect("/dokumenti?vrsta=narocilo");
}