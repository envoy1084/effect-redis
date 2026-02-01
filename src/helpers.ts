/** biome-ignore-all lint/suspicious/noExplicitAny: safe */
import { Effect } from "effect";

import { RedisError } from "./errors";

export type ExecStrategy<Mode extends "async" | "queue"> = {
  readonly mode: Mode;

  run<F extends (...args: any[]) => any>(
    self: unknown,
    fn: F,
    args: Parameters<F>,
  ): Effect.Effect<any, RedisError>;
};
export type CommandGroup<
  TClient,
  Keys extends readonly (keyof TClient)[],
  Mode extends "async" | "queue",
> = {
  [K in Keys[number]]: (
    ...args: TClient[K] extends (...a: infer A) => any ? A : never
  ) => Mode extends "async"
    ? Effect.Effect<
        TClient[K] extends (...a: any[]) => Promise<infer R> ? R : never,
        RedisError
      >
    : Effect.Effect<void, never>;
};

export function makeCommandGroup<
  TClient,
  const Keys extends readonly (keyof TClient)[],
  Mode extends "async" | "queue",
>(
  client: TClient,
  keys: Keys,
  exec: ExecStrategy<Mode>,
): CommandGroup<TClient, Keys, Mode> {
  const out: Record<string, unknown> = {};

  for (const k of keys) {
    const fn = (client as any)[k];
    out[k as string] = (...args: any[]) => exec.run(client, fn, args);
  }

  return out as any;
}

export const AsyncExec: ExecStrategy<"async"> = {
  mode: "async" as const,
  run(self, fn, args) {
    return Effect.tryPromise({
      catch: (e) => new RedisError({ cause: e }),
      try: () => fn.apply(self, args),
    });
  },
};

export const QueueExec: ExecStrategy<"queue"> = {
  mode: "queue",
  run(self, fn, args) {
    return Effect.sync(() => {
      fn.apply(self, args);
    });
  },
};
