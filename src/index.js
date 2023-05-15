//japanjson venait d'un github : https://github.com/dataofjapan/land/blob/master/japan.geojson
// worldcities : https://www.kaggle.com/datasets/juanmah/world-cities
// fullbloom : on a pas les coordonnes des villes, donc pas capable de les afficher
//japan geoson pour dessiner la map
//problème : wolrdcities ne comportait pas les villes de sakurafull blame

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
    haikuListe.haijin.push([haiku.source]); 
    //haiku.title, : enlevé car les haikus  n'ont pas de titre
    haikuListe.explication.push(haiku.explication);
  });

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
//on importe tout d'un coup
//fonction auto-exécutante

(async () => {
  const stockageFichiers = await Promise.all([
    d3.json("../data/japan.geojson"),
    d3.csv("../data/sakura_full_bloom_dates_map.csv"),
    d3.csv("../data/worldcities.csv"),
  ]);

  d3.csv("../data/haiku_karen.csv").then(function (dataHaiku) {
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
        //pour mettre données dans une Map (clé,valeur)
        villes.set(element.city, element);
      }
    });

    //création un svg pour la carte du japon
    const cadre = document.querySelector("#svgSakura");
    const hauteur = cadre.clientHeight;
    const largeur = cadre.clientWidth;
    const svg = d3
      .select("#svgSakura")
      .append("svg")
      .attr("height", hauteur)
      .attr("width", largeur);
    // formule mathématique pour transformer sphère en plat
    const projection = d3
      .geoMercator()
      //pour se centrer sur le Japon parmi la Terre
      .center([138, 37])
      .scale(800)
      //pour que le Japon soit centré au milieu du svg
      .translate([largeur / 2, hauteur / 2]);
    //variable pour contour de la map
    const path = d3.geoPath().projection(projection);
    //dessiner map
    svg
      .selectAll("path")
      //features pour les coordonnées du Japon
      .data(japan.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "#ccc")
      .style("stroke", "#000");

    const villesAvecCoordonnees = [];
    //on veut ajouter des longitudes et latitudes à notre fichier csv
    //on veut regarder dans le fichier sakura si les villes correspondent au fichier worldcities
    //si elles figurent, on leur rajoute les latitudes et longitudes
    sakuras.forEach((sakura) => {
      //villes c'est toutes les villes du Japon de worldcities
      const ville = villes.get(sakura["Site Name"]);
      //on vérifie s'il y a ville (worldcities.csv)
      if (ville) {
        sakura.latitude = ville.lat;
        sakura.longitude = ville.lng;
        villesAvecCoordonnees.push(sakura);
      }
    });
    const donneeParMoisJour = {};
    villesAvecCoordonnees.forEach((ville) => {
      //pour afficher propriétés de ville, mais ici nous ce qui nous intéresse c'est les dates
      Object.keys(ville).forEach((propriete) => {
        //Number convertit en nombre car ce sont des strings
        // on voit qu'il y a 6 strings et cela nous permet de garder que les années

        if (!isNaN(Number(propriete))) {
          const date = ville[propriete];
          if (date) {
            //car quand on est à la première fois, il n'y a pas de tableau
            //on stocke des tableaux dans cet objet donneeParMoisJour
            const isArray = donneeParMoisJour[date] ? true : false;
            const data = {
              siteName: ville["Site Name"],
              latitude: ville.latitude,
              longitude: ville.longitude,
            };
            if (isArray) {
              //on peut pas push s'il y a pas de tableau, d'où le isArray pour dire s'il y a une propriété sur l'objet
              donneeParMoisJour[date].push(data);
            } else {
              donneeParMoisJour[date] = [];
              donneeParMoisJour[date].push(data);
            }
          }
        }
      });
    });

    const playButton = document.querySelector("#playButton");
    const toolType = document.querySelector("#toolType");
    const lordIcon = document.querySelector("#playButton lord-icon");
    const yearSelect = document.querySelector("#year-select");

    //afficher des cercles quand on arrive la première fois sur la page
    afficher(donneeParMoisJour["1953-03-31"]);

    //id est nécessaire pour cancel intervalle
    let stockageIdIntervalle;

    playButton.addEventListener("click", (e) => {
      //la classe "pause" reflète l'état actuel
      playButton.classList.toggle("pause");
      const isPaused = playButton.classList[0];

      if (isPaused) {
        lordIcon.src = "https://cdn.lordicon.com/xddtsyvc.json";
        pause();
      } else {
        lordIcon.src = "https://cdn.lordicon.com/ensnyqet.json";
        play();
      }
    });

    function play() {
      stockageIdIntervalle = setInterval(afficherDate, 3500);
    }

    function pause() {
      clearInterval(stockageIdIntervalle);
    }

    //menu déroulant

    //set pour faire valeurs uniques et est un objet
    const annees = new Set();
    //itération sur les dates
    //tranformer donnesParMoiJour en tableau car c'est un objet via Object.keys()
    //split pour séparer

    Object.keys(donneeParMoisJour).forEach((date) => {
      const donneesdate = date.split("-");
      const year = donneesdate[0];
      annees.add(year);
    });
    //création d'un tableau pour pouvoir les trier dans l'ordre chronologique dans le menu

    const sortedYearMenu = Array.from(annees).sort();

    //itération sur un objet avec for of
    //on rajoute autant d'éléments enfants qu'il y a de dates, on fait une boucle for
    for (const annee of sortedYearMenu) {
      const option = document.createElement("option");

      option.innerText = annee;

      option.value = annee;

      yearSelect.appendChild(option);
    }

    // création des tableaux pour lier les haiku/jin à la toolType
    let haikuVille = {
      provenance: [],
      haikuJin: [],
    };
    // on remplit les tableaux
    dataHaiku.forEach(function (d) {
      //haikuVille.haikuJin.push(d.title + "<br>" + d.source);
      // ou on peut aussi l'écrire comme cela :
      haikuVille.haikuJin.push([d.title, " wrote by " + d.source].join("<br>"));
      haikuVille.provenance.push(d.provenance);
    });

    function afficheToolType(e) {
      //display "block" pour afficher le rectangle
      toolType.style.display = "block";
      //chercher la ville dans le tableau haiku et trouver son index
      const index = haikuVille.provenance.indexOf(
        e.target.__data__["siteName"]
      );

      //ajouter titre haiku et nom haijin
      toolType.innerHTML = "<b>" + e.target.__data__["siteName"] + "</b>" + "<br>" + "<br>" + "Haiku(s) made on this place :" +  "<br>" + haikuVille.haikuJin[index]; //\n est pour un retour à la ligne dans un innerText
      // S'il n'y a pas de haiku, changer undefined en autre chose
      if (haikuVille.haikuJin[index] == undefined) {
        toolType.innerHTML = "<b>" + e.target.__data__["siteName"] + "</b>" + "<br>" +  "<br>" +  "No haiku made on this place yet";
      }
    }

    function cacherToolType(e) {
      toolType.style.display = "none";
    }

    //fonction pour afficher le nom de l'endroit
    function afficherNomCarte(e) {
      toolType.style.display = "block";
      toolType.innerHTML = "<b>" + e.target.__data__["stockageFichiers[2]"] + "</b>";
    }

    function cacherNomCarte(e) {
      toolType.style.display = "none";
    }
    
    function afficher(data) {
      svg
        .selectAll("circle")
        .data(data)
        .join(
          (enter) =>
            enter
              .append("circle")
              .on("mouseover", afficheToolType)
              .on("mouseout", cacherToolType)
              // pour version tablette et natel (au clic)
              .on("click", function (e) {
                if (toolType.style.display == "block") {
                  cacherToolType(e);
                } else {
                  afficheToolType(e);
                }
              })
              .attr("cx", (d) => {
                return projection([d.longitude, d.latitude])[0];
              })
              .attr("cy", (d) => {
                return projection([d.longitude, d.latitude])[1];
              })
              .transition()
              //durée de l'animation
              .duration(1000)
              //on définit rayon r
              //d c'est donnée d'un sakura
              .attr("r", (d) => {
                return 3;
              })
              .style("fill", "#fd40b1"), // Rouge du Japon : 0 100 90 0 (#e40521)

          (exit) =>
            exit
              .transition()
              .duration(1000)
              .attr("r", () => 0)
              .remove()
        );
    }
    const datesEvolution = document.querySelector("#datesEvolution");

    const dateDepart = "1953-03-31";
    const dateFinale = new Date("2020-05-12");
    let dateCourante = new Date(dateDepart);

    function afficherDate() {
      const jour =
        dateCourante.getDate() <= 9
          ? //le 0 c'est pour le jour car ça s'écrit 01 par exemple pour le 1 er jour
            `0${dateCourante.getDate()}`
          : dateCourante.getDate();
      const mois =
        dateCourante.getMonth() <= 9
          ? //+1 car les mois commencent à 0 !
            `0${dateCourante.getMonth() + 1}`
          : dateCourante.getMonth() + 1;

      const annee = dateCourante.getFullYear();
      const dateFormatee = `${annee}-${mois}-${jour}`;
      if (dateCourante.getTime() >= dateFinale.getTime()) {
        dateCourante = new Date(dateDepart);
        //pour sélectionner les mois de mars - avril - mai de l'éclosion des cerisiers
      } else if (dateCourante.getMonth() > 4) {
        dateCourante.setMonth(2);
        dateCourante.setFullYear(dateCourante.getFullYear() + 1);
      } else {
        dateCourante.setDate(dateCourante.getDate() + 1);
      }
      //date affichée sur la page
      datesEvolution.innerText = dateFormatee;

      const villesEclosionDateCourante = donneeParMoisJour[dateFormatee] || [];

      afficher(villesEclosionDateCourante);
    }

    yearSelect.addEventListener("change", (e) => {
      //parent stocke la valeur
      const anneemenu = e.target.value;
      const chosendate = Object.keys(donneeParMoisJour).filter((date) => {
        const donneesdate = date.split("-");
        const year = donneesdate[0];

        //on split pour pouvoir comparer anneemenu à year
        if (anneemenu == year) {
          return date;
        }
        //on veut la première date de l'année choisie par l'user
      })[0];

      dateCourante = new Date(chosendate);
    });

    // afficher nom de l'endroit survolé
    // d3.select("#svgSakura").on("mouseover", function () {
    //   if (toolType.style.display == "none") {
    //     afficherNomCarte();
    //   } else {
    //     cacherNomCarte();
    //   }
    // });
    // d3.select("#svgSakura").on("click", function () {
    //   if (toolType.style.display == "block") {
    //     cacherNomCarte();
    //   } else {
    //     afficherNomCarte();
    //   }
    // });

    play();
  });
})();


//*** Traduction Kanji ******************************************************************************************************************/
d3.csv("../data/joyo_processed_en.csv")
  .then(function (data) {
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
      .ease(d3.easeLinear)
      .attrTween("transform", function () {
        return d3.interpolateString(
          "matrix(0.6,0,0,0.6,0,0)",
          "matrix(0.6,0,0,0.6,0,0)"
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