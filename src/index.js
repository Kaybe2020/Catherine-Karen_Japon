// Importation Select, utile pour le Burger et le Haijin
//import { select, geoMercator } from "d3-selection";
// Importation des fichiers CSV
//import { csv, json } from "d3-fetch";
import * as d3 from "d3";
//*** menu burger **************************************************************************************/
d3.select("#menu").on("click", function () {
  const menu = document.querySelector("#menuDeroulant").classList;
  if (menu.contains("active")) {
    menu.remove("active");
  } else {
    menu.add("active");
  }
});

//*** Sakura *******************************************************************************************/
// Importation des floraisons des années passées
//csv("../data/hirosaki_temp_cherry_bloom_temp.csv").then(function (data) {
//df = DataFrame(data_csv); //  Création d'un dataframe à partir du csv.

//  Séparer la data entre année, mois et jour
//dateList = df["date"].str.split("/", (expand = True));
//df["year"], df["month"], (df["day"] = dateList[0]), dateList[1], dateList[2];
//df.info();
//console.log(df);
//});
// IMPOORTATION EN COURS PAS FINIE

//importation donnéqes météo

// Importation des floraisons de l'année en cours (donncées croisées avec météo 2023)

//cerisiers dates floraison
//coordonnées gps+ coordonnes japon + notre fichier
//on importe tout d'un coup
//fn qui s'appelle elle même
/*
(async () => {
  const stockageFichiers = await Promise.all([
    d3.json("../data/japan.geojson"),
    d3.csv("../data/sakura_full_bloom_dates_map.csv"),
    d3.csv("../data/worldcities.csv"),
  ]);
  console.log(stockageFichiers);

  const [japan, sakuras, worldcities] = [
    stockageFichiers[0],
    stockageFichiers[1],
    stockageFichiers[2],
  ];

  const villes = new Map();
  //on veut mettre que les villes du japon
  // villes.set(nomIndex, value);
  worldcities.forEach((element) => {
    if (element.country == "Japan") {
      villes.set(element.city, element);
    }
  });
  console.log(villes.get("Tokyo"));

  //création un svg pour la carte du japon

  const cadre = document.querySelector("#histoire");
  console.dir(cadre);
  const hauteur = cadre.clientHeight;
  const largeur = cadre.clientWidth;
  const svg = d3
    .select("#histoire")
    .append("svg")
    .attr("height", hauteur)
    .attr("width", largeur);
  //138,37 pour coordonnée du japon
  // formule mathématique pour transformer sphère en plat
  const projection = d3
    .geoMercator()
    .center([138, 37])
    .scale(800)
    .translate([largeur / 2, hauteur / 2]);
  //variable pour contour de la map
  const path = d3.geoPath().projection(projection);
  //dessiner map
  svg
    .selectAll("path")
    .data(japan.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#ccc")
    .style("stroke", "#000");

  const donnesFinales = [];
  //on veut ajouter des longitudes et latitudes à notre fichier csv
  //on veut regarder dans le fichier sakura si les villes correspondent au fichier worldcities
  //si elles figurent , on leur rajoute les latitudes et longitudes
  sakuras.forEach((sakura) => {
    const ville = villes.get(sakura["Site Name"]);
    if (ville) {
      sakura.latitude = ville.lat;
      sakura.longitude = ville.lng;
      donnesFinales.push(sakura);
    }
  });
  console.log(donnesFinales);

  const afficher = (data, year) => {
    svg
      .selectAll("circle")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("circle")
            //position x
            .attr("cx", (d) => {
              return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", (d) => {
              return projection([d.longitude, d.latitude])[1];
            })
            //on définit rayon r
            //d c'est donnée d'un sakura
            .attr("r", (d) => {
              //rayon de 3 si il y a de données
              //rayon de 0 s'il y a pas de données
              return d[year] != "" ? 3 : 0;
            })
            .style("fill", "red"),
        (update) =>
          update
            .transition()
            //500 milisecondes
            .duration(500)
            .attr("cx", (d) => {
              return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", (d) => {
              return projection([d.longitude, d.latitude])[1];
            })
            .attr("r", (d) => {
              return d[year] != "" ? 3 : 0;
            }),
        //quand les points disparaissent
        (exit) => exit.attr("r", () => 0).remove()
      );
  };
  const datesEvolution = document.querySelector("#datesEvolution");

  let dateCourante = 1953;
  const afficherAnnees = () => {
    dateCourante++;
    if (dateCourante > 2020) {
      //comme ça on a une boucle
      dateCourante = 1953;
    }
    datesEvolution.innerText = dateCourante;

    afficher(donnesFinales, dateCourante);
  };

  setInterval(afficherAnnees, 1000);
})();
*/
//*** Haiku ********************************************************************************************/
d3.csv("../data/all_haiku.csv").then(function (data) {
  // Code de la visualisation ()
  let haikuListe = {
    haikus: [],
    haijin: [],
  };
  data.forEach((haiku) => {
    //affiche les nouveaux haiku
    haikuListe.haikus.push([haiku.ligne0, haiku.ligne1, haiku.ligne2]);
    haikuListe.haijin.push(haiku.source);
  });
  console.log(haikuListe);
});

//*** Traduction Kanji *********************************************************************************/
d3.csv("../data/joyo_kanji.csv")
  .then(function (data) {
    // Code de la visualisation ()
    let kanjiListe = {
      ecritJap: [],
      traduction: [],
    };
    data.forEach((kanji) => {
      //affiche les nouveaux kanji
      kanjiListe.ecritJap.push(kanji.new);
    });
    console.log(kanjiListe);
  })
  .catch(function (error) {
    console.log(error);
  });

//*** Ramen ********************************************************************************************/
d3.csv("../data/ramen-ratings.csv").then(function (data) {
  let ramenJapon = [];

  data.forEach((ramen) => {
    // trier les informations et ne prendre que les ramens du Japon
    if (ramen.Country == "Japan")
      // prendre nom, description et étoiles des ramens
      ramenJapon.push({
        nom: ramen.Brand,
        description: ramen.Variety,
        topTen: ramen.Stars,
      });
  });
  console.log(ramenJapon);

  const trieScore = ramenJapon.sort(function compare(a, b) {
    if (a.topTen < b.topTen) return 1;
    if (a.topTen > b.topTen) return -1;
    return 0;
  });
  //console.log({ trieScore });

  const DixPremiers = trieScore.slice(0, 10);
  console.log({ DixPremiers });
});

//*** Haijin *******************************************************************************************/
//le Haijin s'exécute dans la div qui lui est dédiée (#haijin)
const svgHaijin = d3.select("#haijin");
const perso = svgHaijin
  .select("#haijinPerso")
  // le haijin bouge seulement quand il y a du scroll
  .on("scroll", function () {
    function moveHaijin() {
      perso
        .transition()
        .duration(500)
        // .ease(d3.easeLinear)
        .attr("transform", function () {
          return d3.interpolateString(
            "translateY(0, -10px)",
            "translate(0, 0)"
          );
        })
        .transition()
        .duration(500)
        .attr("transform", function () {
          return d3.interpolateString(
            "translateY(0, 0px)",
            "translate(0, -10)"
          );
        })
        .on("end", moveHaijin);
    }
    moveHaijin();
  });
