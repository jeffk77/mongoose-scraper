var request = require("request");
var cheerio = require("cheerio");
var db = require("../models");

module.exports = function (app) {
  app.get('/remove', function (req, res) {
    db.Article.deleteMany(function (err, result) {
      if (err) throw err;
      if (result) console.log("Collection deleted");
    });

    request("https://www.cp24.com/news/", function (err, response, html) {

      var $ = cheerio.load(response.body);

      var result = {};

      $(".teaserText").each(function (i, element) {

        // Grabbing the article title and link from each story on the page
        result.title = $(element).find(".teaserTitle").text();
        result.link = $(this).find("a").attr("href");

        // Building a new article setup using the scraped data
        db.Article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            return res.json(err);
          });
      });

      console.log("Scraping complete!");
      res.json(true);
    });
  });

  app.post("/Articles/:id", function (req, res) {
    db.Article.updateOne(
      { _id: req.params.id },
      { $set: { saved: true } }
    ).then(function (dbArticle) {
      
      // Empty "scrape" response
      console.log(dbArticle);
      res.send(true);
    })
      .catch(function (err) {
        console.log(dbArticle)
        
        // Error response
        res.json(err);
      });
  });

  app.post("/Articles/unsave/:id", function (req, res) {
    db.Article.updateOne(
      { _id: req.params.id },
      { $set: { saved: false } }
    ).then(function (dbArticle) {
      console.log(dbArticle);
      res.send(true);
    })
      .catch(function (err) {
        console.log(dbArticle)
        res.json(err);
      });
  });

  app.get("/Notes/:id", function (req, res) {
    db.Note.find({ articleId: req.params.id }).limit(1).sort({ $natural: -1 })
      .then(function (dbNote) {
        res.json(dbNote);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  app.post("/Notes", function (req, res) {
    let result = {};

    result.articleId = req.body.articleId;
    result.message = req.body.message;

    db.Note.create(result)
      .then(function (dbNote) {
        console.log(dbNote);
        console.log('Note Saved!');
        res.json(true);
      })
      .catch(function (err) {
        return res.json(err);
      });
  });
};
