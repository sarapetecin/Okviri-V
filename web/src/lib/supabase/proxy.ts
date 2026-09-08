import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(name, value, options);
            },
          );
        },
      },
    },
  );

  const preusmeri = (pot: string) => {
    const redirectResponse = NextResponse.redirect(
      new URL(pot, request.url),
    );

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  };

  const pot = request.nextUrl.pathname;

  const jePrijavnaPot = pot === "/prijava";
  const jePotSpremembeGesla =
    pot === "/spremeni-geslo";
  const jePotDeaktiviranegaRacuna =
    pot === "/racun-deaktiviran";
  const jeAuthPot = pot.startsWith("/auth/");

  // Preveri in po potrebi osveži prijavno sejo.
  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  const authUserId = podatkiZetona?.claims?.sub;

  if (napakaZetona || !authUserId) {
    if (jePrijavnaPot || jeAuthPot) {
      return response;
    }

    return preusmeri("/prijava");
  }

  const { data: profil, error: napakaProfila } =
    await supabase
      .from("uporabnik")
      .select("aktiven, mora_spremeniti_geslo")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

  if (napakaProfila || !profil) {
    if (jePotDeaktiviranegaRacuna) {
      return response;
    }

    return preusmeri(
      "/racun-deaktiviran?razlog=profil",
    );
  }

  if (!profil.aktiven) {
    if (jePotDeaktiviranegaRacuna) {
      return response;
    }

    return preusmeri("/racun-deaktiviran");
  }

  if (profil.mora_spremeniti_geslo) {
    if (jePotSpremembeGesla) {
      return response;
    }

    return preusmeri("/spremeni-geslo");
  }

  if (
    jePrijavnaPot ||
    jePotSpremembeGesla ||
    jePotDeaktiviranegaRacuna
  ) {
    return preusmeri("/");
  }

  return response;
}