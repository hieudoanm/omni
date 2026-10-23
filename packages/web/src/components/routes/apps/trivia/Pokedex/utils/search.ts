export const fuzzyMatch = (text: string, query: string) => {
  if (!query) return 1;
  text = text.toLowerCase();
  query = query.toLowerCase();
  let ti = 0;
  for (let qi = 0; qi < query.length; qi++) {
    let found = false;
    while (ti < text.length) {
      if (text[ti++] === query[qi]) {
        found = true;
        break;
      }
    }
    if (!found) return 0;
  }
  return 1;
};
