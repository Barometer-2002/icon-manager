# 图标管理工具 API 接口文档

## 1. 认证 (Authentication)

### 1.1 登录
- **Endpoint**: `POST /api/auth/login`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "password": "your_admin_password"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    { "success": true }
    ```
  - Failure (401):
    ```json
    { "error": "Invalid password" }
    ```
- **Note**: 成功登录后会设置 HTTP-only Cookie。

### 1.2 登出
- **Endpoint**: `POST /api/auth/logout`
- **Response**:
  ```json
  { "success": true }
  ```

### 1.3 检查登录状态
- **Endpoint**: `GET /api/auth/check`
- **Response**:
  ```json
  { "loggedIn": true }
  ```

## 2. 图标管理 (Icons)

### 2.1 获取图标列表
- **Endpoint**: `GET /api/icons`
- **Params**:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 50)
  - `search`: 搜索关键词 (在当前分类内匹配文件名或标签)
  - `category`: 分类筛选 (可选，支持: `all`/`icon`、`pc`、`mobile`、`card`)
  - `refresh`: `true` 强制刷新文件列表缓存
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "subdir/icon.svg",
        "name": "icon.svg",
        "url": "/api/image/subdir/icon.svg",
        "tags": ["tag1", "tag2"],
        "mtime": 1715000000000
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 50,
      "totalPages": 2
    }
  }
  ```

- **常用调用示例**:
  - 获取全部图标: `GET /api/icons`
  - 仅获取 PC 壁纸: `GET /api/icons/pc`
  - 仅获取手机壁纸: `GET /api/icons/mobile`
  - 仅获取卡片图片: `GET /api/icons/card`

### 2.2 获取 PC 壁纸列表
- **Endpoint**: `GET /api/icons/pc`
- **Description**: 返回 PC 壁纸列表，响应结构与 `GET /api/icons` 相同。

### 2.3 获取手机壁纸列表
- **Endpoint**: `GET /api/icons/mobile`
- **Description**: 返回手机壁纸列表，响应结构与 `GET /api/icons` 相同。

### 2.4 获取卡片图片列表
- **Endpoint**: `GET /api/icons/card`
- **Description**: 返回卡片图片列表，响应结构与 `GET /api/icons` 相同。

### 2.5 上传图标
- **Authentication**: Required
- **Endpoint**: `POST /api/icons`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: (Binary) 图片文件
  - `category`: (String) 分类 (默认: "icon")
- **Response**:
  ```json
  { 
    "success": true, 
    "message": "File uploaded" 
  }
  ```

### 2.6 更新图标元数据
- **Authentication**: Required
- **Endpoint**: `PUT /api/icons/[...id]`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "tags": ["ui", "logo"]
  }
  ```
- **Response**:
  ```json
  { "success": true }
  ```

### 2.7 删除图标
- **Authentication**: Required
- **Endpoint**: `DELETE /api/icons/[...id]`
- **Response**:
  ```json
  { "success": true }
  ```

## 3. 图片资源 (Images)

### 3.1 获取图标图片
- **Endpoint**: `GET /api/image/[...path]`
- **Description**: 直接返回图片文件流。
- **Supported Types**: `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.ico`
- **Example**: `/api/image/logo.png`
