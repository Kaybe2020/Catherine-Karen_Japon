// Importation Select, utile pour le Burger et le Haijin
import { select } from "d3-selection";
// Importation des fichiers CSV
import { csv } from "d3-fetch";

//*** menu burger **************************************************************************************/
select("#menu").on("click", function () {
  const menu = document.querySelector("#menuDeroulant").classList;
  if (menu.contains("active")) {
    menu.remove("active");
  } else {
    menu.add("active");
  }

});


//*** Sakura *******************************************************************************************/
// Importation des floraisons des années passées
// csv("../data/hirosaki_temp_cherry_bloom.csv")
//   .then(function (data) {
//     df = DataFrame(data_csv) //  Création d'un dataframe à partir du csv.

//     //  Séparer la data entre année, mois et jour 
//     dateList = df['date'].str.split('/', expand = True)
//     df['year'], df['month'], df['day'] = dateList[0], dateList[1], dateList[2]
//     df.info()
//     console.log(df)
//   });
// IMPOORTATION EN COURS PAS FINIE

//importation donnéqes météo

// Importation des floraisons de l'année en cours (donncées croisées avec météo 2023)


//*** Haiku ********************************************************************************************/
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
    // console.log(haikuListe);
    // affiche une donnée au hasard dans la div #haikus
    select("#haikus").html(haikuListe.haikus[Math.floor(Math.random() * haikuListe.haikus.length)]);
  });


//*** Traduction Kanji *********************************************************************************/
csv("../data/joyo_processed.csv")
  .then(function (data) {
    // Code de la visualisation ()
    let kanjiListe = {
      ecritJap: [],
      traduction: []
    }
    data.forEach((kanji) => {
      //affiche les nouveaux kanji
      kanjiListe.ecritJap.push(kanji.new);
      kanjiListe.traduction.push(kanji.translation);
    });
    console.log(kanjiListe);
    //affiche une donnée aléatoire écritJap et sa traduction dans la div #kanjis
    select("#kanjis").html(kanjiListe.ecritJap[Math.floor(Math.random() * kanjiListe.ecritJap.length)] + " : " + kanjiListe.traduction[Math.floor(Math.random() * kanjiListe.traduction.length)]);
    


    


  })
  .catch(function (error) {
    console.log(error);
  });


//*** Ramen ********************************************************************************************/
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
    // console.log(ramenJapon);
  });


//*** Haijin *******************************************************************************************/
//le Haijin s'exécute dans la div qui lui est dédiée (#haijin)
const svgHaijin = select("#haijin")
const perso = svgHaijin.select("#haijinPerso")
  // le haijin bouge seulement quand il y a du scroll
  .on("scroll", function () {
    function moveHaijin() {
      perso
        .transition()
        .duration(500)
        .ease(d3.easeLinear) // sert à faire une transition linéaire
        .attr("transform", function () {
          return d3.interpolateString("translateY(0, -10px)", "translate(0, 0)");
        })
        .transition()
        .duration(500)
        .attr("transform", function () {
          return d3.interpolateString("translateY(0, 0px)", "translate(0, -10)");
        })
        .on("end", moveHaijin);
    }
    moveHaijin();
  });


