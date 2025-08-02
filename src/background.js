// Background script for TickTick Pinned extension
// This runs as a service worker in Manifest V3

let currentTabId;
let ticktickTabId;
let previousTab;

/**
 * Logs errors to the console with extension context
 * @param {Error} e - The error to log
 */
function onError(e) {
  console.error("TickTick Extension Error:", e);
}

/**
 * Sets the browser action icon to the provided image URL
 * @param {string} imageURL - The URL of the image to set as icon
 */
async function setButtonIcon(imageURL) {
  try {
    await browser.action.setIcon({ path: imageURL });
  } catch (e) {
    onError(e);
  }
}

/**
 * Creates a new pinned tab with TickTick webapp
 */
async function createPinnedTab() {
  try {
    await browser.tabs.create({
      url: "https://ticktick.com/webapp/",
      pinned: true,
      active: true,
    });
  } catch (e) {
    onError(e);
  }
}

/**
 * Handles the tab search logic and switches between tabs
 * @param {Array} ticktickTabs - Array of TickTick tabs found
 */
async function handleSearch(ticktickTabs) {
  try {
    if (ticktickTabs.length > 0) {
      ticktickTabId = ticktickTabs[0].id;
      if (ticktickTabId === currentTabId) {
        await browser.tabs.update(previousTab, { active: true });
      } else {
        previousTab = currentTabId;
        await browser.tabs.update(ticktickTabId, { active: true });
      }
      await setButtonIcon(ticktickTabs[0].favIconUrl);
    } else {
      previousTab = currentTabId;
      await createPinnedTab();
    }
  } catch (e) {
    onError(e);
  }
}

/**
 * Handles browser action clicks to toggle TickTick tabs
 * @param {Object} tab - The currently active tab
 */
async function handleClick(tab) {
  try {
    currentTabId = tab.id;
    const ticktickTabs = await browser.tabs.query({ url: "*://ticktick.com/*" });
    await handleSearch(ticktickTabs);
  } catch (e) {
    onError(e);
  }
}

/**
 * Handles extension installation and updates
 * @param {Object} details - Installation details containing reason
 */
async function update(details) {
  try {
    if (details.reason === "install" || details.reason === "update") {
      await browser.runtime.openOptionsPage();
    }
  } catch (e) {
    onError(e);
  }
}

browser.action.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);
