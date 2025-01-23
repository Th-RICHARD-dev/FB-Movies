/* Appelle les fonctions */

window.onload = () => {
    getMovie();
};

/* Récupère le film depuis l'id dans l'URL */

const getMovie = () => {
    try {
        const movieDetailsContainer = document.getElementById('movies-details');

        const url = new URLSearchParams(window.location.search);
        const movieId = url.get('id');

        const movies = JSON.parse(localStorage.getItem('movies'));
        const moviesObj = movies.find(m => m.id === movieId);

        const categories = JSON.parse(localStorage.getItem('categories'));
        const categoryObj = categories.find(category => category.id === moviesObj.category);

        movieDetailsContainer.innerHTML = `
            <h1 class="movies-details-name">${moviesObj.name}</h1>
            <div class="container">
                <img src="${moviesObj.img}" alt="${moviesObj.name}" class="movies-details-vignette">
                <div class="details">
                    <p class="categories-details-names">Categorie: ${categoryObj.name}</p>
                    <p class="movies-details-author">Auteur: ${moviesObj.author}</p>
                    <p class="movies-details-description">Description: ${moviesObj.description}</p>
                    <div class="ratio-like-dislike"></div>
                    <div class="like-dislike-visualization">
                        <div class="like-bar" style="width: 50%;"></div>
                        <div class="dislike-bar" style="width: 50%;"></div>
                    </div>
                    <div class="ratings">
                        <i class="fa-solid fa-thumbs-up like"></i>
                        <i class="fa-solid fa-thumbs-down dislike"></i>
                    </div>
                </div>
            </div>
            <div class="details-video-container">
                <iframe class="movies-details-video" title="video" src="${moviesObj.video}" frameborder="0">
            </div>
        `;

        getRating(movieDetailsContainer);
    } catch (error) {
        console.error("Erreur lors de la récupération des informations du film :", error.message);
        movieDetailsContainer.innerHTML = `<p class="error">Une erreur s'est produite lors du chargement des informations du film.</p>`;
    }
};

/* Récupère, stock et modifie les valeurs lié au like */

const getRating = (movieDetailsContainer) => {
    try {
        const url = new URLSearchParams(window.location.search);
        const movieId = url.get('id');

        updateLikeDislikeRatio(movieId);

        const like = document.querySelector('.like');
        const dislike = document.querySelector('.dislike');

        const likeBar = document.querySelector('.like-bar');
        const dislikeBar = document.querySelector('.dislike-bar');

        const movieStates = JSON.parse(localStorage.getItem('movieStates')) || {};
        const currentMovieState = movieStates[movieId] || { liked: false, disliked: false };

        if (currentMovieState.liked) {
            like.style.color = 'var(--red)';
            like.classList.add('clicked');
            likeBar.style.backgroundColor = 'var(--red)';
            dislike.style.pointerEvents = 'none';
        }

        if (currentMovieState.disliked) {
            dislike.style.color = 'var(--red)';
            dislike.classList.add('clicked');
            dislikeBar.style.backgroundColor = 'var(--red)';
            like.style.pointerEvents = 'none';
        }

        like.addEventListener('click', async () => {
            try {
                if (!like.classList.contains('clicked') && !dislike.classList.contains('clicked')) {
                    await axios.patch(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies/${movieId}/like`);
                    like.style.color = 'var(--red)';
                    like.classList.add('clicked');
                    likeBar.style.backgroundColor = 'var(--red)';
                    dislike.style.pointerEvents = 'none';
                    movieStates[movieId] = { liked: true, disliked: false };
                    localStorage.setItem('movieStates', JSON.stringify(movieStates));

                    updateLikeDislikeRatio(movieId);
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout d'un like :", error.message);
            }
        });

        dislike.addEventListener('click', async () => {
            try {
                if (!dislike.classList.contains('clicked') && !like.classList.contains('clicked')) {
                    await axios.patch(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies/${movieId}/dislike`);
                    dislike.style.color = 'var(--red)';
                    dislike.classList.add('clicked');
                    dislikeBar.style.backgroundColor = 'var(--red)';
                    like.style.pointerEvents = 'none';
                    movieStates[movieId] = { liked: false, disliked: true };
                    localStorage.setItem('movieStates', JSON.stringify(movieStates));

                    updateLikeDislikeRatio(movieId);
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout d'un dislike :", error.message);
            }
        });

    } catch (error) {
        console.error("Erreur lors de l'initialisation du système de likes/dislikes :", error.message);
        movieDetailsContainer.innerHTML += `<p class="error">Impossible de récupérer les évaluations pour ce film.</p>`;
    }
};

/* Met à jour le ratio like/ dislike */

const updateLikeDislikeRatio = async (movieId) => {
    try {
        const response = await axios.get(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies/${movieId}`);
        const likes = response.data.likes;
        const dislikes = response.data.dislikes;

        const total = likes + dislikes;
        const likePercentage = (likes / total) * 100;
        const dislikePercentage = (dislikes / total) * 100;
        
        const likeBar = document.querySelector('.like-bar');
        const dislikeBar = document.querySelector('.dislike-bar');

        likeBar.style.width = `${likePercentage}%`;
        dislikeBar.style.width = `${dislikePercentage}%`;

        let likeRatio = document.querySelector('.like-ratio');
        let dislikeRatio = document.querySelector('.dislike-ratio');

        if (!likeRatio) {
            likeRatio = document.createElement('p');
            likeRatio.className = 'like-ratio';
            document.querySelector('.ratio-like-dislike').appendChild(likeRatio);
        }

        if (!dislikeRatio) {
            dislikeRatio = document.createElement('p');
            dislikeRatio.className = 'dislike-ratio';
            document.querySelector('.ratio-like-dislike').appendChild(dislikeRatio);
        }

        likeRatio.textContent = `${likePercentage.toFixed(1)}%`;
        dislikeRatio.textContent = `${dislikePercentage.toFixed(1)}%`;

    } catch (error) {
        console.error("Erreur lors du calcul du ratio like/dislike :", error.message);
    }
};
