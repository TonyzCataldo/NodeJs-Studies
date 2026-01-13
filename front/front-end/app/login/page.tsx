"use client";

import Link from "next/link";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useLogin } from "../../hooks/useLogin";

export default function Login() {
  const { action, isPending, state } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <Card>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Login</h1>
          <p className="text-sm text-gray-500">Entre para continuar</p>
        </div>

        <form action={action} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
            error={state.errors?.email?.[0]}
          />

          <Input
            name="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            required
            autoComplete="off"
            error={state.errors?.password?.[0]}
          />

          {state.errors?._form && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
              {state.errors._form[0]}
            </div>
          )}

          <Button type="submit" isLoading={isPending}>
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-blue-500 hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
