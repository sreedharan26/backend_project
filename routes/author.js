const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const author = require("../models/author");

//To view all authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch (e) {
    res.redirect("/");
  }
});

//To create new authors
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

//To upload the new author to db
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  // try {
  // if(author.name === ''){
  //   throw new Error("Error creating author");
  // }
  await author
    .save()
    .then(() => {
      res.redirect("authors");
    })
    .catch((e) => {
      res.render("authors/new", {
        author: author,
        errorMessage: e.message,
      });
    });
  // } catch (err) {
  // }
});

module.exports = router;
