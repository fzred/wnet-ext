const bg = chrome.extension.getBackgroundPage();

new Vue({
  el: '#app',
  data: {
    stats: null,
    message: 'Hello Vue.js!',
    completeListDomain: [],
    occurredListDomain: [],
  },
  methods: {
    getDomains(list) {
      return [...new Set(
        list.map(item => {
          const aTab = document.createElement('a')
          aTab.href = item.url
          return aTab.hostname
        })
      )]
    }
  },
  created() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      this.stats = bg.requestStats[tabs[0].id]
      this.completeListDomain = this.getDomains(this.stats.completeList)
      this.occurredListDomain = this.getDomains(this.stats.occurredList)
    });
  },
})