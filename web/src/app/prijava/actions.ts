"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function prijava(formData: FormData) {
  const email = formData.get("email");
  const geslo = formData.get("geslo");

  if (typeof email !== "string" || typeof geslo !== "string") {
    redirect("/prijava?napaka=manjkajoci-podatki");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: geslo,
  });

  if (error) {
    redirect("/prijava?napaka=napacna-prijava");
  }

  revalidatePath("/", "layout");
  redirect("/");
}