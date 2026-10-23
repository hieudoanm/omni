export interface Word {
  word: string;
  results: {
    definition: string;
    partOfSpeech: string;
    synonyms: string[];
    antonyms: string[];
    typeOf: string[];
    hasTypes: string[];
    derivation: string[];
    examples: string[];
  }[];
}

export const getWord = async (word: string): Promise<Word> => {
  try {
    const base: string =
      'https://raw.githubusercontent.com/hieudoanm/hieudoanm/refs/heads/master/drive/english/words';
    const url: string = `${base}/${encodeURI(word)}.json`;
    const response = await fetch(url);
    const data: Word = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return { word, results: [] };
  }
};
