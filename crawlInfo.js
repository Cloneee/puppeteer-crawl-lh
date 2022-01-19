const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const urls = require('./urls.json')

// const crawlImages = () => {
//     mangaInfo.name = document.querySelector("#app > main > div.container > div.row.custom > ul > li.active > a").innerText
//     mangaInfo.images = Array.from(document.querySelectorAll("#chapter-content > img")).map(el => el.getAttribute('data-src'))
// }

async function run() {
    let listInfo = []
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    for (let i =0; i<urls.length; i++){
        await page.goto(urls[i]);
        const result = await page.evaluate(() => {
            console.log("Crawling manga")
            let mangaInfo = {}
            mangaInfo.name = document.querySelector(".series-name a").innerHTML;
            let tagRaw = document.querySelectorAll(".badge-info");
            mangaInfo.tag = Array.from(tagRaw).map(el => el.outerText);
            document.querySelectorAll("div.series-information > div").forEach(infoItem => {
                let items = infoItem.children
                switch (items[0].innerText) {
                    case "Tình trạng:":
                        mangaInfo.status = items[1].innerText
                        break;
                    case "Tác giả:":
                        mangaInfo.author = items[1].innerText
                        break;
                    case "Tên khác:":
                        mangaInfo.otherName = items[1].innerText
                        break;
                    default:
                        break;
                }
            })
            let img = document.querySelector(".series-cover > div > div").style || '';
            mangaInfo.thumbnail = img.backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1] || '';
            mangaInfo.summary = document.querySelector("div.summary-content > p").innerText || '';
            mangaInfo.chapters = Array.from(document.querySelectorAll(".list-chapters.at-series > a")).map(link => {
                return { chapter: link.getAttribute('title'), url: link.getAttribute('href') }
            })
            return mangaInfo
        })
        listInfo.push(result)
    }
    fs.writeFile('info.json', JSON.stringify(listInfo)).then(()=>browser.close())
}
run();