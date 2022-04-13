const env = require('dotenv')
env.config()

const Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Album = sequelize.define('Album', {
    albumID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    title: Sequelize.STRING,
    year: Sequelize.INTEGER,
    artist: Sequelize.STRING,
    imagePath: Sequelize.STRING
})

var Song = sequelize.define('Song', {
    songID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    title: Sequelize.STRING,
    musicPath: Sequelize.STRING,
    lyrics: Sequelize.STRING
})

Song.belongsTo(Album, {foreignKey: 'albumID'})

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve()
        }).catch((error) => {
            console.log(error)
            reject("SYNC FAILED")
        })
    })}


module.exports.getAlbums = function() {
    return new Promise((resolve, reject) => {
        Album.findAll().then((data) => {
            resolve(data)
        })
        .catch((error) => {
            console.log(error)
            reject()
        })
    })
}

module.exports.getSongsByAlbumID = function(albumID) {
    return new Promise((resolve, reject) => {
        Song.findAll({
            where: {
                albumID: albumID
            },
        }).then((songs) => {
            console.log("SONG DATA without album:")
            // console.log(songs)
            
            Album.findOne({
                where: {
                    albumID: albumID
                }
            }).then((album) => {

                for (let i = 0; i < songs.length; i++) {
                    songs[i].albumTitle = album.title
                    songs[i].albumImagePath = album.imagePath
                    songs[i].albumYear = album.year
                    songs[i].albumArtist = album.artist
                }

                console.log("SONG DATA with album:")
                console.log(songs)
                resolve(songs)
            })

        }).catch((error) => {
            console.log("FINDING SONG ERROR:")
            console.log(error)
        })
    })
}


module.exports.addAlbum = function(album) {
    return new Promise((resolve, reject) => {
        Album.create(album).then(() => {
            console.log("ALBUM CREATED")
            resolve()

        }).catch((error) => {
            console.log("ALBUM ERROR:")
            console.log(error)
            reject()
        })
    })
}

module.exports.addSong = function(song) {
    return new Promise((resolve, reject) => {
        Song.create(song).then(() => {
            console.log("SONG CREATED")
            resolve()

        }).catch((error) => {
            console.log("SONG ERROR:")
            console.log(error)
            reject()
        })
    })
}

module.exports.deleteAlbum = function(albumID) {
    return new Promise((resolve, reject) => {
        Album.destroy({
            where: {
                albumID: albumID
            }
        }).then(() => {
            console.log("ALBUM DELETED")
            resolve()

        }).catch((error) => {
            console.log("ALBUM DELETE ERROR:")
            console.log(error)
        })
    })
}

module.exports.deleteSong = function(songID) {
    return new Promise((resolve, reject) => {
        Song.destroy({
            where: {
                songID: songID
            }
        }).then((data) => {
            console.log("SONG DELETED")
            resolve()

        }).catch((error) => {
            console.log("SONG DELETE ERROR:")
            console.log(error)
        })
    })
}
