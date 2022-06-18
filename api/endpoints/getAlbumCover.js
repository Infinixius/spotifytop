import { Endpoint } from "../modules/api.js"
import getAlbumCover from "../modules/spotify/albums/getAlbumCover.js"

export default new Endpoint (
    "GET",
    "/getAlbumCover/:albumID",
    {},

    async function (req, res, next) {
		res.set("Cache-control", "public, max-age=300") // ensure browser caches the images

        await getAlbumCover(req.params["albumID"])
			.then(cover => {
				res.redirect(cover)
			})
			.catch(err => {
				res.redirect("/assets/images/unknownAlbum.png")
			})
    }
)

