import { FastifyReply, FastifyRequest } from "fastify";
import { stableStringify } from "../../shared/cache/cache-keys";
import { CacheProvider } from "../../shared/cache/cache-provider";
import crypto from "node:crypto";

type HttpCacheOptions = {
  versionKey: string;
  visibility: "public" | "private";
  scope: string;
  query: unknown;
  maxAge: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  mustRevalidate?: boolean;
};

export class HttpCache {
  constructor(private cache: CacheProvider) {}

  private hash(obj: unknown) {
    const s = stableStringify(obj);
    return crypto.createHash("sha1").update(s).digest("hex").slice(0, 12);
  }

  async buildETag(opts: HttpCacheOptions) {
    const version = (await this.cache.get<string>(opts.versionKey)) ?? "1";
    const qhash = this.hash(opts.query);
    return `W/"${opts.scope}-v${version}-${qhash}"`;
  }

  applyHeaders(reply: FastifyReply, etag: string, opts: HttpCacheOptions) {
    const parts: string[] = [opts.visibility, `max-age=${opts.maxAge}`];

    if (typeof opts.sMaxAge === "number")
      parts.push(`s-maxage=${opts.sMaxAge}`);
    if (typeof opts.staleWhileRevalidate === "number")
      parts.push(`stale-while-revalidate=${opts.staleWhileRevalidate}`);
    if (opts.mustRevalidate) parts.push("must-revalidate");

    reply.header("ETag", etag);
    reply.header("Cache-Control", parts.join(", "));
    reply.header("Vary", "Accept-Encoding");
  }
  isNotModified(request: FastifyRequest, etag: string) {
    return request.headers["if-none-match"] === etag;
  }

  async handle(
    request: FastifyRequest,
    reply: FastifyReply,
    opts: HttpCacheOptions
  ) {
    const etag = await this.buildETag(opts);
    if (this.isNotModified(request, etag)) {
      this.applyHeaders(reply, etag, opts);
      reply.code(304).send();
      return { ended: true, etag };
    }
    this.applyHeaders(reply, etag, opts);
    return { ended: false, etag };
  }
}
