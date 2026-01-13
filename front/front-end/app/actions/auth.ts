"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

export interface ActionState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
  email?: string;
}

export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const parsed = LoginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const response = await axios.post(`${process.env.API_URL}/auth/login`, {
      email,
      password,
    });

    const { accessToken, refreshToken } = response.data;
    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 0.2, // 12 min
      path: "/",
    });

    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    return {
      errors: {
        _form: [error.response?.data?.message || "Erro ao realizar login."],
      },
    };
  }
}

export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const parsed = RegisterSchema.safeParse(data);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    await axios.post(`${process.env.API_URL}/users`, {
      name,
      email,
      password,
    });

    return { success: true, email };
  } catch (error: any) {
    return {
      errors: {
        _form: [error.response?.data?.message || "Erro ao criar conta."],
      },
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  redirect("/login");
}

export async function verifyEmailAction(token: string) {
  try {
    // Call backend directly using API_URL env var
    await axios.post(`${process.env.API_URL}/auth/verify-email`, { token });
    return { success: true };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || "Falha na verificação",
      };
    }
    return { success: false, error: "Erro desconhecido" };
  }
}
