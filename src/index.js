import * as d3 from "d3";
// Importation des fichiers CSV
import { csv } from "d3-fetch";
csv("../data/joyo_kanji.csv").then(function (data) {
  // Code de la visualisation ()
  console.log("Test 1", data);
  data.forEach((kanji) => {
    // mettre les éléments  des données csv de l'index 2 dans un tableau
    let oldKanji = [];
    let newKanji = [];
    if (kanji[2] == "old") {
      oldKanji.push(kanji);
      console.log("old kanji", oldKanji);
    } else if (kanji[1] == "new") {
      newKanji.push(kanji);
    }
  });
});
