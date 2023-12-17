const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, cb) => {
    cb(null, imageMimeTypes.includes(file.mimetype));
  },
});

//To view all books
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  if (req.query.publishedBefore != null && req.query.publishedAfter != null) {
    searchOptions.publishDate = {
      $lte: new Date(req.query.publishedBefore),
      $gte: new Date(req.query.publishedAfter),
    };
  } else if (req.query.publishedBefore != null) {
    searchOptions.publishDate = { $lte: new Date(req.query.publishedBefore) };
  } else if (req.query.publishedAfter != null) {
    searchOptions.publishDate = { $gte: new Date(req.query.publishedAfter) };
  }
  try {
    const books = await Book.find(searchOptions);
    res.render("books/index", {
      books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

//To create new books
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//To upload the new book to db
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : "";
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImage: fileName,
  });

  try {
    const newBook = await book.save();
    res.redirect("/books");
  } catch (e) {
    if (book.coverImage != null) {
      removeBookCover(fileName);
    }
    console.log(e);
    renderNewPage(res, book, true);
  }
});

function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), (e) => {
    if (e) {
      console.log(e);
    }
  });
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book,
    };
    if (hasError) params.errorMessage = "Error";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

module.exports = router;
