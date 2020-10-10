import {
    elements
} from "./base";

export const getInput = () => elements.searchInput.value;
export const clearInput = () => {
    elements.searchInput.value = "";
};
export const clearResult = () => {
    elements.searchResList.innerHTML = "";
    elements.searchResPages.innerHTML = "";
};
export const highlightSelected = (id) => {
    const resultArr = Array.from(document.querySelectorAll(".results__link"));
    resultArr.forEach((el) => {
        el.classList.remove("results__link--active");
    });
    document
        .querySelector(`.results__link[href="#${id}"]`)
        .classList.add("results__link--active");
};
export const limitRecipeTitle = (title, limit = 17) => {
    if (title.length > limit) {
        const titleArr = title.split(" ");
        let count = 0;
        const newTitle = [];
        for (const cur of titleArr) {
            if (count > 17) break;
            count += cur.length;
            newTitle.push(cur);
        }
        return `${newTitle.join(" ")} ....`;
    }
    return title;
};
const renderRecipe = (recipe) => {
    const markup = `
        <li>
            <a class="results__link " href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    < img src = "${recipe.image_url}" alt = "${recipe.title}" >
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(
                      recipe.title
                    )}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

// type: 'prev' or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${
  type === "prev" ? page - 1 : page + 1
}>
        <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${
              type === "prev" ? "left" : "right"
            }"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, numPerPage) => {
    //1. calc the number of pages
    const pages = Math.ceil(numResults / numPerPage);
    //2. check on which page are we
    if (pages > 1) {
        let button;
        if (page === 1) {
            //only on button to the next page
            button = createButton(page, "next");
        } else if (page === pages) {
            //only on button to the prev page
            button = createButton(page, "prev");
        } else {
            // two buttons
            button = `
            ${createButton(page, "prev")}
            ${createButton(page, "next")}
            `;
        }
        elements.searchResPages.insertAdjacentHTML("afterbegin", button);
    }
};
export const renderResult = (result, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    result.slice(start, end).forEach((element) => {
        renderRecipe(element);
    });
    renderButtons(page, result.length, resPerPage);
};