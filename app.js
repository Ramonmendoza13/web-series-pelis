      $(document).ready(function () {
        $("#search-button").click(function () {
          const movieTitle = $("#movie-title").val().trim();
          if (!movieTitle) {
            alert("Por favor, introduce un título.");
            return;
          }

          $.ajax({
            url: "https://www.omdbapi.com/",
            type: "GET",
            dataType: "json",
            data: {
              t: movieTitle,
              apikey: "35e7d14d",
            },
            success: function (data) {
              if (data.Response === "False") {
                $("#movie-info").html("<p>No se encontró la película o serie.</p>");
                return;
              }

              const infoHTML = `
                <div class="info-container">
                  <div class="poster">
                    <img src="${data.Poster}" alt="Poster" />
                  </div>
                  <div class="details">
                    <h2>${data.Title}</h2>
                    <p><strong>Año:</strong> ${data.Year}</p>
                    <p><strong>Género:</strong> ${data.Genre}</p>
                    <p><strong>Sinopsis:</strong> ${data.Plot}</p
                    <p><strong>Valoración:</strong> ${data.imdbRating}</p>
                  </div>
                </div>
              `;
              $("#movie-info").html(infoHTML);

              if (data.Type === "series") {
                const totalSeasons = parseInt(data.totalSeasons);
                const ajaxCalls = [];
                const seasonRatings = [];
                let maxEpisodes = 0;

                for (let i = 1; i <= totalSeasons; i++) {
                  ajaxCalls.push(
                    $.ajax({
                      url: "https://www.omdbapi.com/",
                      type: "GET",
                      dataType: "json",
                      data: {
                        t: movieTitle,
                        Season: i,
                        apikey: "35e7d14d",
                      },
                      success: function (seasonData) {
                        const ratings = seasonData.Episodes
                          .map((e) => e.imdbRating)
                          .map((r) => (r === "N/A" ? null : parseFloat(r)));

                        seasonRatings[i] = ratings;
                        maxEpisodes = Math.max(maxEpisodes, ratings.length);
                      }
                    })
                  );
                }

                $.when.apply($, ajaxCalls).then(function () {
                  const table = $("<table>");
                  const thead = $("<thead><tr><th></th></tr></thead>");
                  const tbody = $("<tbody>");

                  for (let s = 1; s <= totalSeasons; s++) {
                    thead.find("tr").append(`<th>T ${s}</th>`);
                  }

                  for (let ep = 0; ep < maxEpisodes; ep++) {
                    const row = $("<tr>").append(`<td>${ep + 1}</td>`);

                    for (let s = 1; s <= totalSeasons; s++) {
                      const rating = seasonRatings[s]?.[ep];
                      if (rating != null) {
                        const ratingClass = getRatingClass(rating);
                        row.append(`<td class="episodio ${ratingClass}">${rating}</td>`);
                      } else {
                        row.append("<td></td>");
                      }
                    }

                    tbody.append(row);
                  }

                  table.append(thead).append(tbody);
                  $("#movie-info").append(table);
                });
              }
            },
            error: function (xhr, estado, error) {
              console.warn("Error producido:", error);
              console.warn("Estado:", estado);
            },
          });
        });

        // Clasifica el color del episodio según nota IMDb
        function getRatingClass(rating) {
          if (rating >= 9) return "rating-high";
          if (rating >= 8) return "rating-good";
          if (rating >= 7) return "rating-average";
          if (rating >= 5) return "rating-low";
          return "rating-bad";
        }
      });