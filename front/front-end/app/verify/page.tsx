"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyEmailAction } from "../actions/auth";
import { Card } from "../../components/ui/Card";
import Link from "next/link";
import { Button } from "../../components/ui/Button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token inválido ou não fornecido.");
      return;
    }

    verifyEmailAction(token)
      .then((result) => {
        if (result.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Falha ao verificar email.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro inesperado.");
      });
  }, [token, router]);

  return (
    <Card>
      <div className="text-center">
        {status === "verifying" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Verificando...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {status === "success" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-green-600">
              Email Verificado!
            </h1>
            <p className="mb-4 text-gray-600">
              Sua conta foi ativada com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para login...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              Erro na Verificação
            </h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <Link href="/login">
              <Button>Voltar para Login</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
