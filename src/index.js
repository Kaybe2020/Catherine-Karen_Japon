// Importation des fichiers CSV
import { csv } from "d3-fetch";


//*** Traduction Kanji *********************/
csv("../data/joyo_kanji.csv")
  .then(function (data) {
    // Code de la visualisation ()
    let kanjiListe = {
      ecritJap: [],
      traduction: []
    }
    data.forEach((kanji) => {
      //affiche les nouveaux kanji
      kanjiListe.ecritJap.push(kanji.new);
      //  fetch de lapi qui retourne qqch et afficher ce truc 



    });
    console.log(kanjiListe);
  })
  .catch(function (error) {
    console.log(error);
  });





