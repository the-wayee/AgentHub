# API响应格式修复说明

## 问题描述
后端返回的数据格式与前端期望的格式不匹配：

### 后端格式：
```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "uuid": "0daa2b8c-1566-4a7d-a91a-ce4e1c6ff0d4",
        "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
    },
    "timestamp": 1759669225345
}
```

### 前端期望格式：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "uuid": "0daa2b8c-1566-4a7d-a91a-ce4e1c6ff0d4",
        "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
}
```

## 解决方案
在 `apiFetch` 函数中添加了数据格式转换逻辑：

```typescript
const result = await res.json();

// 处理后端返回的数据格式
// 后端格式: { code: 200, message: "操作成功", data: {...} }
// 前端期望: { success: boolean, message: string, data: T }
if (result && typeof result === 'object' && 'code' in result) {
  return {
    success: result.code === 200,
    message: result.message || (result.code === 200 ? '操作成功' : '操作失败'),
    data: result.data
  };
}

// 如果已经是前端期望的格式，直接返回
return result;
```

## 修复效果
- ✅ 图形验证码现在可以正确显示
- ✅ 所有API响应都会自动转换为前端期望的格式
- ✅ 保持向后兼容性，如果已经是正确格式则直接返回

## 测试方法
1. 访问注册页面: http://localhost:3001/register
2. 图形验证码应该正确显示
3. 点击验证码图片可以刷新
4. 邮箱验证码发送等功能也应该正常工作