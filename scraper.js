const puppeteer = require('puppeteer');
require('dotenv').config();  // Load .env variables

// Store browser instance and pages in a pool
let browser;
let pagePool = [];
let pageLimit = 5;  // Set a limit for concurrent pages

// Function to get the browser instance
async function getBrowserInstance() {
    if (!browser) {
        console.log("Launching browser...");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    // Reuse an available page from the pool, or create a new one if needed
    if (pagePool.length > 0) {
        return pagePool.pop();
    }

    if (pagePool.length < pageLimit) {
        const page = await browser.newPage();
        return page;
    }

    // Wait for a page to be available
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (pagePool.length > 0) {
                clearInterval(interval);
                resolve(pagePool.pop());
            }
        }, 100);
    });
}

// Function to return the page back to the pool after scraping
function releasePage(page) {
    if (pagePool.length < pageLimit) {
        pagePool.push(page);
    } else {
        page.close();  // Close the page if the pool is full
    }
}

async function getNextChapterDate() {
    const page = await getBrowserInstance();
    const url = process.env.MANGAPLUS_OP_URL; // Official Manga Plus URL for One Piece
    console.log(`Navigating to: ${url}`);

    try {
        // Skip loading unnecessary resources like images and fonts for faster scraping
        await page.setRequestInterception(true);

        let handledRequests = new Set();  // A set to track handled requests

        page.on('request', (request) => {
            if (handledRequests.has(request.url())) {
                request.continue();
                return;
            }
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                request.abort();
            } else {
                handledRequests.add(request.url());  // Track the handled request
                request.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Increased timeout

        // Wait for the updated selector to be available
        console.log('Waiting for the updated selector...');
        await page.waitForSelector('.TitleDetail-module_updateInfo_2MITq span', { timeout: 30000 });

        // Scrape the next chapter date from the page
        const dateText = await page.$eval('.TitleDetail-module_updateInfo_2MITq span', (el) => el.textContent.trim());

        if (dateText) {
            console.log('Fetched new date:', dateText);
            return dateText;
        } else {
            throw new Error('Date element not found on page');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    } finally {
        // Reset interception state and release the page
        page.removeAllListeners('request');
        releasePage(page);
    }
}

module.exports = { getNextChapterDate };