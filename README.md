# 🔐 Identity & Authentication Management

Microservicio empresarial para gestión integral de identidades de usuario, construido con arquitectura hexagonal y Domain-Driven Design (DDD).

## 🚀 Características Principales

-  **Arquitectura Híbrida:** Cognito (autenticación) + PostgreSQL (datos de negocio)
-  **Generación automática** de contraseñas temporales en registro
-  **Flow de cambio obligatorio** de contraseña en primer login
-  Autenticación y autorización robusta con AWS Cognito + JWT
-  Arquitectura hexagonal con separación clara de responsabilidades
-  Patrón CQRS para comandos y queries
-  Event-Driven Architecture con AWS SNS
-  Gestión completa del ciclo de vida de usuarios
-  Manejo estructurado de errores (dual format: usuarios y desarrolladores)
-  Transacciones compensatorias para consistencia entre servicios

## 🛠️ Stack Tecnológico

### Core
- **Runtime:** Node.js v20
- **Language:** TypeScript 5.8 (strict mode)
- **Framework:** AWS SAM (Serverless Application Model)

### AWS Services
- **Compute:** AWS Lambda (9 functions + 1 event handler)
- **API:** API Gateway (REST API con CORS)
- **Auth:** AWS Cognito User Pool
- **Messaging:** AWS SNS (eventos de dominio)
- **Database:** AWS RDS PostgreSQL
- **Config:** AWS SSM Parameter Store (multi-environment)
- **IAM:** Políticas granulares para Lambda

### Database & ORM
- **Database:** PostgreSQL
- **ORM:** Prisma 6.x
- **Migrations:** Prisma Migrate

### Dependencies
- **DI Container:** Inversify (inyección de dependencias)
- **Validation:** Zod (schemas de validación)
- **AWS SDK v3:** Cognito, SNS, SSM clients
- **Shared Toolkit:** `@companydev/shared-toolkit` (utilidades compartidas)

### Architecture & Patterns
- **Architecture:** Hexagonal Architecture
- **Design:** Domain-Driven Design (DDD)
- **Patterns:** CQRS, Event-Driven, SOLID Principles

## 📁 Estructura del Proyecto

```
identity-service/
├── src/
│   ├── domain/                 # Lógica de negocio pura
│   │   └── user/
│   │       ├── aggregate-root/
│   │       ├── value-objects/
│   │       ├── events/
│   │       └── business-rules/
│   │
│   ├── application/            # Orquestación
│   │   ├── ports/
│   │   │   ├── inbound/       # Commands & Queries
│   │   │   └── outbound/      # Persistence, Auth, Messaging
│   │   ├── use-cases/
│   │   │   ├── commands/      # Escritura (CQRS)
│   │   │   └── queries/       # Lectura (CQRS)
│   │   └── mappers/
│   │
│   └── infrastructure/         # Detalles técnicos
│       ├── context/
│       ├── di/
│       └── adapters/
│           ├── inbound/       # REST Controllers & Lambda Handlers
│           └── outbound/      # Prisma, Cognito, SNS
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## 📊 Métricas del Proyecto

- **Capas Hexagonales:** 3 (Domain, Application, Infrastructure)
- **Endpoints REST:** 9
- **Servicios AWS:** 5+ (Lambda, API Gateway, Cognito, SNS, RDS)
- **TypeScript Coverage:** 100%

## 🔒 Seguridad y Autenticación

### Autenticación JWT con AWS Cognito

Este servicio implementa autenticación mediante tokens JWT proporcionados por AWS Cognito.

#### 🔓 Rutas Públicas (no requieren token)
- `POST /register` - Registro de usuarios
- `POST /authenticate` - Login inicial

#### 🔐 Rutas Protegidas (requieren JWT)
Todas las demás rutas requieren header de autorización:

```http
Authorization: Bearer eyJraWQiOiJQQ2hYK3FTeU9reHFCYVlFWmJ2djlzRjdiQTg...
```

**Endpoints protegidos:**
- `POST /complete-new-password`
- `POST /refresh-tokens`
- `PUT /users/{id}`
- `POST /users/{id}/deactivate`
- `GET /users/{id}`
- `GET /users?email={email}`
- `GET /users/list`

#### Respuesta de Error (401 - Unauthorized)

Formato dual (usuario + desarrollador):

```json
{
  "success": false,
  "user": {
    "message": "No se proporcionó token de autenticación",
    "title": "No autenticado"
  },
  "developer": {
    "code": "AUTHENTICATION",
    "timestamp": "2025-10-22T23:40:23.369Z",
    "component": "GetUserByIdController.extractToken",
    "stackTrace": "InfrastructureException: No se proporcionó token de autenticación\n..."
  }
}
```

### Características de Seguridad
-  Autenticación JWT mediante AWS Cognito
-  Validación de tokens en cada request protegido
-  Validación de entrada con Zod schemas
-  Manejo seguro de credenciales con AWS SSM
-  Principio de mínimo privilegio en políticas IAM
-  Manejo estructurado de errores con información para usuarios y desarrolladores

## 🔌 Endpoints API

### Commands (Escritura)

#### **POST** `/register`
Registra un nuevo usuario con contraseña temporal generada automáticamente.

**🔓 Ruta Pública** (no requiere token)

**Request:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a599832a-ec8a-4fbf-8295-1085251d9312",
    "email": "user@example.com",
    "fullName": "John Doe",
    "status": "pending",
    "externalAuthId": "24e874c8-1051-702c-cea5-590b7ccaa96b",
    "createdAt": "2025-10-20T20:26:43.190Z"
  }
}
```
**Nota:** El usuario recibe un email con contraseña temporal (`e2P|OF6S`).

---

#### **POST** `/authenticate`
Autentica un usuario. En el primer login retorna `NEW_PASSWORD_REQUIRED`.

**🔓 Ruta Pública** (no requiere token)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "e2P|OF6S"
}
```

**Response (200) - Primer Login:**
```json
{
  "success": true,
  "data": {
    "challengeName": "NEW_PASSWORD_REQUIRED",
    "session": "AYABeM3nbErl0eNEBPg66ZYhs0wA..."
  }
}
```

**Response (200) - Login Normal:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJraWQiOiJQQ2hYK3FTeU9r...",
    "idToken": "eyJraWQiOiJTRHdnY0tHK25J...",
    "refreshToken": "eyJjdHkiOiJKV1QiLCJl...",
    "expiresIn": 3600
  }
}
```

---

#### **POST** `/complete-new-password`
Completa el cambio de contraseña obligatorio y activa el usuario.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Request:**
```json
{
  "email": "user@example.com",
  "newPassword": "MySecurePassword#123",
  "session": "AYABeM3nbErl0eNEBPg66ZYhs0wA..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJraWQiOiJQQ2hYK3FTeU9r...",
    "idToken": "eyJraWQiOiJTRHdnY0tHK25J...",
    "refreshToken": "eyJjdHkiOiJKV1QiLCJl...",
    "expiresIn": 3600
  }
}
```

**Eventos generados:**
- Publica evento `PasswordChangedEvent` en SNS
- El handler del evento cambia el status del usuario de `pending` → `active`

---

#### **POST** `/refresh-tokens`
Renueva los tokens de acceso usando el refresh token.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Request:**
```json
{
  "refreshToken": "eyJjdHkiOiJKV1QiLCJl..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJraWQiOiJQQ2hYK3FTeU9r...",
    "idToken": "eyJraWQiOiJTRHdnY0tHK25J...",
    "expiresIn": 3600
  }
}
```

---

#### **PUT** `/users/{id}`
Actualiza información del usuario.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Request:**
```json
{
  "fullName": "John Doe Updated"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a599832a-ec8a-4fbf-8295-1085251d9312",
    "fullName": "John Doe Updated",
    "updatedAt": "2025-10-20T20:56:25.965Z"
  }
}
```

---

#### **POST** `/users/{id}/deactivate`
Desactiva un usuario (soft delete). Solo requiere el ID en la URL.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "582762b6-e2d8-41c0-923a-3dc9bbadd07a",
    "status": "inactive",
    "updatedAt": "2025-10-22T22:16:07.240Z"
  }
}
```

---

### Queries (Lectura)

#### **GET** `/users/{id}`
Obtiene un usuario por su ID.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a599832a-ec8a-4fbf-8295-1085251d9312",
    "email": "user@example.com",
    "fullName": "John Doe",
    "status": "active",
    "externalAuthId": "24e874c8-1051-702c-cea5-590b7ccaa96b",
    "createdAt": "2025-10-20T20:26:43.190Z",
    "updatedAt": "2025-10-20T20:56:25.965Z"
  }
}
```

---

#### **GET** `/users?email={email}`
Obtiene un usuario por su email.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a599832a-ec8a-4fbf-8295-1085251d9312",
    "email": "user@example.com",
    "fullName": "John Doe",
    "status": "active",
    "externalAuthId": "24e874c8-1051-702c-cea5-590b7ccaa96b",
    "createdAt": "2025-10-20T20:26:43.190Z",
    "updatedAt": "2025-10-20T20:56:25.965Z"
  }
}
```

---

#### **GET** `/users/list`
Lista todos los usuarios con paginación.

**🔐 Ruta Protegida** (requiere `Authorization: Bearer <accessToken>`)

**Query params (opcionales):**
- `page`: número de página (default: 1)
- `limit`: elementos por página (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "947275c2-d1ef-469c-8f83-d8767c2eca10",
        "email": "juanpaz@gmail.com",
        "fullName": "JUAN PAZ",
        "status": "pending",
        "createdAt": "2025-10-20T21:10:30.989Z"
      },
      {
        "id": "a599832a-ec8a-4fbf-8295-1085251d9312",
        "email": "user@example.com",
        "fullName": "John Doe",
        "status": "active",
        "createdAt": "2025-10-20T20:26:43.190Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

## 🏗️ Principios de Arquitectura

### Hexagonal Architecture
- **Domain Layer:** Lógica de negocio pura, sin dependencias externas
- **Application Layer:** Casos de uso y orquestación mediante ports
- **Infrastructure Layer:** Adaptadores para servicios externos (AWS, Prisma)

### CQRS Pattern
- **Commands:** Operaciones de escritura que modifican el estado
- **Queries:** Operaciones de lectura optimizadas

### Event-Driven Architecture
- Eventos de dominio publicados en AWS SNS
- Comunicación asíncrona entre microservicios
- **Ejemplo:** `PasswordChangedEvent`:
  1. Usuario completa cambio de contraseña (`/complete-new-password`)
  2. Se publica evento en SNS Topic
  3. Lambda handler suscrito al evento actualiza el status del usuario de `pending` → `active` en PostgreSQL
  4. Otros microservicios pueden suscribirse al mismo evento para reaccionar

### SOLID Principles
- **Single Responsibility:** Cada clase tiene una única responsabilidad
- **Open/Closed:** Abierto para extensión, cerrado para modificación
- **Liskov Substitution:** Interfaces bien definidas
- **Interface Segregation:** Interfaces específicas (ports)
- **Dependency Inversion:** Inyección de dependencias con Inversify

## 🔐 Arquitectura Híbrida: Cognito + PostgreSQL

Este servicio implementa una **arquitectura híbrida** que combina lo mejor de dos mundos:

### AWS Cognito (Autenticación)
- **Gestión de credenciales** y autenticación
- **Generación de tokens JWT** (Access Token, ID Token, Refresh Token)
- **Políticas de contraseñas** configurables
- **MFA** (Multi-Factor Authentication) ready
- **Secret Hash** para mayor seguridad

### PostgreSQL (Datos de Negocio)
- **Información de dominio** del usuario (id, email, fullName, status)
- **Sincronización** con Cognito mediante `externalAuthId`
- **Queries optimizadas** con Prisma ORM e índices
- **Transacciones ACID** para consistencia

### Modelo de Datos (Prisma Schema)

```prisma
model User {
  id             String   @id @db.Uuid
  email          String   @unique @db.VarChar(255)
  fullName       String   @map("full_name") @db.VarChar(100)
  status         Int      @db.SmallInt
  externalAuthId String   @unique @map("external_auth_id") @db.VarChar(255)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
}
```

**Campos clave:**
- `id`: UUID del usuario en PostgreSQL
- `externalAuthId`: UUID del usuario en AWS Cognito (clave de sincronización)
- `status`: Estado del usuario (0: Pending, 1: Active, 2: Inactive)
- `email`: Índice único para búsquedas rápidas

### Flujo de Sincronización

```
1. Registro de Usuario:
   ┌─────────────────┐
   │  POST /register │
   └────────┬────────┘
            │
            ├──► AWS Cognito
            │    └─► Genera contraseña temporal (e2P|OF6S)
            │    └─► Envía email al usuario
            │    └─► Retorna: externalAuthId
            │
            └──► PostgreSQL
                 └─► Guarda: id, email, fullName, status=pending
                 └─► Retorna: user data

2. Primer Login (Contraseña Temporal):
   ┌─────────────────────┐
   │ POST /authenticate  │
   └──────────┬──────────┘
              │
              └──► Cognito detecta NEW_PASSWORD_REQUIRED
                   └─► Retorna: { challengeName, session }

3. Cambio Obligatorio de Contraseña:
   ┌──────────────────────────────┐
   │ POST /complete-new-password  │
   └──────────────┬───────────────┘
                  │
                  ├──► Cognito
                  │    └─► Actualiza contraseña
                  │    └─► Retorna: JWT tokens
                  │
                  ├──► SNS Topic
                  │    └─► Publica: PasswordChangedEvent
                  │
                  └──► Lambda Event Handler (suscrito a SNS)
                       └─► PostgreSQL: UPDATE status=active

4. Logins Posteriores:
   ┌─────────────────────┐
   │ POST /authenticate  │
   └──────────┬──────────┘
              │
              └──► Cognito (valida credenciales)
                   └─► Retorna: JWT tokens directamente
```

### Transacciones Compensatorias

Si falla la creación en Cognito o PostgreSQL, se ejecutan **rollbacks compensatorios**:
- Cognito creado + PostgreSQL falla → Se elimina usuario de Cognito
- PostgreSQL creado + Cognito falla → Se elimina usuario de PostgreSQL

Esto garantiza **consistencia eventual** entre ambos sistemas.

## 🚦 Getting Started

### Prerrequisitos
```bash
Node.js v20
AWS CLI configurado
SAM CLI instalado
PostgreSQL (RDS en AWS)
AWS Cognito User Pool configurado
```

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd identity-service

# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate
```

### Configuración AWS SSM Parameters

Crear los siguientes parámetros en AWS Systems Manager Parameter Store:

```bash
# Database
/identity-service/dev/DATABASE_URL
/identity-service/dev/DATABASE_DIRECT_URL

# Cognito
/identity-service/dev/COGNITO_USER_POOL_ID
/identity-service/dev/COGNITO_CLIENT_ID
/identity-service/dev/COGNITO_CLIENT_SECRET

# SNS Events (Pub/Sub)
/identity-service/dev/EVENTS_TOPIC_ARN
/identity-service/dev/PASSWORD_CHANGED_EVENT_NAME
```

**Nota:** `EVENTS_TOPIC_ARN` es auto-inyectado por SAM durante el despliegue.

### Desarrollo Local
```bash
# Linter
npm run lint

# Formatear código
npm run format

# Compilar TypeScript
npm run build

# Limpiar y compilar
npm run build:clean

# Iniciar API localmente con SAM (hot reload)
npm run sam:start
```

### Preparar Lambda Layer
```bash
# Preparar layer con dependencias y Prisma
npm run layer:prepare

# Limpiar layer
npm run layer:clean
```

### Despliegue a AWS

```bash
# Deploy completo a DEV (build + layer + deploy)
npm run predeploy:dev && npm run deploy:dev

# O paso por paso:
# 1. Build y preparar layer
npm run build:clean
npm run layer:prepare

# 2. Build con SAM
sam build

# 3. Deploy
sam deploy --force-upload
```

### Estructura de Despliegue

El template SAM (`template.dev.yaml`) despliega:
- **9 Lambda Functions** (6 Commands + 3 Queries)
- **1 API Gateway** con CORS configurado
- **1 SNS Topic** para eventos de dominio
- **1 Lambda Layer** compartido con node_modules y Prisma
- **1 IAM Role** compartido con permisos para SSM, SNS, Cognito

## 📦 Scripts Disponibles

### Desarrollo
```bash
npm run lint              # Ejecutar ESLint
npm run format            # Formatear código con Prettier
npm run build             # Compilar TypeScript a dist/
npm run build:clean       # Limpiar y compilar desde cero
npm run sam:start         # Iniciar API local con hot reload
```

### Lambda Layer
```bash
npm run layer:prepare     # Preparar layer con node_modules + Prisma
npm run layer:clean       # Limpiar directorio layer/
```

### Despliegue
```bash
npm run predeploy:dev     # Preparación pre-deploy (build + layer)
npm run deploy:dev        # Build SAM + Deploy a AWS
```

## 📝 Configuración por Entorno

El servicio utiliza AWS SSM Parameter Store para gestionar configuraciones por entorno:

### Parámetros requeridos:

#### Base de datos
```
/identity-service/{stage}/DATABASE_URL
/identity-service/{stage}/DATABASE_DIRECT_URL
```

#### Cognito (Autenticación)
```
/identity-service/{stage}/COGNITO_USER_POOL_ID
/identity-service/{stage}/COGNITO_CLIENT_ID
/identity-service/{stage}/COGNITO_CLIENT_SECRET
```

#### SNS Events (Pub/Sub)
```
/identity-service/{stage}/EVENTS_TOPIC_ARN
/identity-service/{stage}/PASSWORD_CHANGED_EVENT_NAME
```

Donde `{stage}` puede ser: `dev`, `staging` o `prod`

### Variables de entorno (Lambda)
```bash
STAGE=dev                    # Entorno actual
NODE_OPTIONS=--enable-source-maps
EVENTS_TOPIC_ARN=arn:aws:... # ARN del topic SNS (auto-inyectado por SAM)
```

## 👨‍💻 Autor

**Carlos López Alvarado**
- Email: carlosdev1337@gmail.com
- Ubicación: Lima, Perú
- Edad: 27 años

---

⭐ **Identity & Authentication Management** - Arquitectura Hexagonal + DDD + AWS
