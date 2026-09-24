"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const spremembaUporabnikaSchema = z.object({
    authUserId: z.string().uuid(),
    uporabniskePravice: z.enum([
        "administrator",
        "zaposleni",
        "partner",
    ]),
    aktiven: z.boolean(),
});

export async function posodobiUporabnika(
    authUserId: string,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = spremembaUporabnikaSchema.safeParse({
        authUserId,
        uporabniskePravice: formData.get(
            "uporabniskePravice",
        ),
        aktiven: formData.get("aktiven") === "on",
    });

    if (!rezultat.success) {
        redirect("/uporabniki?napaka=neveljavni-podatki");
    }

    const { error } = await supabase.rpc(
        "admin_posodobi_uporabnika",
        {
            p_auth_user_id: rezultat.data.authUserId,
            p_uporabniske_pravice:
                rezultat.data.uporabniskePravice,
            p_aktiven: rezultat.data.aktiven,
        },
    );

    if (error) {
        console.error(
            "Napaka pri posodobitvi uporabnika:",
            error,
        );

        const sporocilo = error.message.toLowerCase();

        if (
            sporocilo.includes("svojega administratorskega")
        ) {
            redirect("/uporabniki?napaka=lastni-racun");
        }

        if (
            sporocilo.includes("zadnjega aktivnega administratorja")
        ) {
            redirect("/uporabniki?napaka=zadnji-administrator");
        }

        if (error.code === "42501") {
            redirect("/uporabniki?napaka=ni-dovoljenja");
        }

        redirect("/uporabniki?napaka=shranjevanje");
    }

    revalidatePath("/uporabniki");
    redirect("/uporabniki?uspeh=posodobljeno");
}

const brisanjeUporabnikaSchema = z.object({
    authUserId: z.string().uuid(),
});

export async function izbrisiUporabnika(
    authUserId: string,
) {
    const supabase = await createClient();

    const {
        data: podatkiZetona,
        error: napakaZetona,
    } = await supabase.auth.getClaims();

    const trenutniAuthUserId =
        podatkiZetona?.claims?.sub;

    if (napakaZetona || !trenutniAuthUserId) {
        redirect("/prijava");
    }

    const { data: jeAdministrator } =
        await supabase.rpc("je_administrator");

    if (!jeAdministrator) {
        redirect(
            "/uporabniki?napaka=ni-dovoljenja",
        );
    }

    const rezultat =
        brisanjeUporabnikaSchema.safeParse({
            authUserId,
        });

    if (!rezultat.success) {
        redirect(
            "/uporabniki?napaka=neveljavni-podatki",
        );
    }

    if (
        rezultat.data.authUserId ===
        trenutniAuthUserId
    ) {
        redirect(
            "/uporabniki?napaka=brisanje-lastnega-racuna",
        );
    }

    const admin = createAdminClient();

    const {
        data: uporabnik,
        error: napakaUporabnika,
    } = await admin
        .from("uporabnik")
        .select(
            "id, uporabniske_pravice, aktiven",
        )
        .eq(
            "auth_user_id",
            rezultat.data.authUserId,
        )
        .maybeSingle();

    if (napakaUporabnika) {
        console.error(
            "Napaka pri pridobivanju uporabnika:",
            napakaUporabnika,
        );

        redirect(
            "/uporabniki?napaka=brisanje",
        );
    }

    if (
        uporabnik?.uporabniske_pravice ===
        "administrator" &&
        uporabnik.aktiven
    ) {
        const {
            count,
            error: napakaStetja,
        } = await admin
            .from("uporabnik")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq(
                "uporabniske_pravice",
                "administrator",
            )
            .eq("aktiven", true);

        if (napakaStetja) {
            redirect(
                "/uporabniki?napaka=brisanje",
            );
        }

        if ((count ?? 0) <= 1) {
            redirect(
                "/uporabniki?napaka=zadnji-administrator",
            );
        }
    }

    if (uporabnik) {
        const { error: napakaNarocil } =
            await admin
                .from("narocilo")
                .update({
                    izdal_uporabnik_id: null,
                })
                .eq(
                    "izdal_uporabnik_id",
                    uporabnik.id,
                );

        if (napakaNarocil) {
            console.error(
                "Napaka pri odstranjevanju povezav naročil:",
                napakaNarocil,
            );

            redirect(
                "/uporabniki?napaka=brisanje",
            );
        }

        const { error: napakaZgodovine } =
            await admin
                .from(
                    "zgodovina_statusa_narocila",
                )
                .update({
                    spremenil_uporabnik_id: null,
                })
                .eq(
                    "spremenil_uporabnik_id",
                    uporabnik.id,
                );

        if (napakaZgodovine) {
            console.error(
                "Napaka pri odstranjevanju povezav zgodovine:",
                napakaZgodovine,
            );

            redirect(
                "/uporabniki?napaka=brisanje",
            );
        }
    }

    const { error: napakaBrisanjaAuth } =
        await admin.auth.admin.deleteUser(
            rezultat.data.authUserId,
        );

    if (napakaBrisanjaAuth) {
        console.error(
            "Napaka pri brisanju Auth uporabnika:",
            napakaBrisanjaAuth,
        );

        redirect(
            "/uporabniki?napaka=brisanje",
        );
    }

    // V primeru, da profil nima ON DELETE CASCADE.
    const { error: napakaBrisanjaProfila } =
        await admin
            .from("uporabnik")
            .delete()
            .eq(
                "auth_user_id",
                rezultat.data.authUserId,
            );

    if (napakaBrisanjaProfila) {
        console.error(
            "Napaka pri brisanju profila:",
            napakaBrisanjaProfila,
        );
    }

    revalidatePath("/uporabniki");

    redirect(
        "/uporabniki?uspeh=uporabnik-izbrisan",
    );
}