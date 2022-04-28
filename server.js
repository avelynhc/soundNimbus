const express = require("express");
const app = express();

const env = require("dotenv");
env.config();

const path = require("path");
const musicData = require("./musicData");
const userData = require("./userData");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const HTTP_PORT = process.env.PORT;
const onHttpStart = () =>
  console.log(`HTTP server is listening on port ${HTTP_PORT} 🚀🚀🚀`);

app.use(
  clientSessions({
    cookieName: "session",
    secret: "soundNimbus9001April62022TopSecretPassword",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(express.static("public"));

// for form data without file
app.use(express.urlencoded({ extended: true }));

// multer middleware
const upload = multer();

// handle bars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
  })
);
app.set("view engine", ".hbs");

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {

  musicData.getAlbums().then((data) => {
    res.render("index", {
      data: data,
      layout: "main",
    });
  });
});

app.get("/lyrics/:id", (req, res) => {
  musicData
    .getAlbums()
    .then((data) => {
      res.json(data[req.params.id - 1].lyrics);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send("ERROR!");
    });
});

app.get("/music", (req, res) => {
  musicData.getAlbums().then((data) => {
    res.json(data);
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    data: null,
    layout: "main",
  });
});

app.get("/info/:id", (req, res) => {
  musicData
    .getAlbums()
    .then((data) => {
      res.json(data[req.params.id - 1]);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send("ERROR!");
    });
});

app.get("/albums/new", (req, res) => {
  res.render("albums", {
    data: null,
    layout: "main",
  });
});

app.get("/songs/new", (req, res) => {
  musicData.getAlbums().then((data) => {
    res.render("songs", {
      data: data,
      layout: "main",
    });
  });
});

app.get("/songs/:id", (req, res) => {
  musicData.getSongsByAlbumID(req.params.id).then((data) => {
    res.render("albumSongs", {
      data: data,
      layout: "main",
    });
  });
});

app.get("/albums/delete/:id", ensureLogin, (req, res) => {
  musicData
    .deleteAlbum(req.params.id)
    .then((data) => {
      res.redirect("/home");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("ERROR!");
    });
});

app.get("/songs/delete/:id", (req, res) => {
  musicData
    .deleteSong(req.params.id)
    .then((data) => {
      res.redirect("/home");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("ERROR!");
    });
});

app.post("/albums/new", upload.single("photo"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.imagePath = uploaded.url;
    console.log(req.body);

    musicData
      .addAlbum(req.body)
      .then((data) => {
        res.redirect("/home");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  });
});

app.post("/songs/new", upload.single("song"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw" },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req)
  .then((uploaded) => {
    req.body.musicPath = uploaded.url;
    console.log(req.body);

    musicData
      .addSong(req.body)
      .then((data) => {
        res.redirect("/home");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  })
  .catch(err => {
    console.log(err);
  })
});

app.get("/login", (req, res) => {
  res.render("login", {
    layout: "main",
  });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  userData
    .verifyLogin(req.body)
    .then((mongoData) => {
      req.session.user = {
        username: mongoData.username,
        email: mongoData.email,
        loginHistory: mongoData.loginHistory,
      };

      console.log("userData:" + mongoData);

      console.log(req.session);
      res.redirect("/home");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.get("/register", (req, res) => {
  res.render("register", {
    layout: "main",
  });
});

app.post("/register", (req, res) => {
  userData
    .registerUser(req.body)
    .then((data) => {
      console.log(data);
      res.render("register", {
        layout: "main",
        successMessage: "USER CREATED",
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("register", {
        layout: "main",
        errorMessage: error,
      });
    });
});

app.use((req, res) => {
  res.status(404).send("PAGE NOT FOUND!!");
});

musicData
  .initialize()
  .then(userData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((error) => {
    console.log(error);
  });
