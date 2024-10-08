const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

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

    const rawData = [];

    const processData = (data) => {
      const firstSetKeys = [
        "Sheriff #:",
        "Sales Date:",
        "Defendant:",
        "Address:",
        "Approx. Judgment:",
      ];

      // Split the data into two sets by the empty array ([])
      const emptyIndex = data.findIndex((arr) => arr.length === 0); // Find where the empty array occurs
      const firstSet = data.slice(0, emptyIndex); // Data before the empty array
      const secondSet = data.slice(emptyIndex + 1); // Data after the empty array

      // Process the first set of arrays
      firstSet.forEach((row) => {
        if (firstSetKeys.includes(row[0])) {
          // Remove empty strings from the row and push to allData
          const filteredRow = row.filter((item) => item !== "");
          rawData.push(filteredRow);
        }
      });

      // Process the second set of arrays (every array after the empty array)
      secondSet.forEach((row) => {
        if (row.length > 0) {
          // Only process non-empty rows
          const filteredRow = row.filter((item) => item !== ""); // Remove empty strings
          rawData.push(filteredRow);
        }
      });

      return rawData;
    };

    // Go back to the main page (by clicking the "Back" button)
    await page.goBack("a.btn.btn-primary");

    // Wait for the main page to load again
    await page.waitForSelector("th");

    console.log(processData(data));
  }

  await browser.close();
}

scrapeForeclosureLeads();
