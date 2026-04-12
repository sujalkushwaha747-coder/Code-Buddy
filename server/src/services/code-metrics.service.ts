export type CodeMetrics = {
  lineCount: number;
  functionCount: number;
  loopCount: number;
  nestedLoopDepth: number;
  complexityApproximation: number;
  optimizationInsights: string[];
};

const countMatches = (source: string, pattern: RegExp) => {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
};

const isCommentOnlyLine = (line: string) =>
  /^(\/\/|#|\/\*|\*|\*\/)/.test(line.trim());

const isLoopLine = (line: string) =>
  /\bfor(each)?\b|\bwhile\b|\bdo\b/.test(line) || /^(for|while)\s+.+:$/.test(line.trim());

const isFunctionLine = (line: string) => {
  const trimmed = line.trim();

  if (!trimmed || isCommentOnlyLine(trimmed)) {
    return false;
  }

  const patterns = [
    /^async\s+function\s+\w+\s*\(/,
    /^function\s+\w+\s*\(/,
    /^(const|let|var)\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>/,
    /^(const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>/,
    /^(const|let|var)\s+\w+\s*=\s*[^=]+\([^)]*\)\s*=>/,
    /^def\s+\w+\s*\(/,
    /^(public|private|protected|static|async|\s)*\s*[A-Za-z_][\w<>\[\]]*\s+\w+\s*\([^;]*\)\s*\{/,
  ];

  if (patterns.some((pattern) => pattern.test(trimmed))) {
    return true;
  }

  if (
    /^[A-Za-z_]\w*\s*\([^)]*\)\s*\{?$/.test(trimmed) &&
    !/^(if|for|while|switch|catch|return)\b/.test(trimmed)
  ) {
    return true;
  }

  return false;
};

const countFunctions = (lines: string[]) =>
  lines.reduce((count, line) => count + (isFunctionLine(line) ? 1 : 0), 0);

const countLoops = (lines: string[]) =>
  lines.reduce((count, line) => count + (isLoopLine(line) ? 1 : 0), 0);

const calculateNestedLoopDepth = (lines: string[]) => {
  const stack: Array<{ isLoop: boolean; braceDepth: number; indentDepth: number }> = [];
  let braceDepth = 0;
  let maxDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || isCommentOnlyLine(trimmed)) {
      continue;
    }

    const closingBraces = countMatches(trimmed, /\}/g);
    braceDepth = Math.max(0, braceDepth - closingBraces);

    const indentDepth = line.match(/^\s*/)?.[0].length ?? 0;

    while (
      stack.length > 0 &&
      (stack[stack.length - 1].braceDepth > braceDepth ||
        stack[stack.length - 1].indentDepth >= indentDepth)
    ) {
      stack.pop();
    }

    const activeLoopDepth = stack.reduce(
      (count, context) => count + (context.isLoop ? 1 : 0),
      0,
    );
    const loopLine = isLoopLine(trimmed);

    if (loopLine) {
      maxDepth = Math.max(maxDepth, activeLoopDepth + 1);
    }

    const opensBraceBlock = trimmed.includes("{");
    const opensIndentedBlock = /:\s*(#.*)?$/.test(trimmed) && !trimmed.includes("{");

    if (opensBraceBlock || opensIndentedBlock || loopLine) {
      stack.push({
        isLoop: loopLine,
        braceDepth: braceDepth + (opensBraceBlock ? 1 : 0),
        indentDepth,
      });
    }

    braceDepth += countMatches(trimmed, /\{/g);
  }

  return maxDepth;
};

const calculateComplexityApproximation = (code: string) => {
  const branchCount =
    countMatches(code, /\bif\b/g) +
    countMatches(code, /\belse\s+if\b/g) +
    countMatches(code, /\bfor(each)?\b/g) +
    countMatches(code, /\bwhile\b/g) +
    countMatches(code, /\bcase\b/g) +
    countMatches(code, /\bcatch\b/g) +
    countMatches(code, /\?/g) +
    countMatches(code, /&&/g) +
    countMatches(code, /\|\|/g);

  return Math.max(1, branchCount + 1);
};

export const buildOptimizationInsights = (
  metrics: Omit<CodeMetrics, "optimizationInsights">,
) => {
  const insights: string[] = [];

  if (metrics.nestedLoopDepth >= 2) {
    insights.push(
      "Nested loops detected. If you are comparing collections, consider using a hashmap or set to reduce repeated O(n^2) scans.",
    );
  }

  if (metrics.complexityApproximation >= 10) {
    insights.push(
      "Branching complexity is high. Consider splitting logic into smaller functions with clearer responsibilities.",
    );
  }

  if (metrics.functionCount <= 1 && metrics.lineCount >= 40) {
    insights.push(
      "This code has low functional decomposition for its size. Extracting helper functions can improve readability and testability.",
    );
  }

  if (metrics.loopCount >= 3) {
    insights.push(
      "Several loops were detected. Review whether any iterations can be combined, memoized, or replaced with indexed lookups.",
    );
  }

  if (insights.length === 0) {
    insights.push("No major structural optimization warnings were detected from the static metrics.");
  }

  return insights;
};

export const calculateCodeMetrics = (code: string) => {
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  const meaningfulLines = lines.filter((line) => line.trim().length > 0);

  const baseMetrics = {
    lineCount: meaningfulLines.length,
    functionCount: countFunctions(lines),
    loopCount: countLoops(lines),
    nestedLoopDepth: calculateNestedLoopDepth(lines),
    complexityApproximation: calculateComplexityApproximation(code),
  };

  return {
    ...baseMetrics,
    optimizationInsights: buildOptimizationInsights(baseMetrics),
  };
};

export const hydrateStoredCodeMetrics = (
  metrics: Omit<CodeMetrics, "optimizationInsights">,
): CodeMetrics => ({
  ...metrics,
  optimizationInsights: buildOptimizationInsights(metrics),
});
