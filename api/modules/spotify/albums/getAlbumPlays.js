import fetch from "node-fetch"
import scrape from "../../database/scrape.js"
import { query } from "../../database/initalizeDatabase.js"
import getAlbumReleaseDate from "./getAlbumReleaseDate.js"
import getAlbumCover from "./getAlbumCover.js"

export default function(albumID, updating) {
	return new Promise(async (resolve, reject) => {
		if (!updating) {
			var foundAlbum = await query(`SELECT * from albums WHERE id = $1`, [albumID])
				.catch(err => {
					Logger.error(`SQL query error: ${err}`)
					return reject(err)
				})
		
			if (foundAlbum.length > 0) {
				return resolve(foundAlbum[0].totalplays)
			}
		}

		const response = await fetch(`https://${global.config.spotify.domain}/album/v1/album-app/album/spotify:album:${albumID}/desktop?catalogue=free&locale=en`, {
			method: "get",
			headers: {
				"Authorization": global.userAuthToken
			}
		}).catch(err => {
			return reject(err)
		})
		
		const data = await response.json()
			.catch(err => {
				return reject(err)
			})
		
		var totalCount = 0

		for (const disk of data.discs) {
			for (const song of disk.tracks) {
				totalCount += song.playcount

				await query(`INSERT INTO songs (id,artistid,artistname,name,totalplays,image,lastupdated) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET totalplays = excluded.totalplays, lastupdated = excluded.lastupdated`, [
					song.uri.split(":")[2],
					song.artists[0].uri.split(":")[2],
					song.artists[0].name,
					song.name,
					song.playcount,
					await getAlbumCover(albumID),
					new Date(),
				]).catch(err => {
					Logger.error(`SQL query error: ${err}`)
					return reject(err)
				})
			}
		}

		if (data.related) {
			for (const related of data.related.releases) {
				var uri = related.uri.split(":")
				if (uri[1] == "album") {
					await scrape("album", uri[2])
						.catch(err => { return Logger.error(`Scrape error: ${err}`) })
				}
			}
		}

		await query(`INSERT INTO albums (id,artistid,artistname,name,totalplays,releasedate,image,lastupdated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET totalplays = excluded.totalplays, lastupdated = excluded.lastupdated`, [
			albumID,
			data.artists[0].uri.split(":")[2],
			data.artists[0].name,
			data.name,
			totalCount,
			await getAlbumReleaseDate(albumID),
			await getAlbumCover(albumID),
			new Date()
		]).catch(err => {
			Logger.error(`SQL query error: ${err}`)
			return reject(err)
		})

		resolve(parseInt(totalCount))
	})
}