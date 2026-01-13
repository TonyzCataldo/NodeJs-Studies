"use client";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-8">Bem-vindo ao seu painel.</p>

      <form action={logoutAction}>
        <Button variant="outline" type="submit" className="w-auto">
          Sair (Logout)
        </Button>
      </form>
    </div>
  );
}
