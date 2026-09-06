/**
 * umi 的路由配置 —— 智能物业管理系统
 * 一级菜单：系统基础服务 /property、财务服务 /property
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'home',
    component: './Home',
  },

  // ========== 个人设置（隐藏菜单，仅头像下拉跳转） ==========
  {
    path: '/account',
    layout: false,
    routes: [
      {
        path: '/account/settings',
        name: 'settings',
        component: './account/settings',
      },
    ],
  },

  // ========== 系统基础服务 ==========
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    access: 'canAdmin',
    routes: [
      { path: '/system', redirect: '/system/user' },
      {
        path: '/system/user',
        name: 'user',
        icon: 'user',
        component: './system/User',
      },
      {
        path: '/system/role',
        name: 'role',
        icon: 'safety',
        component: './system/Role',
      },
      {
        path: '/system/menu',
        name: 'menu',
        icon: 'menu',
        component: './system/Menu',
      },
      {
        path: '/system/dept',
        name: 'dept',
        icon: 'cluster',
        component: './system/Dept',
      },
      {
        path: '/system/dict',
        name: 'dict',
        icon: 'book',
        component: './system/Dict',
      },
      {
        path: '/system/company',
        name: 'company',
        icon: 'bank',
        component: './system/Company',
      },
      {
        path: '/system/login-log',
        name: 'login-log',
        icon: 'file-text',
        component: './system/LoginLog',
      },
      {
        path: '/system/oper-log',
        name: 'oper-log',
        icon: 'profile',
        component: './system/OperLog',
      },
    ],
  },

  // ========== 房产财务服务 ==========
  {
    path: '/property',
    name: 'property',
    icon: 'bank',
    routes: [
      { path: '/property', redirect: '/property/community' },

      // ---- 房产 ----
      {
        path: '/property/community',
        name: 'community',
        icon: 'home',
        component: './property/Community',
      },
      {
        path: '/property/building',
        name: 'building',
        icon: 'apartment',
        component: './property/Building',
      },
      {
        path: '/property/unit',
        name: 'unit',
        icon: 'layout',
        component: './property/Unit',
      },
      {
        path: '/property/room',
        name: 'room',
        icon: 'appstore',
        component: './property/Room',
      },
      // ---- 业主/租户 ----
      {
        path: '/property/owner',
        name: 'owner',
        icon: 'user',
        component: './property/Owner',
      },
      {
        path: '/property/tenant',
        name: 'tenant',
        icon: 'team',
        component: './property/Tenant',
      },
      // ---- 销售/验房/装修 ----
      {
        path: '/property/sale-contract',
        name: 'sale-contract',
        icon: 'file-protect',
        component: './property/SaleContract',
      },
      {
        path: '/property/check-record',
        name: 'check-record',
        icon: 'audit',
        component: './property/CheckRecord',
      },
      {
        path: '/property/decoration',
        name: 'decoration',
        icon: 'tool',
        component: './property/Decoration',
      },
      // ---- 租赁 ----
      {
        path: '/property/lease-contract',
        name: 'lease-contract',
        icon: 'file-text',
        component: './property/LeaseContract',
      },
      // ---- 财务 ----
      {
        path: '/property/fee-item',
        name: 'fee-item',
        icon: 'gold',
        component: './property/FeeItem',
      },
      {
        path: '/property/ledger',
        name: 'ledger',
        icon: 'book',
        component: './property/Ledger',
      },
      {
        path: '/property/payment',
        name: 'payment',
        icon: 'pay-circle',
        component: './property/Payment',
      },
      {
        path: '/property/invoice',
        name: 'invoice',
        icon: 'receipt',
        component: './property/Invoice',
      },
      {
        path: '/property/parking',
        name: 'parking',
        icon: 'car',
        component: './property/Parking',
      },
      {
        path: '/property/prepayment',
        name: 'prepayment',
        icon: 'wallet',
        component: './property/Prepayment',
      },
      {
        path: '/property/meter-reading',
        name: 'meter-reading',
        icon: 'dashboard',
        component: './property/MeterReading',
      },
    ],
  },

  // ========== 运营管理服务 ==========
  {
    path: '/operation',
    name: 'operation',
    icon: 'appstore',
    routes: [
      { path: '/operation', redirect: '/operation/service-order' },

      // ---- 服务工单 ----
      {
        path: '/operation/service-order',
        name: 'service-order',
        icon: 'customer-service',
        component: './operation/ServiceOrder',
      },
      // ---- 保洁绿化 ----
      {
        path: '/operation/clean-arrange',
        name: 'clean-arrange',
        icon: 'clear',
        component: './operation/CleanArrange',
      },
      {
        path: '/operation/clean-check',
        name: 'clean-check',
        icon: 'file-done',
        component: './operation/CleanCheck',
      },
      {
        path: '/operation/greenery',
        name: 'greenery',
        icon: 'tree',
        component: './operation/Greenery',
      },
      {
        path: '/operation/greenery-check',
        name: 'greenery-check',
        icon: 'audit',
        component: './operation/GreeneryCheck',
      },
      // ---- 消防安全 ----
      {
        path: '/operation/fire-facility',
        name: 'fire-facility',
        icon: 'fire',
        component: './operation/FireFacility',
      },
      {
        path: '/operation/fire-patrol',
        name: 'fire-patrol',
        icon: 'security-scan',
        component: './operation/FirePatrol',
      },
      {
        path: '/operation/fire-drill',
        name: 'fire-drill',
        icon: 'alert',
        component: './operation/FireDrill',
      },
      {
        path: '/operation/community-activity',
        name: 'community-activity',
        icon: 'team',
        component: './operation/CommunityActivity',
      },
      // ---- 保安管理 ----
      {
        path: '/operation/security-arrange',
        name: 'security-arrange',
        icon: 'safety-certificate',
        component: './operation/SecurityArrange',
      },
      {
        path: '/operation/duty-record',
        name: 'duty-record',
        icon: 'schedule',
        component: './operation/DutyRecord',
      },
      {
        path: '/operation/visit-record',
        name: 'visit-record',
        icon: 'login',
        component: './operation/VisitRecord',
      },
      {
        path: '/operation/goods-record',
        name: 'goods-record',
        icon: 'inbox',
        component: './operation/GoodsRecord',
      },
      // ---- 停车管理 ----
      {
        path: '/operation/vehicle-record',
        name: 'vehicle-record',
        icon: 'car',
        component: './operation/VehicleRecord',
      },
      // ---- 行政管理 ----
      {
        path: '/operation/notice',
        name: 'notice',
        icon: 'notification',
        component: './operation/Notice',
      },
      {
        path: '/operation/regulation',
        name: 'regulation',
        icon: 'read',
        component: './operation/Regulation',
      },
      {
        path: '/operation/opinion-box',
        name: 'opinion-box',
        icon: 'message',
        component: './operation/OpinionBox',
      },
      {
        path: '/operation/survey',
        name: 'survey',
        icon: 'like',
        component: './operation/Survey',
      },
      {
        path: '/operation/message',
        name: 'message',
        icon: 'mail',
        component: './operation/Message',
      },
      // ---- 业委会 ----
      {
        path: '/operation/committee-member',
        name: 'committee-member',
        icon: 'user',
        component: './operation/CommitteeMember',
      },
      {
        path: '/operation/committee-meeting',
        name: 'committee-meeting',
        icon: 'calendar',
        component: './operation/CommitteeMeeting',
      },
    ],
  },

  // 默认 & 404
  { path: '/', redirect: '/welcome' },
  { component: './exception/404', path: '/*' },
];
