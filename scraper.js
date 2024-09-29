import puppeteer from "puppeteer"; 
export { scrapeLululemonProduct };

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

    try {
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
        );

        page.setDefaultNavigationTimeout(90000);

        await page.setExtraHTTPHeaders({
            'accept-language': 'en-US,en;q=0.9',
        });

        let retries = 3;
        let loaded = false;

        while (retries > 0 && !loaded) {
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
                loaded = true;
            } catch (err) {
                retries--;
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
        await page.click('[data-testid="accordion-item-4"]');

        await new Promise(resolve => setTimeout(resolve, 2000));

        materialsAndCare = await page.evaluate(() => {
            const panel = document.querySelector('[data-testid="panel-content-4"]');
            return panel ? panel.innerText.trim() : 'Materials & Care section not found';
        });

    } catch (error) {
        // Instead of logging, we'll store the error message in the variables
        productName = 'Error occurred';
        materialsAndCare = `Error scraping the page: ${error.message}`;
    } finally {
        await browser.close();
    }

    // Return the two string variables
    return { productName, materialsAndCare };
}