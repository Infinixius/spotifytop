import fetch from "node-fetch"

export default function(albumID) {
	return new Promise(async (resolve, reject) => {
		const response = await fetch(`https://api.spotify.com/v1/albums/${albumID}`, {
			method: "get",
			headers: {
				"Authorization": global.userAuthToken
			}
		}).catch(err => {
			return resolve("/assets/images/unknownAlbum.png")
		})
		const data = await response.json()
			.catch(err => {
				return resolve("/assets/images/unknownAlbum.png")
			})
		
		if (!data) return resolve("/assets/images/unknownAlbum.png")
		
		if (!data.images) {
			resolve("/assets/images/unknownAlbum.png")
		} else if (data.images.length == 0) {
			resolve("/assets/images/unknownAlbum.png")
		} else {
			resolve(data.images[data.images.length - 1].url)
		}
	})
}