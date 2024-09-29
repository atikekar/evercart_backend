

async function Results() {
    let arrayOfResults = [];
    for (let i = 0; i < arrayOfLinks.length; i++) {
        let tempLink = arrayOfLinks[i];
        let result = await returnItem(tempLink); // Await the result of scraping
        arrayOfResults.push(result);
    }

    function calcShippingCarbon() {
        let distance = 189; // miles from the Columbus, OH warehouse to Ann Arbor, MI
        return distance * 1.617;
    }

    return arrayOfResults;
}

Results().then((arrayOfResults) => {
    console.log(arrayOfResults);
});