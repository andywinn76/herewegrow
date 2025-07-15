export function toTitleCaseSmart(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if (word === word.toUpperCase() && word.length > 1) return word;
        return word[0].toUpperCase() + word.slice(1);
      })
      .join(" ");
  }