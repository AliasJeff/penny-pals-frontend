# 记账小星球微信小程序前端

记账小星球是一款以账本为核心的多人协作记账微信小程序，支持用户共享账本、灵活预算管理以及全面的数据分析功能。

## 技术栈

- React
- Taro
- NutUI

## 功能特点

- 多人协作记账
- 共享账本管理
- 灵活预算设置
- 数据统计分析
- 微信登录授权

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
├── hooks/           # 自定义 Hooks
├── pages/           # 页面组件
│   ├── home/        # 首页
│   ├── ledgers/     # 账本相关页面
│   ├── statistics/  # 统计页面
│   ├── profile/     # 个人中心
│   ├── entry/       # 记账相关页面
│   └── login/       # 登录页面
├── services/        # API 服务
├── utils/           # 工具函数
├── app.js           # 应用入口
├── app.config.js    # 应用配置
└── app.less         # 全局样式
```

## 安装与运行

1. 安装依赖

```bash
npm install
```

2. 开发模式运行

```bash
npm run dev:weapp
```

3. 生产环境构建

```bash
npm run build:weapp
```

## API 接口文档

### 用户相关接口

#### 1. 用户登录

- **URL**: `/api/user/login`
- **Method**: `POST`
- **请求参数**:

```json
{
  "username": "用户名",
  "password": "密码"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": {
    "token": "jwt_token",
    "userId": 1,
    "username": "用户名"
  },
  "message": "登录成功"
}
```

#### 2. 微信登录

- **URL**: `/api/user/login/wx_open`
- **Method**: `GET`
- **请求参数**:

```
?code=wx_code
```

- **响应结果**:

```json
{
  "code": 0,
  "data": {
    "token": "jwt_token",
    "userId": 1,
    "username": "微信用户"
  },
  "message": "登录成功"
}
```

#### 3. 获取当前登录用户信息

- **URL**: `/api/user/get/login`
- **Method**: `GET`
- **请求参数**: 无
- **响应结果**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "用户名",
    "avatar": "头像URL",
    "email": "邮箱"
  },
  "message": "获取成功"
}
```

#### 4. 更新用户信息

- **URL**: `/api/user/update`
- **Method**: `POST`
- **请求参数**:

```json
{
  "username": "新用户名",
  "avatar": "新头像URL",
  "email": "新邮箱"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": true,
  "message": "更新成功"
}
```

### 账本相关接口

#### 1. 创建账本

- **URL**: `/api/ledger/create`
- **Method**: `POST`
- **请求参数**:

```json
{
  "name": "账本名称",
  "description": "账本描述",
  "isShared": true,
  "budget": 5000
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "账本名称",
    "description": "账本描述",
    "isShared": true,
    "budget": 5000,
    "createTime": "2023-01-01T00:00:00Z"
  },
  "message": "创建成功"
}
```

#### 2. 获取用户的账本列表

- **URL**: `/api/ledger/my/list`
- **Method**: `GET`
- **请求参数**: 无
- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "账本名称",
      "description": "账本描述",
      "isShared": true,
      "budget": 5000,
      "createTime": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "获取成功"
}
```

#### 3. 获取账本详情

- **URL**: `/api/ledger/get`
- **Method**: `GET`
- **请求参数**:

```
?id=1
```

- **响应结果**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "账本名称",
    "description": "账本描述",
    "isShared": true,
    "budget": 5000,
    "createTime": "2023-01-01T00:00:00Z",
    "creatorId": 1
  },
  "message": "获取成功"
}
```

#### 4. 更新账本

- **URL**: `/api/ledger/update`
- **Method**: `POST`
- **请求参数**:

```json
{
  "id": 1,
  "name": "新账本名称",
  "description": "新账本描述",
  "budget": 6000
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": true,
  "message": "更新成功"
}
```

#### 5. 删除账本

- **URL**: `/api/ledger/delete`
- **Method**: `POST`
- **请求参数**:

```
header: { params: { id: 1 } }
```

- **响应结果**:

```json
{
  "code": 0,
  "data": true,
  "message": "删除成功"
}
```

#### 6. 获取账本成员列表

- **URL**: `/api/ledger/user/list`
- **Method**: `GET`
- **请求参数**:

```
?ledgerId=1
```

- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "username": "用户名",
      "avatar": "头像URL",
      "role": "owner"
    }
  ],
  "message": "获取成功"
}
```

#### 7. 添加账本成员

- **URL**: `/api/ledger/user/add`
- **Method**: `POST`
- **请求参数**:

```json
{
  "ledgerId": 1,
  "userId": 2,
  "role": "member"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": true,
  "message": "添加成功"
}
```

### 记账记录相关接口

#### 1. 创建记账记录

- **URL**: `/api/entry/create`
- **Method**: `POST`
- **请求参数**:

```json
{
  "ledgerId": 1,
  "amount": 100.5,
  "type": "expense",
  "category": "餐饮",
  "date": "2023-01-01",
  "note": "午餐"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "ledgerId": 1,
    "userId": 1,
    "amount": 100.5,
    "type": "expense",
    "category": "餐饮",
    "date": "2023-01-01T00:00:00Z",
    "note": "午餐",
    "createTime": "2023-01-01T12:00:00Z"
  },
  "message": "创建成功"
}
```

#### 2. 获取账本的记账记录列表

- **URL**: `/api/entry/listByLedger`
- **Method**: `POST`
- **请求参数**:

```json
{
  "ledgerId": 1,
  "pageSize": 10,
  "pageNum": 1,
  "orderBy": "date",
  "orderDirection": "desc"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "ledgerId": 1,
      "userId": 1,
      "username": "用户名",
      "amount": 100.5,
      "type": "expense",
      "category": "餐饮",
      "date": "2023-01-01T00:00:00Z",
      "note": "午餐",
      "createTime": "2023-01-01T12:00:00Z"
    }
  ],
  "message": "获取成功"
}
```

#### 3. 获取用户的记账记录列表

- **URL**: `/api/entry/my/list`
- **Method**: `POST`
- **请求参数**:

```json
{
  "pageSize": 10,
  "pageNum": 1,
  "orderBy": "date",
  "orderDirection": "desc"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "ledgerId": 1,
      "ledgerName": "账本名称",
      "amount": 100.5,
      "type": "expense",
      "category": "餐饮",
      "date": "2023-01-01T00:00:00Z",
      "note": "午餐",
      "createTime": "2023-01-01T12:00:00Z"
    }
  ],
  "message": "获取成功"
}
```

#### 4. 更新记账记录

- **URL**: `/api/entry/update`
- **Method**: `POST`
- **请求参数**:

```json
{
  "id": 1,
  "amount": 120.5,
  "type": "expense",
  "category": "餐饮",
  "date": "2023-01-01",
  "note": "午餐和饮料"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": true,
  "message": "更新成功"
}
```

#### 5. 删除记账记录

- **URL**: `/api/entry/delete`
- **Method**: `POST`
- **请求参数**:

```json
{
  "id": 1
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": true,
  "message": "删除成功"
}
```

## 统计分析接口

#### 1. 获取账本支出统计

- **URL**: `/api/statistics/ledger/expense`
- **Method**: `POST`
- **请求参数**:

```json
{
  "ledgerId": 1,
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "groupBy": "category"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "category": "餐饮",
      "amount": 500.5
    },
    {
      "category": "交通",
      "amount": 200.0
    }
  ],
  "message": "获取成功"
}
```

#### 2. 获取账本收入统计

- **URL**: `/api/statistics/ledger/income`
- **Method**: `POST`
- **请求参数**:

```json
{
  "ledgerId": 1,
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "groupBy": "category"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "category": "工资",
      "amount": 5000.0
    },
    {
      "category": "奖金",
      "amount": 1000.0
    }
  ],
  "message": "获取成功"
}
```

#### 3. 获取账本趋势统计

- **URL**: `/api/statistics/ledger/trend`
- **Method**: `POST`
- **请求参数**:

```json
{
  "ledgerId": 1,
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "groupBy": "day"
}
```

- **响应结果**:

```json
{
  "code": 0,
  "data": [
    {
      "date": "2023-01-01",
      "expense": 100.5,
      "income": 0
    },
    {
      "date": "2023-01-02",
      "expense": 200.0,
      "income": 5000.0
    }
  ],
  "message": "获取成功"
}
```

## 贡献者

- 记账小星球团队

## 许可证

MIT

