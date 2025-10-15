// 认证相关的工具函数

// 401状态码处理函数
export function handleUnauthorized() {
  // 清除本地存储的认证信息
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 重定向到登录页面，并添加当前页面作为重定向参数
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = `/login${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;

    // 使用replace而不是href，避免用户能够通过浏览器后退按钮返回需要认证的页面
    window.location.replace(loginUrl);
  }
}