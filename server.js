const express = require("express")
const app = express()
const path = require("path")

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

app.listen(HTTP_PORT, onHttpStart)
