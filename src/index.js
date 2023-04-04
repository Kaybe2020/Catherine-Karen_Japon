// Importation des fichiers CSV
import { csv } from "d3-fetch";


//*** Traduction Kanji *********************************************************************************/
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
    });
    console.log(kanjiListe);
  })
  .catch(function (error) {
    console.log(error);
  });


//*** Haiku ********************************************************************************/
csv("../data/all_haiku.csv")
  .then(function (data) {
    // Code de la visualisation ()
    let haikuListe = {
      haikus: [],
      haijin: []
    }
    data.forEach((haiku) => {
      //affiche les nouveaux haiku
      haikuListe.haikus.push([haiku.ligne0, haiku.ligne1, haiku.ligne2]);
      haikuListe.haijin.push(haiku.source);
    });
    console.log(haikuListe);
  });


//*** Sakura ********************************************************************************/









//*** Ramen ********************************************************************************/
csv("../data/ramen-ratings.csv")
  .then(function (data) {
    let ramenJapon = []
    data.forEach((ramen) => {
      // trier les informations et ne prendre que les ramens du Japon
      if (ramen.Country == "Japan")
        ramenJapon.push({
          nom: ramen.Brand,
          description: ramen.Variety,
          topTen: ramen.Stars
        });
    });
    console.log(ramenJapon);
  });



