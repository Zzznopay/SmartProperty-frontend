// 后端网关统一基址
// dev: 直连网关绝对地址 http://localhost:8000/api/v1，浏览器直接请求网关（不经 dev proxy）
//      网关 GlobalCorsConfig 白名单已放行 http://localhost:5173（前端 dev server 端口，见 package.json PORT）
// 生产: 相对路径 /api/v1，由 Nginx 同源反代到网关
const isDev = process.env.NODE_ENV === 'development';
export const API_BASE = isDev ? 'http://localhost:8000/api/v1' : '/api/v1';
