const puppeteer = require("puppeteer");

async function scrapeForeclosureLeads() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  //Navigate to the foreclosure website
  await page.goto(
    "https://salesweb.civilview.com/Sales/SalesSearch?countyId=3"
  );

  //Extract data from the HTML table
  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tr");
    return Array.from(rows, (row) => {
      const columns = row.querySelectorAll("td");
      return Array.from(columns, (column) => column.innerText);
    });
  });

  await browser.close();
  return data;
}

scrapeForeclosureLeads().then((data) => console.log(data));
