"use client";

import Link from "next/link";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useRegister } from "../../hooks/useRegister";

export default function Register() {
  const { action, isPending, state } = useRegister();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <Card>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Crie sua conta</h1>
          <p className="text-sm text-gray-500">Comece a estudar hoje</p>
        </div>

        {state.success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
              Verifique seu Email
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enviamos um link de confirmação para{" "}
              <strong>{state.email || "seu email"}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Clique no link para ativar sua conta e fazer login.
            </p>
            <Link href="/login">
              <Button variant="outline">Ir para Login</Button>
            </Link>
          </div>
        ) : (
          <>
            <form action={action} className="space-y-4">
              <Input
                name="name"
                type="text"
                label="Nome"
                placeholder="Seu nome completo"
                required
                error={state.errors?.name?.[0]}
              />

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
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="off"
                error={state.errors?.password?.[0]}
              />

              {state.errors?._form && (
                <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                  {state.errors._form[0]}
                </div>
              )}

              <Button type="submit" isLoading={isPending}>
                Criar Conta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-blue-500 hover:underline font-medium"
              >
                Entrar
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
