var requestStats = window.requestStats = []
var lastTabId = -1

function genStats() {
  return {
    lastTime: 0,
    completeList: [],
    occurredList: []
  }
}

function setBadgeText() {
  const tabStats = requestStats[lastTabId]
  if (tabStats) {
    chrome.browserAction.setBadgeText({
      text: `${tabStats.occurredList.length}`
    });
  } else {
    chrome.browserAction.setBadgeText({
      text: ''
    });
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "loading") {
    requestStats[tabId] = genStats()
  }
})

chrome.tabs.onActivated.addListener(function (activeInfo) {
  lastTabId = activeInfo.tabId
  setBadgeText()
})

function requestCB(details, isCompleted) {
  const tabStats = requestStats[details.tabId] || genStats()
  tabStats.lastTime = Date.now()
  if (isCompleted) {
    tabStats.completeList.push({
      initiator: details.initiator,
      url: details.url
    })
  } else {
    tabStats.occurredList.push({
      initiator: details.initiator,
      url: details.url
    })
  }
  requestStats[details.tabId] = tabStats

  if (lastTabId === details.tabId) {
    setBadgeText()
  }
}

chrome.webRequest.onCompleted.addListener(function (details) {
    requestCB(details, true)
  }, {
    urls: [
      "<all_urls>"
    ]
  },
  [
    "responseHeaders"
  ]
);

chrome.webRequest.onErrorOccurred.addListener(function (details) {
  if (details.error !== "net::ERR_BLOCKED_BY_CLIENT") {
    console.log(details)
    requestCB(details, false)
  }
}, {
  urls: [
    "<all_urls>"
  ]
});

console.log("Loaded.");