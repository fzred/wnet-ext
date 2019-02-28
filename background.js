var requestStats = window.requestStats = []

function genStats() {
  return {
    lastTime: 0,
    completeList: [],
    occurredList: []
  }
}

function setBadgeText(tabId) {
  const tabStats = requestStats[tabId]
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
  setBadgeText(activeInfo.tabId)
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

  setBadgeText(details.tabId)
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
  requestCB(details, false)
}, {
  urls: [
    "<all_urls>"
  ]
});

console.log("Loaded.");