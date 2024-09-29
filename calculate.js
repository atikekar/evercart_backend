import puppeteer from "puppeteer";
let url = "https://shop.lululemon.com/p/tops-short-sleeve/Quick-Drying-Short-Sleeve-Polo-Shirt-Straight/_/prod11710329?color=0002"; 

// Make class
class cartItem {
    constructor(name, water, carbon, shipping, total) {
        this.name = name;
        this.water = water;
        this.carbon = carbon;
        this.total = total;
    }
}

// Create a new Map and load the values
const fabricReqMap = new Map([
    ["Shirt", 1.5],
    ["Pants", 2.0],
    ["Sweatshirt", 2.5],
    ["Crew", 2.5],
    ["Pullover", 2.0],
    ["Shorts", 1.2],
    ["Dress", 3.0],
    ["Skirt", 1.5],
    ["Blouse", 1.4],
    ["Jacket", 2.8],
    ["Coat", 3.5],
    ["T-shirt", 1.2],
    ["Jeans", 2.2],
    ["Leggings", 1.8],
    ["Sweater", 2.4],
    ["Cardigan", 2.0],
    ["Tracksuit", 3.0],
    ["Hoodie", 2.5],
    ["Vest", 1.0],
    ["Overalls", 2.8],
    ["Pajama", 3.2],
    ["Robe", 3.0],
    ["Scarf", 1.0],
    ["Gloves", 0.3],
    ["Beanie", 0.2],
    ["Bikini", 0.8],
    ["Swimsuit", 1.0],
    ["Cover-up", 1.5],
    ["Poncho", 2.2],
    ["Kimono", 2.0],
    ["Bathing", 2.8],
    ["Suit", 2.5],
    ["Waistcoat", 1.0],
    ["Tank", 1.0],
    ["Crop", 1.0],
    ["Tunic", 1.8],
    ["Culottes", 2.0],
    ["Jumpsuit", 2.8],
    ["Romper", 2.2],
    ["Peacoat", 3.0],
    ["Trench", 3.5],
    ["Puffer", 3.2],
    ["Parkas", 3.8],
    ["Windbreaker", 2.5],
    ["Blazer", 2.2],
    ["Cape", 1.5],
    ["Sarong", 1.8],
    ["Sundress", 2.0],
    ["Skort", 1.0],
    ["Sweatpants", 1.5],
    ["Joggers", 1.6],
    ["Bra", 1.2],
    ["Trunks", 1.0],
    ["Polo", 1.4],
    ["Tank", 1.0],
    ["Bag", 2.0], 
    ["Hat", 0.3], 
    ["Socks", 0.3],
    ["Sock", 0.3],
]);

const fabricFootprintMap = new Map([
    ["Nylon", { water: 160, carbon: 5.4 }],
    ["Lycra", { water: 155, carbon: 6.3 }],
    ["Polyester", { water: 60, carbon: 9.5 }],
    ["Cotton", { water: 10000, carbon: 4.0 }],
    ["Wool", { water: 1500, carbon: 7.5 }],
    ["Merino Wool", { water: 1300, carbon: 6.8 }],
    ["Linen", { water: 2500, carbon: 2.1 }],
    ["Silk", { water: 3000, carbon: 5.5 }],
    ["Canvas", { water: 8500, carbon: 4.2 }],
    ["Cashmere", { water: 8200, carbon: 8.5 }],
    ["Crepe", { water: 1200, carbon: 5.6 }],
    ["Jersey", { water: 2000, carbon: 3.5 }],
    ["Mesh", { water: 1800, carbon: 4.7 }],
    ["Muslin", { water: 9800, carbon: 3.8 }],
    ["Spandex", { water: 110, carbon: 7.2 }],
    ["Elastane", { water: 115, carbon: 7.0 }],
    ["Suede", { water: 3500, carbon: 6.2 }],
    ["Viscose", { water: 3400, carbon: 3.4 }],
    ["Modal", { water: 2500, carbon: 2.9 }],
    ["Rayon", { water: 2700, carbon: 3.2 }],
    ["Polypropylene", { water: 45, carbon: 4.8 }]
]);

  
function parseName(wordsArray) {
    for (let i = 0; i < wordsArray.length; i++) { 
        if (fabricReqMap.has(wordsArray[i])) { 
            return fabricReqMap.get(wordsArray[i]); 
            // returns the amt. of fabric that the item needs to be manufactured
        }
    }
    return "No matches found"; 
}

function parseMaterials(materialsAndCare, fabricName, percentages) { 
    let matsArray = materialsAndCare.split(/[ %]+/);
    for (let i = 0; i < matsArray.length; i++) { 
        let num = Number(matsArray[i]);
        if (Number.isInteger(num)) { 
            percentages.push(matsArray[i]); 
        }
        if (fabricFootprintMap.has(matsArray[i])) { 
            fabricName.push(matsArray[i]);
        } 
    }
    return "No matches found"; 
}

function calcWater(fabricAmountNeeded, fabricName, percentages) {
    let total = 0; 
    for (let i = 0; i < fabricName.length; i++) { 
        let name = fabricName[i]; 
        let perc = percentages[i]/100;
        total += fabricFootprintMap.get(name).water * fabricAmountNeeded * perc; 
    }
    return total; 
}

function calcCarbon(fabricAmountNeeded, fabricName, percentages) { 
    let total = 0;
    for (let i = 0; i < fabricName.length; i++) {
        let name = fabricName[i];
        let perc = percentages[i]/100;
        total += fabricFootprintMap.get(name).carbon * fabricAmountNeeded * perc;
    }
    return total; 
}

function calcTotal(fabricWaterFootprint, fabricCarbonFootprint) {
    let Wmin = 50; 
    let Wmax = 10000; 
    let Cmin = 0.1; 
    let Cmax = 20;
    let waterWeight = 0.25; 
    let carbonWeight = 0.25;
    let norm_W = waterWeight * ((fabricWaterFootprint - Wmin) / (Wmax - Wmin));
    let norm_C = carbonWeight * ((fabricCarbonFootprint - Cmin) / (Cmax - Cmin));
    return norm_W + norm_C; 
}

async function scrapeLululemonProduct(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-http2',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();

    let productName = '';
    let materialsAndCare = '';

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
    );

    page.setDefaultNavigationTimeout(90000);

    let retries = 3;
    let loaded = false;

    while (retries > 0 && !loaded) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
            loaded = true;
        } catch (err) {
            console.log(`Retry navigation, attempts left: ${--retries}`);
            if (retries === 0) throw err;
        }
    }

    await page.waitForSelector('.OneLinkNoTx.product-title_title__i8NUw', { timeout: 30000 });
    productName = await page.evaluate(() => {
        const nameElement = document.querySelector(".OneLinkNoTx.product-title_title__i8NUw");
        return nameElement ? nameElement.innerText.trim() : 'Product name not found';
    });

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));

    await page.waitForSelector('[data-testid="accordion-item-4"]', { timeout: 30000 });
    await page.click('[data-testid="accordion-item-4"]', { timeout: 90000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    materialsAndCare = await page.evaluate(() => {
        const listItems = Array.from(document.querySelectorAll('.product-education-accordions__attributes__item__list'));
        return listItems.map(item => item.innerText.trim()).join(', ');
    });

    console.log('Product Name:', productName);
    console.log('Materials & Care:', materialsAndCare);

    await browser.close();

    const wordsArray = productName.split(' ');
    const fabricAmountNeeded = parseName(wordsArray);
    const fabricNames = [];
    const percentages = [];

    parseMaterials(materialsAndCare, fabricNames, percentages);

    const fabricWaterFootprint = calcWater(fabricAmountNeeded, fabricNames, percentages);
    const fabricCarbonFootprint = calcCarbon(fabricAmountNeeded, fabricNames, percentages);
    const fabricTotal = calcTotal(fabricWaterFootprint, fabricCarbonFootprint);

    let item = new cartItem(productName, fabricWaterFootprint, fabricCarbonFootprint, fabricTotal);
    return item;
}

(async () => {
    let item = await scrapeLululemonProduct(url);
    console.log(item); 
})();