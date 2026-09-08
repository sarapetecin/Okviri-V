"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const novUporabnikSchema = z
    .object({
        uporabniskoIme: z
            .string()
            .trim()
            .min(2, "Uporabniško ime je prekratko.")
            .max(100),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email("E-poštni naslov ni veljaven."),

        geslo: z
            .string()
            .min(12, "Začasno geslo mora imeti najmanj 12 znakov.")
            .max(200),

        ponoviGeslo: z.string(),

        uporabniskePravice: z.enum([
            "administrator",
            "zaposleni",
            "partner",
        ]),

        aktiven: z.boolean(),
    })
    .refine(
        (podatki) => podatki.geslo === podatki.ponoviGeslo,
        {
            message: "Gesli se ne ujemata.",
            path: ["ponoviGeslo"],
        },
    );

export async function ustvariUporabnika(
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: jeAdministrator, error: napakaPravic } =
        await supabase.rpc("je_administrator");

    if (napakaPravic || !jeAdministrator) {
        redirect("/?napaka=ni-dovoljenja");
    }

    const rezultat = novUporabnikSchema.safeParse({
        uporabniskoIme: formData.get("uporabniskoIme"),
        email: formData.get("email"),
        geslo: formData.get("geslo"),
        ponoviGeslo: formData.get("ponoviGeslo"),
        uporabniskePravice: formData.get(
            "uporabniskePravice",
        ),
        aktiven: formData.get("aktiven") === "on",
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki uporabnika:",
            rezultat.error.flatten(),
        );

        redirect(
            "/uporabniki/nov?napaka=neveljavni-podatki",
        );
    }

    const admin = createAdminClient();

    const { data: obstojeciProfil } = await admin
        .from("uporabnik")
        .select("id")
        .eq(
            "uporabnisko_ime",
            rezultat.data.uporabniskoIme,
        )
        .maybeSingle();

    if (obstojeciProfil) {
        redirect(
            "/uporabniki/nov?napaka=uporabnisko-ime-obstaja",
        );
    }

    const {
        data: ustvarjeniPodatki,
        error: napakaUstvarjanja,
    } = await admin.auth.admin.createUser({
        email: rezultat.data.email,
        password: rezultat.data.geslo,
        email_confirm: true,
        user_metadata: {
            uporabnisko_ime: rezultat.data.uporabniskoIme,
        },
    });

    const ustvarjeniUporabnik =
        ustvarjeniPodatki.user;

    if (napakaUstvarjanja || !ustvarjeniUporabnik) {
        console.error(
            "Napaka pri ustvarjanju Auth uporabnika:",
            napakaUstvarjanja,
        );

        const emailObstaja =
            napakaUstvarjanja?.message
                .toLowerCase()
                .includes("already") ?? false;

        redirect(
            emailObstaja
                ? "/uporabniki/nov?napaka=email-obstaja"
                : "/uporabniki/nov?napaka=ustvarjanje",
        );
    }

    const { error: napakaProfila } = await admin
        .from("uporabnik")
        .update({
            uporabniske_pravice:
                rezultat.data.uporabniskePravice,
            aktiven: rezultat.data.aktiven,
            mora_spremeniti_geslo: true,
        })
        .eq("auth_user_id", ustvarjeniUporabnik.id);

    if (napakaProfila) {
        console.error(
            "Napaka pri posodobitvi profila:",
            napakaProfila,
        );

        const { error: napakaBrisanja } =
            await admin.auth.admin.deleteUser(
                ustvarjeniUporabnik.id,
            );

        if (napakaBrisanja) {
            console.error(
                "Začasnega Auth računa ni bilo mogoče odstraniti:",
                napakaBrisanja,
            );
        }

        redirect(
            "/uporabniki/nov?napaka=ustvarjanje-profila",
        );
    }

    revalidatePath("/uporabniki");

    redirect("/uporabniki?uspeh=uporabnik-ustvarjen");
}