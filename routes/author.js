const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const author = require("../models/author");
const Book = require("../models/book");

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

router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", {
      author,
      booksByAuthor: books,
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author });
  } catch {
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author,
        errorMessage: "Error updating Author",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`${author.id}`);
    }
  }
});

module.exports = router;
