function getTopAlbums() {
	fetch("/spotifytop/getAlbums")
		.then(res => res.json())
		.then(data => {
			var json = data.result
			clear(true)
			
			for (const album of json) {
				addRow([
					json.indexOf(album) + 1,
					`<img class="albumcover" src="${album.image}">`,
					`<a target="_blank" href="https://open.spotify.com/album/${album.id}">${album.name}</a>`,
					`<a artistid="${album.artistid}" class="showArtistAlbums">${album.artistname}</a>`,
					commaSeparateNumber(album.totalplays),
					album.releasedate,
					timeAgo(Date.parse(album.lastupdated))
				])

			}
		})
		.catch(err => {
			console.error(err)
		})
}

function getTopArtists() {
	fetch("/spotifytop/getArtists")
		.then(res => res.json())
		.then(data => {
			var json = data.result
			clear(true)
			
			for (const artist of json) {
				addRow([
					json.indexOf(artist) + 1,
					`<img class="albumcover" src="${artist.image}">`,
					`<a target="_blank" href="https://open.spotify.com/artist/${artist.id}">${artist.name}</a>`,
					commaSeparateNumber(artist.monthlyplays),
					commaSeparateNumber(artist.totalplays),
					artist.chartposition || "N/A",
					timeAgo(Date.parse(artist.lastupdated))
				])

			}
		})
		.catch(err => {
			console.error(err)
		})
}

function getTopSongs() {
	fetch("/spotifytop/getSongs")
		.then(res => res.json())
		.then(data => {
			var json = data.result
			clear(true)
			
			for (const song of json) {
				addRow([
					json.indexOf(song) + 1,
					`<img class="albumcover" src="${song.image}">`,
					`<a target="_blank" href="https://open.spotify.com/track/${song.id}">${song.name}</a>`,
					`<a artistid="${song.artistid}" class="showArtistAlbums">${song.artistname}</a>`,
					commaSeparateNumber(song.totalplays),
					timeAgo(Date.parse(song.lastupdated))
				])

			}
		})
		.catch(err => {
			console.error(err)
		})
}

function getBillboard200() {
	fetch("/spotifytop/getBillboard")
		.then(res => res.json())
		.then(data => {
			var json = data.result
			clear(true)
			
			for (const album of json) {
				addRow([
					json.indexOf(album) + 1,
					`<img class="albumcover" src="${album.cover}">`,
					album.name,
					album.artist,
					
					album.lastWeek,
					album.peak,
					album.weeks
				])
			}
		})
		.catch(err => {
			console.error(err)
		})
}

function getArtistSongs(id) {
	fetch(`/spotifytop/getArtistSongs/${id}`)
		.then(res => res.json())
		.then(data => {
			var json = data.result
			clear(true)
			
			for (const song of json) {
				addRow([
					json.indexOf(song) + 1,
					`<img class="albumcover" src="${song.image}">`,
					`<a target="_blank" href="https://open.spotify.com/track/${song.id}">${song.name}</a>`,
					song.artistname,
					commaSeparateNumber(song.totalplays),
					timeAgo(Date.parse(song.lastupdated))
				])

			}
		})
		.catch(err => {
			console.error(err)
		})
}

function clear(isRequest) {
	if (!isRequest) $("#tablehead").empty()
	$("#table tbody").children().remove()
}

function loading() {
	addRow([
		"1",
		`<img class="albumcover" src="assets/images/unknownalbum.png">`,
		"Loading"
	])
}

$("#topAlbums").click(() => {
	clear()
	loading()

	for (const tableheader of ["#", "", "Album Name", "Artist", "Total Plays", "Release Date", "Last Updated"]) {
		$("#tablehead").append(`<th scope="col">${tableheader}</th>`)
	}

	getTopAlbums()
})

$("#topArtists").click(() => {
	clear()
	loading()

	for (const tableheader of ["#", "", "Artist Name", "Monthly Plays", "Total Plays", "Chart Position", "Last Updated"]) {
		$("#tablehead").append(`<th scope="col">${tableheader}</th>`)
	}

	getTopArtists()
})

$("#topSongs").click(() => {
	clear()
	loading()

	for (const tableheader of ["#", "", "Song Name", "Artist", "Total Plays", "Last Updated"]) {
		$("#tablehead").append(`<th scope="col">${tableheader}</th>`)
	}

	getTopSongs()
})

$("#topBillboard").click(() => {
	clear()
	loading()

	for (const tableheader of ["#", "", "Album Name", "Artist", "Position Last Week", "Peak Position", "Weeks on Chart"]) {
		$("#tablehead").append(`<th scope="col">${tableheader}</th>`)
	}

	getBillboard200()
})

$(document).on("click", ".showArtistAlbums", (element) => {
	clear()
	loading()

	for (const tableheader of ["#", "", "Song Name", "Artist", "Total Plays", "Last Updated"]) {
		$("#tablehead").append(`<th scope="col">${tableheader}</th>`)
	}

	getArtistSongs($(element.target).attr("artistid"))
})

$("#starGitHub").click(() => {
	window.location.href = "https://github.com/infinixius/spotifytop"
})

loading()
$("#topAlbums").click()