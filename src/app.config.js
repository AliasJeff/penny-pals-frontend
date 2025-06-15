export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/ledgers/index',
    'pages/statistics/index',
    'pages/profile/index',
    'pages/entry/add/index',
    'pages/ledgers/create/index',
    'pages/ledgers/detail/index',
    'pages/ledgers/edit/index',
    'pages/ledgers/join/index',
    // 'pages/ledgers/invite/index',
    // 'pages/entry/detail/index',
    // 'pages/profile/edit/index',
    // 'pages/profile/settings/index',
    // 'pages/profile/notifications/index',
    // 'pages/profile/help/index',
    // 'pages/profile/about/index',
    'pages/login/index'
  ],
  window: {
    navigationBarBackgroundColor: '#4670FF',
    navigationBarTitleText: '记账小星球🌍',
    navigationBarTextStyle: 'white',
    enableShareAppMessage: true,
    enableShareTimeline: true,
    requiredBackgroundModes: ['share'],
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4670FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        position: 'top'
        // iconPath: 'assets/icons/home.png',
        // selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/ledgers/index',
        text: '账本',
        position: 'top'
        // iconPath: 'assets/icons/ledger.png',
        // selectedIconPath: 'assets/icons/ledger-active.png'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计',
        position: 'top'
        // iconPath: 'assets/icons/stats.png',
        // selectedIconPath: 'assets/icons/stats-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        position: 'top'
        // iconPath: 'assets/icons/profile.png',
        // selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  },
  requiredBackgroundModes: ['share'],
  // 配置每个页面的窗口表现
  pageConfig: {
    'pages/home/index': {
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    },
    'pages/ledgers/index': {
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    },
    'pages/statistics/index': {
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    },
    'pages/profile/index': {
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    }
  }
})
