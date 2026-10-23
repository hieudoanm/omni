export const convertBase = (number: number | string) => {
  return {
    from: (fromBase: number) => {
      const decimal = Number.parseInt(number.toString(), fromBase);
      return {
        to: (toBase: number): string => {
          if (Number.isNaN(decimal)) {
            return 'Invalid number or base';
          }
          return decimal.toString(toBase).toUpperCase();
        },
      };
    },
  };
};
