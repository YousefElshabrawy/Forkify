import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";


import {
    elements,
    renderLoader,
    clearLoader
} from "./views/base";
const state = {};
window.s = state; // for testing 

/***************************************SEARCH CONTROLLER************************************/

const controlSearch = async() => {
    //1. Get query from view.
    const query = searchView.getInput();
    console.log(query);
    if (query) {
        //2. Create new search object and add to the state object. 
        state.search = new Search(query);
        //3. Prepare the UI for the results 
        //A. Clear the input
        searchView.clearInput();
        //B. Clear the previous search result
        searchView.clearResult();
        //C. view the loader
        renderLoader(elements.searchRes);
        //4. Search for recipes
        try {
            await state.search.getResult();
            //5. Remove the Loader and render the results on the UI
            clearLoader();
            searchView.renderResult(state.search.result);
        } catch (err) {
            alert("Something wrong has happened...");
        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); // prevent from reloading
    controlSearch();
});
//We can not attach the event lestener to the button itself as it is not in the page when loading
elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest('.btn-inline');
    const goTo = parseInt(btn.dataset.goto, 10); // base 10
    searchView.clearResult();
    searchView.renderResult(state.search.result, goTo);
});

/***************************************RECIPE CONTROLLER************************************/
const controlRecipe = async() => {
    //1. Get the id from the URL
    const id = window.location.hash.replace('#', '');
    if (id) {
        //2. Prepare the UI
        recipeView.clearResult();
        renderLoader(elements.recipe);
        // highlight the selected item                           /////edit 
        searchView.highlightSelected(id);
        //3. Create new Recipe object
        state.recipe = new Recipe(id);
        try {
            //4. Get the Recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //5. calc the Time and the Servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            //6. render the Recipe
            clearLoader();
            //recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (Error) {
            alert(Error, "Erorr processing recipe !");
        }
    }
};
/*window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);*/
['hashchange', 'load'].forEach(event => addEventListener(event, controlRecipe));


/***************************************LIST CONTROLLER************************************/

const controlList = () => {
    //Create new list if there isn't
    if (!state.list)
        state.list = new List();
    //Add each ingredient to the list and the UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

};
/*********************Handle delete and update list item events***********************/
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count--value')) {
        const value = parseFloat(e.target.value, 10);
        state.list.updateCount(id, value);
    }
});

/***************************************LIKES CONTROLLER************************************/

const controlLikes = () => {
    if (!state.likes) state.likes = new Likes();
    //User HAS liked the recipe
    if (state.likes.isLiked(state.recipe.id)) {
        //Remove the like from the state
        state.likes.deleteLike(state.recipe.id);
        //Toggle the like button
        likesView.toggleLikesButton(false);
        // Remove Liked item from the UI
        likesView.deleteLike(state.recipe.id);
        //User has NOT liked the recipe
    } else {
        //Add like to the state 
        const addedLike = state.likes.addLike(state.recipe.id, state.recipe.title, state.recipe.author, state.recipe.img);
        //Toggle the like button
        likesView.toggleLikesButton(true);
        // Add Liked item to the UI
        likesView.renderLike(addedLike);
    }
    likesView.toggleLikesMenu(state.likes.getNumLikes());
};

/*********************Restore the likes when the page load****************************/
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.restoreStorage();
    likesView.toggleLikesMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(el => {
        likesView.renderLike(el);
    });
});

/*******************Handle recipe button clicks Event Listener************************/
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
            console.log(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
        console.log(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to the shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLikes();
    }
});