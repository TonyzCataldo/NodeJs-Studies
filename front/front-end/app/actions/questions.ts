"use server";

import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";

interface CreateBookParams {
  courseId: string;
  subjectId: string;
  limit: number;
  done?: boolean;
  correct?: boolean;
}

export async function createBookAction(params: CreateBookParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const response = await axios.post(
      `${process.env.API_URL}/session`,
      params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (err) {
    if (isAxiosError(err)) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to create session",
        data: null,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
      data: null,
    };
  }
}
