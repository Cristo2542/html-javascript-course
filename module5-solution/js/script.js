$(function () { // Same as document.addEventListener("DOMContentLoaded", ...)

  // Same as a sidebar toggle
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {

var dc = {};

var homeHtml = "snippets/home-snippet.html";
var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string.replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

// Remove the class 'active' from home and switch to Menu button
var switchMenuToActive = function () {
  // Remove 'active' from home button
  var classes = document.querySelector("#navHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#navHomeButton").className = classes;

  // Add 'active' to menu button if not already there
  classes = document.querySelector("#navMenuButton").className;
  if (classes.indexOf("active") === -1) {
    classes += " active";
    document.querySelector("#navMenuButton").className = classes;
  }
};

// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {

  // On first load, show home view and pass categories to buildAndShowHomeHTML
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowHomeHTML,
    true);
});

// STEP 0: Implement chooseRandomCategory
function chooseRandomCategory(categories) {
  var randomIndx = Math.floor(Math.random() * categories.length);
  return categories[randomIndx].short_name;
}

// STEP 1-3: Load home view with a random category for Specials
function buildAndShowHomeHTML(categories) {
  // Load home snippet
  $ajaxUtils.sendGetRequest(
    homeHtml,
    function (responseText) {
      // STEP 1: Choose a random category short name
      var randomCategoryShortName = chooseRandomCategory(categories);

      // STEP 2: Substitute {{randomCategoryShortName}} in the home html snippet
      var homeHtmlToInsertIntoMainPage = insertProperty(responseText, "randomCategoryShortName", "'" + randomCategoryShortName + "'");

      // STEP 3: Insert the produced HTML into the main page view
      insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
    },
    false);
}

// Load the menu categories view
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML);
};

// Load the menu items view
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort + ".json",
    buildAndShowMenuItemsHTML);
};

// Builds HTML for the categories page based on the data
// from the server
function buildAndShowCategoriesHTML(categories) {
  // Load title snippet of categories page
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {
          switchMenuToActive();

          var categoriesViewHtml =
            buildCategoriesViewHtml(categories,
                                    categoriesTitleHtml,
                                    categoryHtml);
          insertHtml("#main-content", categoriesViewHtml);
        },
        false);
    },
    false);
}

// Using categories data and snippets html
// build categories view HTML to be inserted into page
function buildCategoriesViewHtml(categories,
                                categoriesTitleHtml,
                                categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over categories
  for (var i = 0; i < categories.length; i++) {
    // Insert values
    var html = categoryHtml;
    var name = "" + categories[i].name;
    var short_name = categories[i].short_name;
    html =
      insertProperty(html, "name", name);
    html =
      insertProperty(html, "short_name", short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

// Builds HTML for the single category page based on the data
// from the server
function buildAndShowMenuItemsHTML(categoryMenuItems) {
  // Load title snippet of menu items page
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      // Retrieve single menu item snippet
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          switchMenuToActive();

          var menuItemsViewHtml =
            buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleHtml,
                                   menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
        false);
    },
    false);
}

// Using category and menu items data and snippets html
// build menu items view HTML to be inserted into page
function buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml) {

  var moduleSnippetHtml = insertProperty(menuItemsTitleHtml,
                                         "name",
                                         categoryMenuItems.category.name);
  moduleSnippetHtml = insertProperty(moduleSnippetHtml,
                                     "special_instructions",
                                     categoryMenuItems.category.special_instructions);

  var finalHtml = moduleSnippetHtml;
  finalHtml += "<section class='row'>";

  // Loop over menu items
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    // Insert values
    var html = menuItemHtml;
    html =
      insertProperty(html, "short_name", menuItems[i].short_name);
    html =
      insertProperty(html, "catShortName", catShortName);
    html =
      insertProperty(html, "name", menuItems[i].name);
    html =
      insertProperty(html, "description", menuItems[i].description);

    if (menuItems[i].price_small) {
      html =
        insertProperty(html, "price_small", menuItems[i].price_small);
    } else {
      html = insertProperty(html, "price_small", "");
    }
    
    if (menuItems[i].portion_name_small) {
      html =
        insertProperty(html, "portion_name_small", menuItems[i].portion_name_small);
    } else {
      html = insertProperty(html, "portion_name_small", "");
    }

    if (menuItems[i].price_large) {
      html =
        insertProperty(html, "price_large", menuItems[i].price_large);
    } else {
      html = insertProperty(html, "price_large", "");
    }

    if (menuItems[i].portion_name_large) {
      html =
        insertProperty(html, "portion_name_large", menuItems[i].portion_name_large);
    } else {
      html = insertProperty(html, "portion_name_large", "");
    }

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

global.$dc = dc;

})(window);
