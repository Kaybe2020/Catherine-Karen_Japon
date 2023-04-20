// Importation D3 (plus simple que de faire toutes les importations de ce que l'on a besoin)
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


//*** Haiku ********************************************************************************************/
d3.csv("../data/haiku_karen.csv")
  .then(function (data) {
    // Code de la visualisation ()
    let haikuListe = {
      haikus: [],
      haijin: [],
      explication: [],
    };
    data.forEach((haiku) => {
      //affiche les nouveaux haiku avec un retour à la ligne à chaque ligne
      haikuListe.haikus.push(
        [haiku.ligne01, haiku.ligne02, haiku.ligne03].join("<br>")
      );
      haikuListe.haijin.push([haiku.title, haiku.source]);
      haikuListe.explication.push(haiku.explication);
    });
    // console.log(haikuListe);

    //création d'un nombre random pour afficher le haiku et l'auteur en random
    const randomHaiku = Math.floor(Math.random() * haikuListe.haikus.length);
    //affiche le haiku et l'auteur
    d3.select("#haiku").html(haikuListe.haikus[randomHaiku]);
    d3.select("#titleAuthor").html(haikuListe.haijin[randomHaiku]);

    //affiche la source du haiku dans un overlay quand on passe la souris sur la div #haikus
    d3.select("#haikus").on("mouseover", function () {
      //affiche l'overlay
      d3.select("#overlay").style("display", "block");
      // met l'overlay devant les autres éléments
      d3.select("#overlay").style("z-index", "100");
      //affiche la source du haiku
      d3.select("#popup").html(haikuListe.explication[randomHaiku]);
    });
    //cache l'overlay quand on sort de la div haikus
    d3.select("#haikus").on("mouseout", function () {
      d3.select("#overlay").style("display", "none");
    });
  });


//*** Sakura *******************************************************************************************/
//cerisiers dates floraison
//coordonnées gps+ coordonnes japon + notre fichier
//on importe tout d'un coup
//fn qui s'appelle elle même
//METTRE TRANSITION PAR RAYON ("fiouu")

(async () => {
  const stockageFichiers = await Promise.all([
    d3.json("../data/japan.geojson"),
    d3.csv("../data/sakura_full_bloom_dates_map.csv"),
    d3.csv("../data/worldcities.csv"),
  ]);
  // console.log(stockageFichiers);

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
  // console.log(villes.get("Tokyo"));

  //création un svg pour la carte du japon

  const cadre = document.querySelector("#histoire");
  // console.dir(cadre);
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
  // console.log(donnesFinales);

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
            .style("fill", "#fd40b1"), // Rouge du Japon : 0 100 90 0 (#e40521)
        (update) =>
          update
            .transition()
            //500 milisecondes
            .duration(100)
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

  setInterval(afficherAnnees, 500);
})();


//*** Traduction Kanji *********************************************************************************/
d3.csv("../data/joyo_processed.csv")
  .then(function (data) {
    // Code de la visualisation ()
    let kanjiListe = {
      ecritJap: [],
      traduction: [],
    };
    data.forEach((kanji) => {
      //affiche les nouveaux kanji
      kanjiListe.ecritJap.push(kanji.new);
      kanjiListe.traduction.push(kanji.translation);
    });

    //créer un tableau vide pour stoquer des numéros aléatoires
    const nombreRandom = [];
    do {
      //constante aléatoire pour avoir le même nombre entre ecritJap /traduction (mettre après avoir rempli les tableaux!)
      const random = Math.floor(Math.random() * kanjiListe.ecritJap.length);
      //si le nombre n'est pas dans le tableau, on l'ajoute
      if (!nombreRandom.includes(random)) {
        nombreRandom.push(random);
      }
    } while (nombreRandom.length < 10);
    // console.log(nombreRandom);
    //Afficher les kanjis en fonction de nombrerandom
    for (let i = 0; i < nombreRandom.length; i++) {
      d3.select("#kanjis").append('p').html(kanjiListe.ecritJap[nombreRandom[i]] + " : " + kanjiListe.traduction[nombreRandom[i]]);
    }
  })
  .catch(function (error) {
    console.log(error);
  });


//*** Ramen ********************************************************************************************/
d3.csv("../data/ramen-ratings.csv").then(function (data) {
  let ramenJapon = [];

  data.forEach((ramen) => {
    // 1) trier les informations et ne prendre que les ramens du Japon
    if (ramen.Country == "Japan")
      // prendre nom, description et étoiles des ramens
      ramenJapon.push({
        marque: ramen.Brand,
        description: ramen.Variety,
        topFive: ramen.Stars,
      });
  });
  // console.log(ramenJapon);

  // 2) dans ces ramens japonais, prendre 5 ramens aléatoires
  //créer un tableau vide pour stoquer des numéros aléatoires
  const nombreRandomRamen = [];
  do {
    //constante aléatoire 
    const randomRamen = Math.floor(Math.random() * ramenJapon.length);
    //si le nombre n'est pas dans le tableau, on l'ajoute
    if (!nombreRandomRamen.includes(randomRamen)) {
      nombreRandomRamen.push(randomRamen);
    }
  } while (nombreRandomRamen.length < 5);
  console.log(nombreRandomRamen);
  // constante qui stoque les 5 plats
  const cinqRamens = [];
  //Afficher les ramens en fonction de nombrerandom
  for (let i = 0; i < nombreRandomRamen.length; i++) {
    cinqRamens.push(ramenJapon[nombreRandomRamen[i]]);
  }
  console.log(cinqRamens)

  // 3) trier ces 5 ramens par étoiles
  const triScore = cinqRamens.sort(function compare(a, b) {
    if (a.topFive < b.topFive) return 1;
    if (a.topFive > b.topFive) return -1;
    return 0;
  });
  console.log({ triScore });
  // d3.select("#ramen").append('p').html(triScore.topFive + " " + triScore.marque)

  // 4) afficher la marque et le topFive dans l'HTML
  const affichageRamen = d3.select("#ramen");
  affichageRamen.selectAll("p")
    .data(triScore)
    .enter()
    .append("p")
    .html((d) => d.marque + " - " + d.topFive);

  // 5) quand on clique sur un ramen, pour afficher / cacher la description en dessous du produit







});



//*** Haijin *******************************************************************************************/
//le Haijin s'exécute dans la div qui lui est dédiée (#haijin)
const perso = d3.select("#haijinPerso");
const histoire = d3.select('#histoire'); // pour pouvoir récupérer la position du scroll

histoire.on("scroll", function () {
  // vérifie si le scroll a atteint la fin de la div "histoire"
  const scrollHeight = this.scrollHeight;
  const scrollTop = this.scrollTop;
  const offsetHeight = this.offsetHeight;

  // le haijin bouge seulement quand il y a du scroll
  function moveHaijin() {
    perso
      .transition()
      .duration(500)
      .ease(d3.easeLinear) // sert à faire une transition linéaire
      .attrTween("transform", function () {
        // Ajout de la translation dans la matrice de transformation existante (HTML)
        return d3.interpolateString(
          "matrix(0.6,0,0,0.6,0,-10)", // transformation initiale
          "matrix(0.6,0,0,0.6,0,0)"    // transformation finale (sans la translation)
        )
      })

      // créer une fonction pour arrêter le mouvement haijin

      .on("end", stopHaijin); // appeller fonction stop quand fini
  }
  //créer une fonction pour arrêter le mouvement haijin quand pas scroll
  function stopHaijin() {
    perso
      .transition()
      .duration(500)
      .ease(d3.easeLinear) // sert à faire une transition linéaire
      .attrTween("transform", function () {
        // Ajout de la translation dans la matrice de transformation existante (HTML)
        return d3.interpolateString(
          "matrix(0.6,0,0,0.6,0,0)", // transformation initiale
          "matrix(0.6,0,0,0.6,0,0)"    // transformation finale (sans la translation)
        )
      })
  }

  // Si il y a un scroll, on appelle la fonction moveHaijin sinon on appelle la fonction stopHaijin
  if (scrollTop > 0) {
    moveHaijin();
  } else {
    stopHaijin();
  }

});