import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import LoginForm from "@/components/Admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const authed = await isAuthenticatedServer();
  if (authed) redirect("/admin/dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-museum-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-museum-line bg-museum-panel/70 p-8">
        <p className="font-display text-2xl text-museum-text">Sergi Yönetimi</p>
        <p className="mt-1 mb-6 text-sm text-museum-muted">
          Devam etmek için giriş yapın.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
