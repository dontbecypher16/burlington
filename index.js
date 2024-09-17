const puppeteer = require("puppeteer");

async function scrapeForeclosureLeads() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  //Navigate to the foreclosure website
  await page.goto(
    "https://salesweb.civilview.com/Sales/SalesSearch?countyId=3"
  );

  // Get all the links to the details pages
  const detailsLinks = await page.$$eval("table tr td a", (links) =>
    links.map((link) => link.href)
  );

  // Loop through each link and perform the desired actions
  for (let i = 0; i < detailsLinks.length; i++) {
    console.log(`Scraping details for property ${i + 1}`);

    // Click on the Details link
    await page.goto(detailsLinks[i]);

    // Wait for the details page to load
    await page.waitForSelector("td.columnwidth-15");

    // Scrape the data from the details page
    const data = await page.evaluate(() => {
      // Extract relevant data from the details page

      const rows = document.querySelectorAll("table tr");
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });

    console.log(data);

    // Go back to the main page (by clicking the "Back" button)
    await page.goBack("a.btn.btn-primary");

    // Wait for the main page to load again
    await page.waitForSelector("th");
  }

  await browser.close();
}

scrapeForeclosureLeads();

// //Extract data from the HTML table
// const data = await page.evaluate(() => {
//   const rows = document.querySelectorAll("table tr");
//   return Array.from(rows, (row) => {
//     const columns = row.querySelectorAll("td");
//     return Array.from(columns, (column) => column.innerText);
//   });
// });
