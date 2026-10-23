export const computeDiff = (a: string, b: string): string => {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const result: string[] = [];
  const maxLen = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= linesA.length) {
      result.push(`+ ${linesB[i]}`);
    } else if (i >= linesB.length) {
      result.push(`- ${linesA[i]}`);
    } else if (linesA[i] !== linesB[i]) {
      result.push(`- ${linesA[i]}`);
      result.push(`+ ${linesB[i]}`);
    } else {
      result.push(`  ${linesA[i]}`);
    }
  }
  return result.join('\n');
};
