export function parseExtras(extras: string[], knownOptions: Set<string>) {
  const flags: Array<{ flag: string; value: string | null }> = [];
  const unknownTokens: string[] = [];
  const positionals: string[] = [];

  for (let i = 0; i < extras.length; i += 1) {
    const token = extras[i];

    if (token.startsWith("-")) {
      const next = extras[i + 1];
      const hasValue = next !== undefined && !next.startsWith("-");
      const value = hasValue ? next : null;

      if (knownOptions.has(token)) {
        flags.push({ flag: token, value });
      } else {
        unknownTokens.push(token);
        if (hasValue) {
          unknownTokens.push(next);
        }
      }

      if (hasValue) {
        i += 1;
      }

      continue;
    }

    positionals.push(token);
  }

  return { flags, unknownTokens, positionals };
}
