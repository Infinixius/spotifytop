import fetch from "node-fetch"
import getArtistAlbums from "./getArtistAlbums.js"
import getAlbumPlays from "../albums/getAlbumPlays.js"
import scrape from "../../database/scrape.js"
import { query } from "../../database/initalizeDatabase.js"
import getArtistCover from "./getArtistCover.js"

export default function(artistID, updating) {
	return new Promise(async (resolve, reject) => {
		if (!updating) {
			var foundArtist = await query(`SELECT * from artists WHERE id = $1`, [artistID])
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				return reject(err)
			})
		
			if (foundArtist.length > 0) {
				return resolve({
					monthlyListeners: parseInt(foundArtist[0].monthlyplays),
					playCount: parseInt(foundArtist[0].totalplays),
					chartPosition: parseInt(foundArtist[0].chartposition)
				})
			}
		}

		
		const response = await fetch(`https://${global.config.spotify.domain}/artist/v1/${artistID}/desktop?format=json&locale=en&cat=1`, {
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
		
		if (!data) return reject(Error("No response from spotify"))
		if (!data.monthly_listeners) {
			Logger.warn(`Failed to get artist plays for artist "${artistID}"! Assuming 0.`)
			return resolve(0)
		}

		var monthlyListeners = data.monthly_listeners.listener_count
		var chart = data.creator_about.globalChartPosition ?? 0
		var playCount = 0

		const albums = await getArtistAlbums(artistID)
		if (albums.length == 0) {
			Logger.warn(`Failed to get albums for artist "${artistID}"! Assuming 0 plays.`)
			return resolve(0)
		}

		var albumsProcessed = 0
		if (data.related_artists.length > 0) {
			for (const related of data.related_artists.artists) {
				var uri = related.uri.split(":")
				if (uri[1] == "artist") {
					scrape("artist", uri[2])
						.catch(err => { return Logger.error(`Scrape error: ${err}`) })
				}
			}
		}

		for (const album of albums) {
			getAlbumPlays(album, updating).then(async (res) => {
				playCount += parseInt(res)
				albumsProcessed++
				if (albumsProcessed >= albums.length) {
					await query(`INSERT INTO artists (id,name,monthlyplays,totalplays,chartposition,lastupdated,image) VALUES ($1, $2, $3, $4, $5, $6, $7)  ON CONFLICT (id) DO UPDATE SET chartposition = excluded.chartposition, monthlyplays = excluded.monthlyplays, totalplays = excluded.totalplays, lastupdated = excluded.lastupdated`, [
						artistID,
						data.info.name,
						monthlyListeners,
						playCount,
						chart,
						new Date(),
						await getArtistCover(artistID)
					]).then(() => {
						return resolve({
							monthlyListeners: monthlyListeners,
							playCount: playCount,
							chartPosition: chart
						})
					}).catch(err => {
						Logger.error(`SQL query error: ${err}`)
						return reject(err)
					})
				}
			}).catch(err => {
				Logger.error(`Failed to get info for album "${album}"! Error: ${err}`)
			})
		}
	})
}