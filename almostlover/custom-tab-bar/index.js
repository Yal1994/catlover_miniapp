Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/main/home/home",       
        iconPath: "/images/home.png",
        selectedIconPath: "/images/home_focus.png",
        text: "首页"
      },
      {
        pagePath: "/pages/publish/publish",       
        iconPath: "/images/publish.png",
        selectedIconPath: "/images/publish_focus.png",
        text: "发布"
      },
      {
        pagePath: "/pages/message/home/home",
        iconPath: "/images/friend.png",
        selectedIconPath: "/images/friend_focus.png",
        text: "消息"
      },
      {
        pagePath: "/pages/about/home/home",
        iconPath: "/images/me.png",
        selectedIconPath: "/images/me_focus.png",
        text: "我"
      }
    ]
  },
  methods: {
    switchTab(e) {      
      const url = e.currentTarget.dataset.path
      wx.switchTab({
        url
      })
    }
  },
  pageLifetimes: {
  },
})