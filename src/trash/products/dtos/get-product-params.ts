type sort = "value_asc" | "value_desc" | "newest";
export interface GetProductParams {
  q?: string | undefined;
  page: number;
  limit: number;
  sort: sort;
  min?: number | undefined;
  max?: number | undefined;
}
