import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 para que el navegador pase de POST a GET en la redirección.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
