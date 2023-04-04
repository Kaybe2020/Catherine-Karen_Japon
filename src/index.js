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
        // prendre nom, description et étoiles des ramens
        ramenJapon.push({
          nom: ramen.Brand,
          description: ramen.Variety,
          topTen: ramen.Stars
        });
    });
    console.log(ramenJapon);
  });


//*** Haijin ********************************************************************************/
//le Haijin s'exécute dans la div qui lui est dédiée (#haijin)
const svgHaijin = d3.select("#haijin")
const perso = svgHaijin.select("#haijinPerso")

  // le haijin bouge seulement quand il y a du scroll
  .on("scroll", function () {
    function moveHaijin() {
      perso
        .transition()
        .duration(1000)
        // .ease(d3.easeLinear)
        .attr("transform", function () {
          return d3.interpolateString("translateY(0, -10px)", "translate(0, 0)");
        })
        .transition()
        .duration(1000)
        .attr("transform", function () {
          return d3.interpolateString("translateY(0, 0px)", "translate(0, -10)");
        })
        .on("end", moveHaijin);
    }
    moveHaijin();
  });


