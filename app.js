$(document).ready(function () {
      $('#search-button').click(function () {
        const title = $('#movie-title').val().trim();
        if (!title) {
          alert('Por favor, introduce un título.');
          return;
        }
        buscarTitulo(title);
      });

      function buscarTitulo(titulo) {
        $.ajax({
          url: 'http://www.omdbapi.com/',
          type: 'GET',
          dataType: 'json',
          data: {
            t: titulo,
            apikey: '35e7d14d'
          },
          success: function (data) {
            mostrarInfo(data);

            if (data.Type === 'series') {
              obtenerTemporadas(data.Title, parseInt(data.totalSeasons));
            }
          },
          error: function (xhr, estado, error) {
            console.error(`Error: ${error} | Estado: ${estado}`);
          }
        });
      }

      function mostrarInfo(data) {
        $('#movie-info').html(`
          <h2>${data.Title}</h2>
          <img src="${data.Poster}" alt="Póster">
          <p><strong>Año:</strong> ${data.Year}</p>
          <p><strong>Género:</strong> ${data.Genre}</p>
          <p><strong>Sinopsis:</strong> ${data.Plot}</p>
          <p><strong>Valoración:</strong> ${data.imdbRating}</p>
        `);
      }

      function obtenerTemporadas(titulo, totalSeasons) {
        const llamadasAjax = [];
        const ratingsPorTemporada = [];
        let maxEpisodios = 0;

        for (let i = 1; i <= totalSeasons; i++) {
          llamadasAjax.push(
            $.ajax({
              url: 'http://www.omdbapi.com/',
              type: 'GET',
              dataType: 'json',
              data: {
                t: titulo,
                Season: i,
                apikey: '35e7d14d'
              },
              success: function (seasonData) {
                ratingsPorTemporada[i] = seasonData.Episodes
                  .map(ep => ep.imdbRating)
                  .filter(rating => !isNaN(parseFloat(rating))); // Solo notas válidas

                if (seasonData.Episodes.length > maxEpisodios) {
                  maxEpisodios = seasonData.Episodes.length;
                }
              }
            })
          );
        }

        $.when.apply($, llamadasAjax).then(function () {
          construirTabla(ratingsPorTemporada, totalSeasons, maxEpisodios);
        });
      }

      function construirTabla(ratings, totalSeasons, maxEpisodios) {
        const tabla = $('<table>');
        const thead = $('<thead><tr><th></th></tr></thead>');
        const tbody = $('<tbody>');

        for (let s = 1; s <= totalSeasons; s++) {
          thead.find('tr').append(`<th>T ${s}</th>`);
        }

        for (let ep = 0; ep < maxEpisodios; ep++) {
          let fila = $('<tr>').append(`<td>${ep + 1}</td>`);
          let tieneRating = false;

          for (let s = 1; s <= totalSeasons; s++) {
            const rating = ratings[s]?.[ep];
            if (rating && !isNaN(parseFloat(rating))) {
              const claseColor = obtenerClasePorRating(rating);
              fila.append(`<td class="episodio ${claseColor}">${rating}</td>`);
              tieneRating = true;
            } else {
              fila.append('<td></td>');
            }
          }

          if (tieneRating) {
            tbody.append(fila);
          }
        }

        tabla.append(thead).append(tbody);
        $('#movie-info').append(tabla);
      }

      function obtenerClasePorRating(rating) {
        const valor = parseFloat(rating);
        if (valor >= 9) return 'excelente';
        if (valor >= 8) return 'alta';
        if (valor >= 7) return 'buena';
        if (valor >= 5) return 'media';
        if (valor >= 3) return 'baja';
        return 'mala';
      }
    });