const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const info = require('./info-test.json')

async function run() {
    let listInfo = []
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); 
    //Loop qua list manga
    for (let i = 0; i < info.length; i++) {
        let newManga = {
            name: info[i].name,
            chapters: []
        }
        //Loop qua các chapters
        for (let j = 0; j < info[i].chapters.length; j++){
            await page.goto(info[i].chapters[j].url, {"waitUntil" : "networkidle0"});
            //Crawl link ảnh
            console.log("Crawling " + info[i].chapters[j].chapter)
            const images = await page.evaluate( () => Array.from(document.querySelectorAll("#chapter-content > img")).map(el => el.getAttribute('data-src')))
            newManga.chapters.push({chapter: info[i].chapters[j].chapter, images: images})
        }
        listInfo.push(newManga)
    }
    fs.writeFile('manga.json', JSON.stringify(listInfo)).then(() => browser.close())
}
run();