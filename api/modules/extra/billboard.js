import fetch from "node-fetch"
import { JSDOM } from "jsdom"

const request = await fetch("https://www.billboard.com/charts/billboard-200/")
	.catch(err => {
		Logger.warn(`Failed to get Billboard 200 data!`)
	})

const data = await request.text()
const { window } = new JSDOM(data, { pretendToBeVisual: true })

const billboard = Array.from(window.document.getElementsByClassName("o-chart-results-list-row-container"))
var billboardData = []

for (const albumNum in billboard) {
	var album = billboard[albumNum].children[0]

	billboardData.push({
		id: parseInt(albumNum) + 1,
		name: album.children[3].children[0].children[0].children[0].innerHTML.trim(),
		artist: album.children[3].children[0].children[0].children[1].innerHTML.trim(),
		cover: album.children[1].children[0].children[0].children[0].getAttribute("data-lazy-src"),

		lastWeek: album.children[3].children[0].children[3].children[0].innerHTML.trim(),
		peak: album.children[3].children[0].children[4].children[0].innerHTML.trim(),
		weeks: album.children[3].children[0].children[5].children[0].innerHTML.trim()
	})
}

global.billboardData = billboardData
Logger.log(`Billboard 200 data loaded!`)