import fetch from "node-fetch"

export default function(ID) {
	return new Promise(async (resolve, reject) => {
		const response = await fetch(`https://open.spotify.com/oembed?url=spotify:artist:${ID}`)
			.catch(err => {
				return resolve("/assets/images/unknownArtist.png")
			})
		
		const data = await response.json()
			.catch(err => {
				return resolve("/assets/images/unknownArtist.png")
			})
		
			return resolve(data.thumbnail_url)
	})
}