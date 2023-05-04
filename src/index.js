// Importation D3 (plus simple que de faire toutes les importations de ce que l'on a besoin)
import * as d3 from "d3";

//*** menu burger ***********************************************************************************************************************/
d3.select("#menu").on("click", function () {
  const menu = document.querySelector("#menuDeroulant").classList;
  if (menu.contains("active")) {
    menu.remove("active");
  } else {
    menu.add("active");
  }
});

//Change la couleur du menu burger quand mouseover
const menuImg = document.getElementById("menuImg");

menuImg.addEventListener("mouseover", function () {
  this.style.transition = "background-image 0.5s";
  this.src = "../img/menuV1-hover.png";
});

menuImg.addEventListener("mouseout", function () {
  this.style.transition = "background-image 0.5s";
  this.src = "../img/menuV1.png";
});

//*** Haiku ******************************************************************************************************************************/
d3.csv("../data/haiku_karen.csv").then(function (data) {
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
    haikuListe.haijin.push([haiku.source]); //haiku.title, : enlevé car les haikus  n'ont pas de titre
    haikuListe.explication.push(haiku.explication);
  });
  // console.log(haikuListe);

  // Fonction pour afficher un haiku aléatoire
  function afficherHaikuAleatoire() {
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
    // Mettre à jour la source de l'overlay (quand on clic sur le bouton)
    d3.select("#popup").html(haikuListe.explication[randomHaiku]);
    //cache l'overlay quand on sort de la div haikus
    d3.select("#haikus").on("mouseout", function () {
      d3.select("#overlay").style("display", "none");
    });
  }

  // Appel initial pour afficher un haiku aléatoire
  afficherHaikuAleatoire();

  // Lier l'événement clic au bouton #buttonHaikuChange
  d3.select("#buttonHaikuChange").on("click", function () {
    afficherHaikuAleatoire();
  });

  //logique extraite  pour pouvoir l'appeler au clic du bouton mais aussi lors de son appel initial
});

//*** Sakura ****************************************************************************************************************************/
//cerisiers dates floraison
//coordonnées gps+ coordonnes japon + notre fichier
//on importe tout d'un coup
//fn qui s'appelle elle même

//METTRE TRANSITION PAR RAYON ("fiouu")

//POUR LES HAIKU : PRENDRE PROVENANCE(pour les lier à la carte) + TITLE (pour titre haiku) + SOURCE (pour haijin)
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
  const cadre = document.querySelector("#svgSakura");
  // console.dir(cadre);
  const hauteur = cadre.clientHeight;
  const largeur = cadre.clientWidth;
  const svg = d3
    .select("#svgSakura")
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
  const donneeParMoisJour = {};
  //console.log(donnesFinales);
  donnesFinales.forEach((ville) => {
    //console.log(ville);
    //pour afficher propriétés de ville

    Object.keys(ville).forEach((propriete) => {
      //Number convertit en nombre car ce sont des strings
      // on voit qu'il y a 6 strings et cela nous permet de garder que les années
      //console.log(Number(propriete));
      if (!isNaN(Number(propriete))) {
        //console.log(propriete);
        //  console.log(ville[propriete]);
        //on décompose date en 3 partie, car on voulait des clés
        // const dateParts = ville[propriete].split("-");
        //const date = `${dateParts[0]}-${dateParts[1]}`;
        const date = ville[propriete];
        //car quand on est à la première fois, y a pas de tableau
        const isArray = donneeParMoisJour[date] ? true : false;
        const data = {
          siteName: ville["Site Name"],
          latitude: ville.latitude,
          longitude: ville.longitude,
          // date: ville[propriete],
        };
        if (isArray) {
          donneeParMoisJour[date].push(data);
        } else {
          donneeParMoisJour[date] = [];
          donneeParMoisJour[date].push(data);
        }

        //console.log(ville[propriete]);
      }
    });
    //console.log(Object.keys(ville));
  });
  console.log(donneeParMoisJour);
  const slider = document.querySelector("#sliderid");
  const playButton = document.querySelector("#playButton");
  const toolType = document.querySelector("#toolType");

  slider.setAttribute("max", getDaysBetweenDates("1953-03-31", "2020-05-12"));
  slider.setAttribute("min", "1");
  afficher(donneeParMoisJour["1953-03-31"]);

  //id est nécessaire pour cancel intervalle
  let stockageIdIntervalle;

  playButton.addEventListener("click", (e) => {
    playButton.classList.toggle("pause");
    const isPaused = playButton.classList[0];
    //console.log(pause);

    if (isPaused) {
      playButton.innerText = "Pause";
      pause();
    } else {
      playButton.innerText = "Play";
      play();
    }
  });

  function play() {
    stockageIdIntervalle = setInterval(afficherDate, 1000);
  }

  function pause() {
    clearInterval(stockageIdIntervalle);
  }

  function getDaysBetweenDates(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.round(Math.abs((start - end) / oneDay));
    return diffDays;
  }

  function afficheToolType(e) {
    toolType.style.display = "block";
    toolType.style.top = e.clientY + 20 + "px";
    toolType.style.left = e.clientX + "px";
    console.log(e);
    toolType.innerText = e.target.__data__["siteName"];

    //console.log(e.clientY);
  }
  function cacherToolType(e) {
    toolType.style.display = "none";
  }

  /*const estEclo = (data, year, month) => {
    const dateParts = data[year].split("-");
    const dateUn = `${dateParts[0]}-${dateParts[1]}`;
    const dateDeux = `${year}-${month}`;
    if (dateUn == dateDeux) {
      return true;
    }
    return false;
  };*/

  function afficher(data) {
    svg
      .selectAll("circle")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("circle")
            //position x
            .on("mouseover", afficheToolType)
            .on("mouseout", cacherToolType)
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
              return 3;
              //return estEclo(d, year, month) ? 3 : 0;
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
              //return estEclo(d, year, month) ? 3 : 0;
              return 3;
              //on met return 3 car il n'y a pas besoin de trier
            }),
        //quand les points disparaissent
        (exit) => exit.attr("r", () => 0).remove()
      );
  }
  const datesEvolution = document.querySelector("#datesEvolution");

  let anneeCourante = 1953;
  let moisCourant = 0;
  const dateDepart = "1953-03-31";
  const dateFinale = new Date("2020-05-12");
  let dateCourante = new Date(dateDepart);

  function afficherDate() {
    const jour =
      dateCourante.getDate() <= 9
        ? `0${dateCourante.getDate()}`
        : dateCourante.getDate();
    const mois =
      dateCourante.getMonth() <= 9
        ? `0${dateCourante.getMonth() + 1}`
        : dateCourante.getMonth() + 1;
    //les jours et mois n'ont pas de 0 devant tels que notre csv

    const annee = dateCourante.getFullYear();
    const dateFormatee = `${annee}-${mois}-${jour}`;
    if (dateCourante.getTime() >= dateFinale.getTime()) {
      dateCourante = new Date(dateDepart);
    } else {
      dateCourante.setDate(dateCourante.getDate() + 1);
    }

    //console.log(dateFormatee);
    datesEvolution.innerText = dateFormatee;
    const villesEclosionDateCourante = donneeParMoisJour[dateFormatee] || [];
    console.log(villesEclosionDateCourante);
    console.log(dateFormatee);

    afficher(villesEclosionDateCourante);
  }
  console.log(donneeParMoisJour);
  afficher(donneeParMoisJour["1953-03-31"]);
  //setInterval(afficherDate, 3000);
})();

//*** Traduction Kanji ******************************************************************************************************************/
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

    //Fonction pour afficher les kanjis aléatoires
    function afficherKanjiAleatoirs() {
      // Effacer les kanjis affichés précédemment
      d3.select("#kanjiAleatoirs").selectAll("p").remove();
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
        d3.select("#kanjiAleatoirs")
          .append("p")
          .html(
            kanjiListe.ecritJap[nombreRandom[i]] +
              " : " +
              kanjiListe.traduction[nombreRandom[i]]
          );
      }
    }

    //Appel initial de la fonction pour afficher les kanjis
    afficherKanjiAleatoirs();

    //Lier l'événement click au bouton #buttonKanjisChange
    d3.select("#buttonKanjisChange").on("click", function () {
      afficherKanjiAleatoirs();
    });
  })

  .catch(function (error) {
    console.log(error);
  });

//*** Ramen *****************************************************************"""""""""""""""""""""""""""""""""***************************/
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
  // console.log(nombreRandomRamen);
  // constante qui stoque les 5 plats
  const cinqRamens = [];
  //Afficher les ramens en fonction de nombrerandom
  for (let i = 0; i < nombreRandomRamen.length; i++) {
    cinqRamens.push(ramenJapon[nombreRandomRamen[i]]);
  }
  // console.log(cinqRamens);

  // 3) trier ces 5 ramens par étoiles
  const triScore = cinqRamens.sort(function compare(a, b) {
    if (a.topFive < b.topFive) return 1;
    if (a.topFive > b.topFive) return -1;
    return 0;
  });
  // console.log({ triScore });

  // // 4) afficher la marque et le topFive dans l'HTML
  const affichageRamen = d3
    .select("#ramensAleatoirs")
    .selectAll("div")
    .data(triScore)
    .enter()
    .append("div")
    .classed("ramen-item", true); // ajouter une classe ramen-item

  // 5) quand on clique sur un ramen, afficher / cacher la description en dessous du produit
  affichageRamen
    .append("p")
    .html((d) => d.marque + " " + d.topFive)
    .classed("topfive", true)
    //ajouter une image avant topFive
    .append("img")
    .attr("src", "../img/etoile.svg")
    .attr("alt", "etoile")
    .classed("etoileRamen", true)
    .classed("topfive", true);
  //doit le faire en deux fois pour pouvoir afficher le topFive après l'image
  // affichageRamen
  //   .append("p")
  //   .html((d) => d.topFive)
  //   .classed("topFive", true);
  //cela coupe en 2 le topFive et l'image... du coup remis la note avant l'étoile

  affichageRamen
    .append("p")
    .classed("description", true)
    .html((d) => d.description)
    .style("display", "none");

  affichageRamen.on("click", function () {
    d3.select(this)
      .select(".description")
      .style("display", function () {
        return this.style.display === "none" ? "block" : "none";
      });
  });
});

//*** Haijin ***************************************************************************************************************************/
//le Haijin s'exécute dans la div qui lui est dédiée (#haijin)
const perso = d3.select("#haijinPerso");
const histoire = d3.select("#histoire"); // pour pouvoir récupérer la position du scroll

histoire.on("scroll", function () {
  // vérifie si le scroll a atteint la fin de la div "histoire"
  const scrollTop = this.scrollTop;

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
          "matrix(0.6,0,0,0.6,0,0)" // transformation finale (sans la translation)
        );
      })
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
          "matrix(0.6,0,0,0.6,0,0)" // transformation finale (sans la translation)
        );
      });
  }

  // Si il y a un scroll, on appelle la fonction moveHaijin sinon on appelle la fonction stopHaijin
  if (scrollTop > 0) {
    moveHaijin();
  } else {
    stopHaijin();
  }
});

// A FAIRE :
// OK - Résoudre problème carte (MATHILDE)
// OK - Rajouter régions pour Haijin dans "haiku_karen.csv" (KAREN)
// - Ajouter Nom région + en-dessous : titre du Haiku + nom du Haijin dans l'encadré de la carte (mouseOver) (MATHILDE) = croisement de données
// OK - faire un bouton pour afficher les Haikus + kanjis aléaoirs (KAREN)
// OK - faire CSS afficher les ramens (KAREN)
// OK - Bouton menu changer couleur en over (KAREN)
// OK -  Ecrire conclusion (KAREN)
// OK - Mise en page final CSS (KAREN)
// - Faire les 2 autres media queries (MATHILDE + KAREN)
