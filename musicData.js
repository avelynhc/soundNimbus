const fs = require("fs")

let albums = []

// use initialize instead of reading file every time, getAlbums function returns the albums array (initially filled by initialized)
module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/albums.json", "utf-8", (error, data) => {
            if(error) {
                reject(error)
            } else {
                albums = JSON.parse(data)
                // console.log(albums)
                resolve(albums)
            }
        })
    })
}

module.exports.addAlbum = function(album) {
    return new Promise((resolve, reject) => {
        album.id = albums.length + 1
        albums.push(album)
        resolve()
    })
}

module.exports.getAlbums = function() {
    return new Promise((resolve, reject) => {
        if (albums.length > 0) resolve(albums)
        else reject("no results returned")
    })
}