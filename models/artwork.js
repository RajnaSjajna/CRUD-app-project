// Placeholder Artwork model

const artworks = [];

class Artwork {
  constructor(id, title, artist, ownerId, imagePath) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.ownerId = ownerId; // korisnik koji je postavio
    this.imagePath = imagePath;
  }

  static all() {
    return artworks;
  }

  static create(title, artist, ownerId, imagePath) {
    const artwork = new Artwork(artworks.length + 1, title, artist, ownerId, imagePath);
    artworks.push(artwork);
    return artwork;
  }

  static findById(id) {
    return artworks.find(a => a.id == id);
  }

  static update(id, title, artist) {
    const artwork = this.findById(id);
    if (artwork) {
      artwork.title = title;
      artwork.artist = artist;
    }
    return artwork;
  }

  static delete(id) {
    const index = artworks.findIndex(a => a.id == id);
    if (index !== -1) artworks.splice(index, 1);
  }
}

module.exports = { Artwork, artworks };



