const express = require("express")
const app = express()
const path = require("path")
const { traceDeprecation } = require("process")
const musicData = require("./musicData")

const HTTP_PORT = process.env.port || 8080
const onHttpStart = () => console.log(`Express server is listening on port ${HTTP_PORT}`)

app.use(express.static("public"))

app.get("/", (req, res) => {
    // res.send("SoundNimbus")
    // res.sendFile(path.join(__dirname, "/views/index.html"))
    res.redirect("/home")
})

app.get("/home", (req, res) => {
    // res.send("Hello Home!")
    res.sendFile(path.join(__dirname, "/views/index.html"))
})

app.get("/about", (req, res) => {
    res.send("Hello about!")
})

app.get("/lyrics", (req, res) => {
    // res.send("Hello lyrics!")
    musicData.getalbums().then((data) => {
        res.send(data)
        // or res.json(data)
    }).catch((error) => {
        console.log(error)
        res.status(404).send("ERROR!")
    })
})

app.get("/lyrics/:id", (req, res) => {
    // res.send("Hello lyrics!")
    musicData.getalbums().then((data) => {
        // res.send(data)
        // or res.json(data)
        // res.send(req.params.id) // this id comes from endpoint id
        // res.send(data[0]) // access first item in the array
        res.json(data[req.params.id-1])
        res.json(data[req.params.id-1].lyrics)
    }).catch((error) => {
        console.log(error)
        res.status(404).send("ERROR!")
    })
})

app.get("/info/:id", (req, res) => {
    // res.send("Hello music!")
    musicData.getalbums().then((data) => {
        // res.send(data)
        // or res.json(data)
        // res.send(req.params.id) // this id comes from endpoint id
        // res.send(data[0]) // access first item in the array
        res.json(data[req.params.id-1])
        res.json(data[req.params.id-1].lyrics)
    }).catch((error) => {
        console.log(error)
        res.status(404).send("ERROR!")
    })
})

app.get("/music", (req, res) => {
    res.send("Hello Music!")
})

app.use((req, res) => {
    res.status(404).send("PAE NOT FOUND")
})

app.listen(HTTP_PORT, onHttpStart)
