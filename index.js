require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const urlParser = require("url");
const dns = require("dns");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));

const port = process.env.PORT || 3000;

//mongoose connection
const myUrl =
  "mongodb+srv://douglasvolcato:Rejane123@cluster0.fc9zbgi.mongodb.net/Cluster0?retryWrites=true&w=majority";
const mongoose = require("mongoose");
mongoose.connect(myUrl, { useNewUrlParser: true, useUnifiedTopology: true });

//new mongoose schema
const schema = new mongoose.Schema({ url: "string" });
const Url = mongoose.model("Url", schema);

//main page
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// API url convertion endpoint
app.post("/shorturl", async function (req, res) {
  const bodyUrl = req.body.url;

  const parsedUrl = dns.lookup(
    urlParser.parse(bodyUrl).hostname,
    (err, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" });
      } else {
        const link = new Url({ url: bodyUrl });

        link.save((err, data) => {
          res.json({
            original_url: data.url,
            short_url:
              "https://douglasvolcato-url-shortener.herokuapp.com/shorturl/" +
              data.id,
          });
        });
      }
    }
  );
});

// API search id endpoint
app.get("/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Invalid URL" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
