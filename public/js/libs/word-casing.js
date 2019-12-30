let toSentenceCase = (word = "") => {
  word = word.toLowerCase().trim();
  let result = "";
  if (word.includes(" ")) {
    let wordArr = [];
    let words = word.split(" ");
    words.forEach(word => {
      wordArr.push(word.replace(word.charAt(0), word.charAt(0).toUpperCase()));
    });

    return (wordArr = wordArr.join(" "));
  }
  result = word.replace(word.charAt(0), word.charAt(0).toUpperCase());
  return result;
};
