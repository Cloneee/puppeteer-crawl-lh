const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const urls = require('./urls.json')

const USELESS_STRING_LENGTH = 39 // https://truyentranhlh.net/truyen-tranh/

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // loop through links
    for (let link =0; link<urls.length; link++){
        console.log("Crawling: " + urls[link])
        await page.goto(urls[link]);
        const [info, chapters] = await page.evaluate(() => {
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
            let chapters = Array.from(document.querySelectorAll(".list-chapters.at-series > a")).map(link => {
                return { chapter: link.getAttribute('title'), url: link.getAttribute('href') }
            })
            mangaInfo.chapters = []
            return [mangaInfo, chapters]
        })
        // loop through chapters
        for (let chapterIndex = 0; chapterIndex<chapters.length; chapterIndex++){
            console.log(`Chapter: ${chapters[chapterIndex].chapter}`)
            await page.goto(chapters[chapterIndex].url);
            const images = await page.evaluate( () => Array.from(document.querySelectorAll("#chapter-content > img")).map(el => el.getAttribute('data-src')))
            info.chapters.push({name: chapters[chapterIndex].chapter, images: images})
        }
        fs.writeFile(`./out/${urls[link].slice(USELESS_STRING_LENGTH)}.json`, JSON.stringify(info))
    }
    browser.close()
}
run();