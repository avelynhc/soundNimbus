const express = require("express")
const app = express()

const exphbs = require('express-handlebars');

const env = require("dotenv")
env.config()

const path = require("path")
const musicData = require("./musicData")

const multer = require("multer")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")

// environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
})

const HTTP_PORT = process.env.PORT 
const onHttpStart = () => console.log(`Express server is listening on port ${HTTP_PORT} 🚀🚀🚀`)

app.use(express.static("public"))

// for form data without file
// app.use(express.urlencoded({extended: true}))

// multer middleware
const upload = multer()

// handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

app.get("/", (req, res) => {
    // res.send("SoundNimbus")
    // res.sendFile(path.join(__dirname, "/views/index.html"))
    res.redirect("/home")
})

app.get("/home", (req, res) => {
    // res.send("Hello Home!")
    // res.sendFile(path.join(__dirname, "/views/index.html"))
    musicData.getAlbums().then((data) => {
        res.render('index', {
            data: data,
            layout: "main"
        })
    })
})

app.get("/about", (req, res) => {
    res.send("Hello about!")
})

// app.get("/lyrics", (req, res) => {
//     // res.send("Hello lyrics!")
//     musicData.getalbums().then((data) => {
//         res.send(data)
//         // or res.json(data)
//     }).catch((error) => {
//         console.log(error)
//         res.status(404).send("ERROR!")
//     })
// })

app.get("/lyrics/:id", (req, res) => {
    // res.send("Hello lyrics!")
    musicData.getAlbums().then((data) => {
        // res.send(data)
        // or res.json(data)
        // res.send(req.params.id) // this id comes from endpoint id
        // res.send(data[0]) // access first item in the array
        // res.json(data[req.params.id-1])
        res.json(data[req.params.id-1].lyrics)
    }).catch((error) => {
        console.log(error)
        res.status(404).send("ERROR!")
    })
})

app.get("/info/:id", (req, res) => {
    // res.send("Hello music!")
    musicData.getAlbums().then((data) => {
        // res.send(data)
        // or res.json(data)
        // res.send(req.params.id) // this id comes from endpoint id
        // res.send(data[0]) // access first item in the array
        res.json(data[req.params.id-1])
        // res.json(data[req.params.id-1].lyrics)
    }).catch((error) => {
        console.log(error)
        res.status(404).send("internal server")
    })
})

app.get("/music", (req, res) => {
    // res.send("Hello Music!")
    musicData.getAlbums().then((data) => {
        res.json(data)
    }).catch((error) => {
        console.log(error)
        res.status(404).send("internal server")
    })
})

app.get("/albums", (req, res) => {
    // res.sendFile(path.join(__dirname, "/views/albums.html"))
    res.render('albums', {
        data: null,
        layout: "main"
    })
})

app.post("/albums/new", upload.single("photo"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result)
                } else {
                  reject(error)
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

    upload(req).then((uploaded) => {
        req.body.imagePath = uploaded.url
        console.log(req.body)

        musicData.addAlbum(req.body).then((data) => {
            res.redirect('/home')
        }).catch((error) => {
            res.status(500).send(error)
        })

    // res.send(JSON.stringify(req.body))
    })
    // formData = req.body
    // res.send(JSON.stringify(formData))
})

app.use((req, res) => {
    res.status(404).send("page not found")
})

// app.listen(HTTP_PORT, onHttpStart)

musicData.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart)
}).catch((error) => console.log(error))
