import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // accept BOTH naming styles
    const account = String(body.account ?? body.username ?? "").trim();
    const passcode = String(body.passcode ?? body.password ?? "").trim();

    // prototype credentials
    const okAccount = account.toLowerCase() === "klub";
    const okPass = passcode === "1234";

    if (!okAccount || !okPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    // cookie used by your frontend to decide "logged in"
    res.cookies.set("session", "demo", {
      httpOnly: false, // so document.cookie can see it (your current frontend uses document.cookie)
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

// Optional: if someone visits /api/login in browser, show a message instead of 405
export async function GET() {
  return NextResponse.json({ message: "Use POST to login" }, { status: 200 });
}