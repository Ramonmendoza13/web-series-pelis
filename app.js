$(document).ready(function () {
  $("#boton-buscar").click(function () {
    cargarInfo();
    let titulo = $("#titulo").val().trim();
    mostrarDatos(titulo);
  });

  $("#visor a").click(function (event) {
    event.preventDefault();
    $(".inicio").show();
    $(".info").css("display", "block");
    $(".notaCapitulos").empty();
    $(".info").empty();

  });

  $(".carta").click(function (event) {
    cargarInfo();
    let titulo = $(this).find("img").attr("alt");
    mostrarDatos(titulo);
  });

  function cargarInfo() {
    $(".inicio").hide();
    
    $(".info").css("display", "block");
    $(".notaCapitulos").empty();      // Elimina todo el contenido dentro
  }

  function mostrarDatos(titulo) {
    let serie = false;
    $.ajax({
      url: "https://www.omdbapi.com/",
      type: "GET",
      dataType: "json",
      data: {
        t: titulo,
        apikey: "35e7d14d",
      },
      success: function (data) {
        if (data.Response === "False") {
          $(".info").html("<p>No se encontró la película o serie.</p>");
          return;
        }

        let infoHTML = `
          <div class="info-container">
            <div class="poster">
              <img src="${data.Poster}" alt="Poster" />
            </div>
            <div class="details">
              <h2>${data.Title}</h2>
              <p><strong>Año:</strong> <span>${data.Year}</span></p>
              <p><strong>Género:</strong> <span>${data.Genre}</span></p>
              <p><strong>Sinopsis:</strong> <span>${data.Plot}</span></p>
              <p><strong>Valoración:</strong> <span>${data.imdbRating}</span></p>`;

        if (data.Type === "series") {
          serie = true;
          infoHTML += `<p><strong>Nº Temporadas:</strong> <span>${data.totalSeasons}</span></p>`;
        }

        infoHTML += `
            </div>
          </div>
        `;

        $(".info").html(infoHTML);

        if (serie) {
          notaCapitulos(titulo, parseInt(data.totalSeasons));
        }
      },
    });
  }

  function notaCapitulos(titulo, totalTemporadas) {
    const datosTemporadas = [];
    let recibidas = 0;

    for (let i = 1; i <= totalTemporadas; i++) {
      $.ajax({
        url: "https://www.omdbapi.com/",
        type: "GET",
        dataType: "json",
        data: {
          t: titulo,
          Season: i,
          apikey: "35e7d14d",
        },
        success: function (data) {
          datosTemporadas[i - 1] = data.Episodes;
          recibidas++;

          if (recibidas === totalTemporadas) {
            construirTabla(datosTemporadas);
          }
        }
      });
    }
  }

  function construirTabla(datosTemporadas) {
    const maxEpisodios = Math.max(...datosTemporadas.map(t => t.length));
    let html = `<table><thead><tr><th></th>`;

    // Cabecera: Temporadas
    for (let t = 0; t < datosTemporadas.length; t++) {
      html += `<th>T ${t + 1}</th>`;
    }
    html += `</tr></thead><tbody>`;

    // Filas: Episodios
    for (let e = 0; e < maxEpisodios; e++) {
      html += `<tr><td>${e + 1}</td>`;
      for (let t = 0; t < datosTemporadas.length; t++) {
        const episodio = datosTemporadas[t][e];
        let nota = "__";
        let clase = "nada";

        if (episodio && episodio.imdbRating) {
          nota = episodio.imdbRating;
          clase = getColorClass(nota);
        }

        html += `<td class="${clase}">${nota}</td>`;
      }
      html += `</tr>`;
    }

    html += `</tbody></table>`;
    $(".notaCapitulos").html(html);
  }

  function getColorClass(nota) {
    if (nota === "N/A" || nota === undefined || nota === null) return 'nada'; // Para valores no disponibles
    if (nota >= 9) return 'verde';  // Nota entre 9 y 10: Verde 
    if (nota >= 8) return 'verdeClaro';      // Nota entre 8 y 8.9: verdeClaro
    if (nota >= 7) return 'amarillo';   // Nota entre 7 y 7.9: Amarillo
    if (nota >= 5) return 'rojo';    // Nota entre 5 y 6.9: Naranja
    return 'morado';                      // Menos de 5: Rojo
  }



});
