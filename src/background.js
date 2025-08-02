let currentTabId;
let ticktickTabId;
let previousTab;

function onError(e) {
  console.error("TickTick Extension Error:", e);
}

function onOpened() {
  console.log("Options page opened successfully");
}

async function setButtonIcon(imageURL) {
  try {
    await browser.action.setIcon({ path: imageURL });
  } catch (e) {
    onError(e);
  }
}

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

async function handleClick(tab) {
  try {
    currentTabId = tab.id;
    const ticktickTabs = await browser.tabs.query({ url: "*://ticktick.com/*" });
    await handleSearch(ticktickTabs);
  } catch (e) {
    onError(e);
  }
}

async function update(details) {
  try {
    if (details.reason === "install" || details.reason === "update") {
      await browser.runtime.openOptionsPage();
      onOpened();
    }
  } catch (e) {
    onError(e);
  }
}

browser.action.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);
