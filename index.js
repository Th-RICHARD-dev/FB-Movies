let length = 0;
let movieStorage = [];
let categoryStorage = [];

/* Initialiser les librairies */

const initSelect = () => {
    try {
        $('.remove .id').select2({
            dropdownCssClass: 'custom-dropdown',
            minimumResultsForSearch: -1,
        });

        $('.update .id').select2({
            dropdownCssClass: 'custom-dropdown',
            minimumResultsForSearch: -1,
        });
        $('.remove-cat .id').select2({
            dropdownCssClass: 'custom-dropdown',
            minimumResultsForSearch: -1,
        });
        $('.update-cat .id').select2({
            dropdownCssClass: 'custom-dropdown',
            minimumResultsForSearch: -1,
        });
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Select2 :", error);
    }
};

const initSwiper = () => {
    try {
        let splide = new Splide('.splide', {
            type: 'loop',
            perPage: 5,
            gap: '15px',
            focus: 'center',
            arrows: false,
            autoplay: true,
            interval: 2500,
        });
        splide.mount();
    } catch (error) {
        console.error("Erreur lors de l'initialisation du carrousel :", error);
    }
};

/* Récupère l'API */

const getAPI = async () => {
    try {
        const movieResponse = await axios.get('https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies');
        movieStorage = movieResponse.data;
        const categoriesResponse = await axios.get('https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/categories');
        categoryStorage = categoriesResponse.data;

        localStorage.setItem('movies', JSON.stringify(movieStorage));
        localStorage.setItem('categories', JSON.stringify(categoryStorage));
    } catch (error) {
        console.error("Erreur lors du chargement des données depuis l'API :", error);
    }
}

/* Stock l'API dans le localStorage et appelle les fonctions au chargement de la page */

window.onload = () => {

    getAPI();

    movieStorage = JSON.parse(localStorage.getItem('movies')) || [];
    categoryStorage = JSON.parse(localStorage.getItem('categories')) || [];

    console.info('Films :', movieStorage);
    console.info('Catégories :', categoryStorage);

    initSelect();

    displayMoviesAndCategories();
    displayCategories();

    addTopCategories();
    addTopMovies(movieStorage, 5);
    searchContentByCategories();
    searchContentByInput();

    modalsContent();

    addMovie();
    removeMovie();
    updateMovie();

    addCategory();
    removeCategory();
    updateCategory();

    hideCategoriesMarqueeOnScroll();
};

/* Affiche des films et des catégories en en-tête */

const addTopCategories = () => {
    try {
        const categories = JSON.parse(localStorage.getItem('categories'));

        const marquee = document.querySelector('.marquee');

        for (let i = 0; i < categories.length; i++) {
            marquee.innerHTML += `<p class='marquee-content'>${categories[i].name}</p>`;
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout des catégories :", error);
    }
};

const addTopMovies = (movieStorage, max) => {
    try {
        const topMovies = movieStorage.sort((a, b) => b.likes - a.likes).slice(0, max);

        const slideWrapper = document.querySelector('.splide__list');
        slideWrapper.innerHTML = '';

        for (let i = 0; i < max; i++) {
            const slide = document.createElement('li');
            slide.classList.add('splide__slide');

            const img = document.createElement('img');
            img.src = topMovies[i].img;
            img.alt = topMovies[i].name;

            slide.appendChild(img);
            slideWrapper.appendChild(slide);

            slide.addEventListener('click', () => {
                window.location.href = `movie.html?id=${topMovies[i].id}`;
            });
        }

        initSwiper();
    } catch (error) {
        console.error("Erreur lors de l'ajout des films populaires :", error);
    }
};

/* Masque la bannière lorsque le scroll est à la section catégorie */

const hideCategoriesMarqueeOnScroll = () => {
    const marquee = document.querySelector('.marquee');
    const categoriesSection = document.querySelector('.categories-title');
    let isMarqueeHidden = false;

    window.addEventListener('scroll', () => {
        const categoriesTop = categoriesSection.getBoundingClientRect().top;

        if (categoriesTop <= 250 && !isMarqueeHidden) {
            marquee.classList.add('hide');
            isMarqueeHidden = true;
        } 
        else if (categoriesTop > 250 && isMarqueeHidden) {
            marquee.classList.remove('hide');
            isMarqueeHidden = false;
        }
    });
};

/* Affiche la grille filtrer des films avec leurs catégories */

const displayMoviesAndCategories = () => {
    try {
        const result = document.querySelector('.result-number');
        result.innerHTML = movieStorage.length;

        displayFilteredMoviesAndCategories(movieStorage);

        const likeFilter = document.querySelector('.likes-filter');
        likeFilter.addEventListener('click', () => {
            const filterByLikes = movieStorage.sort((a, b) => b.likes - a.likes);
            grid.innerHTML = '';
            displayFilteredMoviesAndCategories(filterByLikes);
        })

        const nameFilter = document.querySelector('.name-filter');
        nameFilter.addEventListener('click', () => {
            const filterByNames = movieStorage.sort((a, b) => a.name.localeCompare(b.name));
            grid.innerHTML = '';
            displayFilteredMoviesAndCategories(filterByNames);
        })

        const categoryFilter = document.querySelector('.categories-filter');
        categoryFilter.addEventListener('click', () => {
            const filterByCategories = [];
            categoryStorage.forEach(category => {
                const categoryMovies = movieStorage.filter(movie => movie.category === category.id);
                filterByCategories.push(...categoryMovies);
            });
            grid.innerHTML = '';
            displayFilteredMoviesAndCategories(filterByCategories);
        });

    } catch (error) {
        console.error("Erreur lors de l'affichage des films et des catégories :", error);
    }
};

const displayFilteredMoviesAndCategories = (filter) => {
    const grid = document.getElementById('grid');

    filter.forEach(movie => {
        const newGridChild = document.createElement('div');
        newGridChild.classList.add('movies-categories');
        newGridChild.addEventListener('click', () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });
        grid.appendChild(newGridChild);

        displayMovie(newGridChild, movie);
        displayCategory(newGridChild, movie.category);
    })
}

const displayMovie = (gridChild, movie) => {
    try {
        const name = document.createElement('h2');
        name.classList.add('movies-names');
        gridChild.appendChild(name);
        name.innerHTML = movie.name;

        const vignette = document.createElement('img');
        vignette.classList.add('movies-vignettes');
        gridChild.appendChild(vignette);
        vignette.src = movie.img;
    } catch (error) {
        console.error("Erreur lors de l'affichage d'un film :", error);
    }
};

const displayCategory = (gridChild, category) => {
    try {
        const categoryObj = categoryStorage.find(categories => categories.id === category);

        if (categoryObj) {
            const categories = document.createElement('h3');
            categories.classList.add('categories-names');
            gridChild.appendChild(categories);
            categories.innerHTML = categoryObj.name;
        }
    } catch (error) {
        console.error("Erreur lors de l'affichage d'une catégorie :", error);
    }
};

/* Recherche des films par barre de recherche/ tags */

const searchContentByCategories = () => {
    const marquee = document.querySelector('.marquee');
    const reset = document.querySelector('.reset');

    const categories = JSON.parse(localStorage.getItem('categories'));
    const movies = JSON.parse(localStorage.getItem('movies'));

    marquee.addEventListener('click', (event) => {
        if (event.target.classList.contains('marquee-content')) {

            const filteredCategories = categories.find(category => category.name === event.target.textContent);
            const filteredMovies = movies.filter(movie => movie.category === filteredCategories.id);

            console.log(filteredMovies);

            const result = document.querySelector('.result-number');
            result.innerHTML = filteredMovies.length;

            if (filteredMovies.length === 0) {
                grid.innerHTML = '<div class="search-result"><p class="no-result">Aucun films associés</p><a href="#2" class="no-result-add">Ajoutez en un !</a><div>';

                reset.style.display = 'initial';
            } else {
                grid.innerHTML = '';

                filteredMovies.forEach(movie => {
                    const newGridChild = document.createElement('div');
                    newGridChild.classList.add('movies-categories');
                    newGridChild.addEventListener('click', () => {
                        window.location.href = `movie.html?id=${movie.id}`;
                    });
                    grid.appendChild(newGridChild);

                    reset.style.display = 'initial';

                    displayMovie(newGridChild, movie);
                    displayCategory(newGridChild, movie.category);
                });
            }
        }
    });
    reset.addEventListener('click', () => {
        reset.style.display = 'none';

        grid.innerHTML = '';
        displayMoviesAndCategories();
    })
};

const searchContentByInput = () => {
    try {
        const searchbar = document.querySelector('.searchbar');
        const grid = document.getElementById('grid');

        searchbar.addEventListener('input', (e) => {
            const input = e.target.value.toLowerCase().trim();

            if (input !== '') {
                grid.innerHTML = '';

                const filteredMovies = movieStorage.filter(movie => movie.name.toLowerCase().includes(input));

                const result = document.querySelector('.result-number');
                result.innerHTML = filteredMovies.length;

                if (filteredMovies.length === 0) {
                    grid.innerHTML = '<div class="search-result"><p class="no-result">Aucun films associés</p><a href="#2" class="no-result-add">Ajoutez en un !</a><div>';
                } else {
                    grid.innerHTML = '';

                    filteredMovies.forEach(movie => {
                        const newGridChild = document.createElement('div');
                        newGridChild.classList.add('movies-categories');
                        newGridChild.addEventListener('click', () => {
                            window.location.href = `movie.html?id=${movie.id}`;
                        });
                        grid.appendChild(newGridChild);

                        displayMovie(newGridChild, movie);
                        displayCategory(newGridChild, movie.category);
                    });
                }
            } else {
                const result = document.querySelector('.result-number');
                result.innerHTML = movieStorage.length;
                grid.innerHTML = '';

                displayMoviesAndCategories();
            }
        });
    } catch (error) {
        console.error("Erreur lors de la recherche de contenu :", error);
    }
};

/* Affiche les fenêtres d'ajout/ de mise à jour/ de suppression des films */

const modalsContent = () => {
    try {
        const body = document.querySelector('body');
        addMenu(body);
        updateMenu(body);
        removeMenu(body);

        addCategoryMenu(body);
        removeCategoryMenu(body);
        updateCategoryMenu(body);
    } catch (error) {
        console.error("Erreur lors de la gestion des modals :", error);
    }
};

const addMenu = (body) => {
    try {
        const openAddMenu = document.querySelector('.add-movie');
        const closeAddMenu = document.querySelector('.close-add');
        const AddMenu = document.querySelector('.add-modal');

        openAddMenu.addEventListener('click', () => {
            AddMenu.style.display = 'block';
            body.style.overflow = 'hidden';
        });
        closeAddMenu.addEventListener('click', () => {
            AddMenu.style.display = 'none';
            body.style.overflow = 'auto';
        });
    } catch (error) {
        console.error("Erreur lors de l'ouverture/fermeture du menu d'ajout :", error);
    }
};

const removeMenu = (body) => {
    try {
        const openRemoveMenu = document.querySelector('.remove-movie');
        const closeRemoveMenu = document.querySelector('.close-remove');
        const removeMenu = document.querySelector('.remove-modal');

        openRemoveMenu.addEventListener('click', () => {
            removeMenu.style.display = 'block';
            body.style.overflow = 'hidden';
        });
        closeRemoveMenu.addEventListener('click', () => {
            removeMenu.style.display = 'none';
            body.style.overflow = 'auto';
        });
    } catch (error) {
        console.error("Erreur lors de l'ouverture/fermeture du menu de suppression :", error);
    }
};

const updateMenu = (body) => {
    try {
        const openUpdateMenu = document.querySelector('.update-movie span');
        const closeUpdateMenu = document.querySelector('.close-update');
        const updateMenu = document.querySelector('.update-modal');

        openUpdateMenu.addEventListener('click', () => {
            updateMenu.style.display = 'block';
            body.style.overflow = 'hidden';
        });
        closeUpdateMenu.addEventListener('click', () => {
            updateMenu.style.display = 'none';
            body.style.overflow = 'auto';
        });
    } catch (error) {
        console.error("Erreur lors de l'ouverture/fermeture du menu de mise à jour :", error);
    }
};

/* Ajout/ Mise à jour/ Suppression des films */

const addMovie = () => {
    try {
        const form = document.querySelector('.add');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const author = formData.get('author');
            const category = formData.get('category');
            const description = formData.get('description');
            const img = formData.get('img');
            const video = formData.get('video');

            axios.post('https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies/', {
                name: name,
                author: author,
                category: category,
                description: description,
                img: img,
                video: video
            })
                .then((json) => {
                    console.log("Film ajouté avec succès :", json);
                })
                .catch((error) => {
                    console.error("Erreur lors de l'ajout du film :", error);
                });
        });
    } catch (error) {
        console.error("Erreur globale dans la fonction d'ajout de film :", error);
    }
};

const removeMovie = () => {
    try {
        const form = document.querySelector('.remove');
        const select = document.querySelector('.remove .id');

        movieStorage.forEach((movie) => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.name;
            select.appendChild(option);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id');

            axios.delete(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies/${id}`)
                .then((json) => {
                    console.log("Film supprimé avec succès :", json);
                })
                .catch((error) => {
                    console.error("Erreur lors de la suppression du film :", error);
                });
        });
    } catch (error) {
        console.error("Erreur globale dans la fonction de suppression de film :", error);
    }
};

const updateMovie = () => {
    try {
        const form = document.querySelector('.update');
        const select = document.querySelector('.update .id');

        movieStorage.forEach((movie) => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.name;
            select.appendChild(option);
        });

        $('.update .id').on('select2:select', (e) => {
            const selectedMovieId = e.params.data.id;

            try {
                const selectedMovie = movieStorage.find((movie) => movie.id === selectedMovieId);

                if (selectedMovie) {
                    document.querySelector('#name-2').value = selectedMovie.name || '';
                    document.querySelector('#author-2').value = selectedMovie.author || '';
                    document.querySelector('#category-2').value = selectedMovie.category || '';
                    document.querySelector('#description-2').value = selectedMovie.description || '';
                    document.querySelector('#img-2').value = selectedMovie.img || '';
                    document.querySelector('#video-2').value = selectedMovie.video || '';
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données du film à mettre à jour :", error);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const formData = new FormData(e.target);
                const id = formData.get('id');

                const name = formData.get('name-2');
                const author = formData.get('author-2');
                const category = formData.get('category-2');
                const description = formData.get('description-2');
                const img = formData.get('img-2');
                const video = formData.get('video-2');

                await axios.patch(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/movies/${id}`, {
                    name: name,
                    author: author,
                    category: category,
                    description: description,
                    img: img,
                    video: video
                })
                    .then((json) => {
                        console.log("Film mis à jour avec succès :", json);
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la mise à jour du film :", error);
                    });
            } catch (error) {
                console.error("Erreur globale dans la fonction de mise à jour de film :", error);
            }
        });
    } catch (error) {
        console.error("Erreur dans la gestion du menu de mise à jour :", error);
    }
};

/* Affiche la listes des catégories */

const displayCategories = () => {
    try {
        const categories = JSON.parse(localStorage.getItem('categories'));

        const list = document.querySelector('.categories-list');

        for (let i = 0; i < categories.length; i++) {
            list.innerHTML += `<p class='categories'>${categories[i].name}</p>`;
        }

        list.innerHTML += `<p class='categories-more'>+</p>`
    } catch (error) {
        console.error("Erreur lors de l'ajout des catégories :", error);
    }
}

/* Affiche les fenêtres d'ajout/ de mise à jour/ de suppression des catégories */

const addCategoryMenu = (body) => {
    try {
        const openAddMenu = document.querySelector('.categories-more');
        const closeAddMenu = document.querySelector('.close-category-add');
        const AddMenu = document.querySelector('.add-category-modal');

        openAddMenu.addEventListener('click', () => {
            AddMenu.style.display = 'block';
            body.style.overflow = 'hidden';
        });
        closeAddMenu.addEventListener('click', () => {
            AddMenu.style.display = 'none';
            body.style.overflow = 'auto';
        });
    } catch (error) {
        console.error("Erreur lors de l'ouverture/fermeture du menu d'ajout :", error);
    }
};

const removeCategoryMenu = (body) => {
    try {
        const openRemoveMenu = document.querySelector('.remove-category');
        const closeRemoveMenu = document.querySelector('.close-category-remove');
        const removeMenu = document.querySelector('.remove-category-modal');
        const existingMovieInCategory = document.querySelector('.existing');

        openRemoveMenu.addEventListener('click', () => {
            removeMenu.style.display = 'block';
            body.style.overflow = 'hidden';
            existingMovieInCategory.style.display = 'none';
        });
        closeRemoveMenu.addEventListener('click', () => {
            removeMenu.style.display = 'none';
            body.style.overflow = 'auto';
        });
    } catch (error) {
        console.error("Erreur lors de l'ouverture/fermeture du menu de suppression :", error);
    }
};

const updateCategoryMenu = (body) => {
    try {
        const openUpdateMenu = document.querySelector('.update-category');
        const closeUpdateMenu = document.querySelector('.close-category-update');
        const updateMenu = document.querySelector('.update-category-modal');

        openUpdateMenu.addEventListener('click', () => {
            updateMenu.style.display = 'block';
            body.style.overflow = 'hidden';
        });
        closeUpdateMenu.addEventListener('click', () => {
            updateMenu.style.display = 'none';
            body.style.overflow = 'auto';
        });
    } catch (error) {
        console.error("Erreur lors de l'ouverture/fermeture du menu de mise à jour :", error);
    }
};

/* Ajout/ Mise à jour/ Supression d'un catégorie */

const addCategory = () => {
    try {
        const form = document.querySelector('.add-cat');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('name-3');

            axios.post('https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/categories/', {
                name: name,
            })
                .then((json) => {
                    console.log("Catégorie ajouté avec succès :", json);
                })
                .catch((error) => {
                    console.error("Erreur lors de l'ajout de la catégorie :", error);
                });
        });
    } catch (error) {
        console.error("Erreur globale dans la fonction d'ajout de catégorie :", error);
    }
};

const removeCategory = () => {
    try {
        const form = document.querySelector('.remove-cat');
        const select = document.querySelector('.remove-cat .id');

        categoryStorage.forEach((cat) => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id');

            const selectedCategory = movieStorage.find((movie) => movie.category === id);
            if (!selectedCategory) {
                axios.delete(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/categories/${id}`)
                    .then((json) => {
                        console.log("Catégorie supprimé avec succès :", json);
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la suppression de la catégorie :", error);
                    });
            } else {
                const existingMovieInCategory = document.querySelector('.existing');
                existingMovieInCategory.style.display = 'block';
            }
        });
    } catch (error) {
        console.error("Erreur globale dans la fonction de suppression de la catégorie :", error);
    }
};

const updateCategory = () => {
    try {
        const form = document.querySelector('.update-cat');
        const select = document.querySelector('.update-cat .id');

        categoryStorage.forEach((cat) => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });

        $('.update-cat .id').on('select2:select', (e) => {
            const selectedCategoryId = e.params.data.id;
            console.log(selectedCategoryId);

            try {
                const selectedCategory = categoryStorage.find((cat) => cat.id === selectedCategoryId);

                if (selectedCategory) {
                    document.querySelector('#name-4').value = selectedCategory.name || '';
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données du film à mettre à jour :", error);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const formData = new FormData(e.target);
                const id = formData.get('id');

                const name = formData.get('name-4');

                await axios.put(`https://europe-west3-gobelins-9079b.cloudfunctions.net/api/v1/categories/${id}`, {
                    name: name
                })
                    .then((json) => {
                        console.log("Catégorie mis à jour avec succès :", json);
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la mise à jour de la catégorie :", error);
                    });
            } catch (error) {
                console.error("Erreur globale dans la fonction de mise à jour de la catégorie :", error);
            }
        });
    } catch (error) {
        console.error("Erreur dans la gestion du menu de mise à jour :", error);
    }
};