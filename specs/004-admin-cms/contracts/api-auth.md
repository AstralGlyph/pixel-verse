# API Contract: Authentication

**Version**: v1  
**Base Path**: `/api/admin/auth`

## Login

**POST** `/api/admin/auth/login`

### Request Body
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

### Response 200
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "role": { "id": "uuid", "name": "super_admin", "display_name": "超级管理员" }
    }
  }
}
```
**Side Effect**: Sets HTTP-only cookie `session_id` with session token.

### Response 401
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "用户名或密码错误" } }
```

---

## Logout

**POST** `/api/admin/auth/logout`

### Response 204 (No Content)
**Side Effect**: Invalidates session and clears `session_id` cookie.

---

## Get Current User

**GET** `/api/admin/auth/me`

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": { "id": "uuid", "name": "super_admin", "display_name": "超级管理员" },
    "permissions": ["post.create", "post.delete", "user.manage", "settings.manage"]
  }
}
```

### Response 401
```json
{ "error": { "code": "UNAUTHORIZED", "message": "请先登录" } }
```
