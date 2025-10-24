# Identity & Authentication Management
## Documentación Técnica Simplificada

---

## 🎯 ¿Qué es este proyecto?

Un microservicio de gestión de usuarios y autenticación construido con arquitectura profesional y escalable.

**Función principal:** Manejar el registro, login, perfiles de usuario y control de acceso.

---

## 🛠️ Stack Tecnológico

### Runtime
- **Node.js v20 + TypeScript**
- Módulos ESNext con resolución NodeNext

### Base de Datos
- **PostgreSQL** (AWS RDS)
- **Prisma ORM** para acceso a datos

### Cloud (AWS)
- **Lambda:** Funciones serverless
- **API Gateway:** Exposición de endpoints REST
- **Cognito:** Autenticación y gestión de usuarios
- **SNS:** Sistema de eventos asíncronos
- **SSM Parameter Store:** Configuración centralizada y secretos encriptados

### Librerías
- **Inversify:** Inyección de dependencias
- **AWS SDK:** Integración con servicios AWS

---

## 🏗️ Arquitectura

### Patrón: Arquitectura Hexagonal (Ports & Adapters)

```
┌───────────────────────────────────────────────────────────────┐
│            Infrastructure Layer (Adapters)                    │
├───────────────────────────┬───────────────────────────────────┤
│     Inbound Adapters      │       Outbound Adapters           │
│  • REST Controllers       │  • Prisma (PostgreSQL)            │
│  • Lambda Handlers        │  • Cognito (Auth)                 │
│  • Event Subscribers      │  • SNS (Events)                   │
└─────────────┬─────────────┴─────────────┬─────────────────────┘
              │ Inbound Ports             │ Outbound Ports
              │ (Commands/Queries)        │ (Writer/Reader/Publisher)
┌─────────────▼───────────────────────────▼─────────────────────┐
│              Application Layer (Use Cases)                    │
│  • Commands (Write): Register, Update, Deactivate            │
│  • Queries (Read): GetById, GetByEmail, List                 │
│  • Mappers: Domain ↔ DTOs                                    │
└─────────────────────────────┬─────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                   Domain Layer (Core)                         │
│  • UserAggregate: Lógica de negocio pura                     │
│  • Value Objects: UserId, Email, UserStatus, FullName        │
│  • Business Rules: Validaciones de negocio                   │
│  • Domain Events: PasswordChangedEvent                       │
└───────────────────────────────────────────────────────────────┘
```

### Capas

1. **Domain (Core):** Lógica de negocio pura
   - `UserAggregate`: Encapsula reglas del usuario
   - `Value Objects`: Email, UserId, FullName, UserStatus
   - `Domain Events`: Notificaciones de cambios importantes

2. **Application (Use Cases):** Orquestación
   - **Commands:** Operaciones de escritura (registro, actualización)
   - **Queries:** Operaciones de lectura (consultas)

3. **Infrastructure (Adapters):** Implementación técnica
   - **Inbound:** Controladores REST
   - **Outbound:** Adaptadores de Cognito, Prisma, SNS

---

## 🔐 Principios de Diseño

### SOLID
- **Single Responsibility:** Cada clase tiene un propósito único
- **Open/Closed:** Extensible sin modificar código existente
- **Liskov Substitution:** Interfaces intercambiables
- **Interface Segregation:** Interfaces específicas (Writer, Reader, Checker)
- **Dependency Inversion:** Depende de abstracciones, no de implementaciones

### Domain-Driven Design (DDD)
- Modelado orientado al dominio del negocio
- Aggregate Root garantiza consistencia
- Lenguaje ubicuo (ubiquitous language)

### CQRS
Separación de operaciones de lectura y escritura para optimización independiente.

---

## 📡 APIs REST

### Endpoints Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/users/register` | Registra nuevo usuario |
| POST | `/auth/authenticate` | Login con email/password |
| POST | `/auth/complete-new-password` | Completa cambio de password inicial |

### Endpoints Protegidos (requieren token JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/refresh` | Refresca tokens de acceso |
| PATCH | `/users/{id}` | Actualiza perfil de usuario |
| PATCH | `/users/{id}/deactivate` | Desactiva cuenta |
| GET | `/users/{id}` | Obtiene usuario por ID |
| GET | `/users` | Lista usuarios (paginado) |
| GET | `/users/by-email` | Busca usuario por email |

---

## 📦 Formato de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "fullName": "Juan Pérez",
    "status": "active",
    "createdAt": "2025-01-20T10:30:00.000Z"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "user": {
    "title": "Recurso duplicado",
    "message": "Usuario con email 'usuario@ejemplo.com' ya existe"
  },
  "developer": {
    "code": "DUPLICATE_ENTITY",
    "component": "RegisterUserUseCase",
    "timestamp": "2025-01-20T10:30:00.000Z",
    "details": {
      "entityName": "Usuario",
      "field": "email"
    }
  }
}
```

**Dos niveles de información:**
- **user:** Mensaje amigable para el usuario final
- **developer:** Detalles técnicos para debugging

---

## 🔄 Flujos Principales

### 1. Registro de Usuario

```
1. Usuario envía email y nombre → POST /users/register
2. Sistema crea usuario en Cognito (autenticación)
3. Sistema valida datos con UserAggregate (dominio)
4. Sistema guarda usuario en PostgreSQL
5. Si falla paso 4 → Elimina usuario de Cognito (rollback)
6. Retorna datos del usuario creado con status "pending"
```

**Transacción compensatoria:** Garantiza consistencia entre Cognito y PostgreSQL.

### 2. Autenticación

```
1. Usuario envía email y password → POST /auth/authenticate
2. Sistema valida credenciales con Cognito
3. Cognito puede requerir cambio de password (NEW_PASSWORD_REQUIRED)
4. Si es válido → Retorna tokens (access, id, refresh)
5. Cliente usa accessToken en header: Authorization: Bearer <token>
```

### 3. Cambio de Password + Activación Automática

```
1. Usuario completa password → POST /auth/complete-new-password
2. Cognito valida y actualiza password
3. UserAggregate emite evento: PasswordChangedEvent
4. Evento se publica a SNS
5. Lambda handler escucha evento
6. Handler ejecuta activación automática
7. Status del usuario cambia: pending → active
```

**Arquitectura orientada a eventos:** Procesamiento asíncrono desacoplado.

---

## 🛡️ Sistema de Excepciones

### Tipos por Capa

**DomainException**
- `BUSINESS_RULE_VIOLATION`: Regla de negocio violada
- `INVALID_VALUE_OBJECT`: Value Object inválido

**ApplicationException**
- `ENTITY_NOT_FOUND`: Recurso no existe
- `DUPLICATE_ENTITY`: Recurso duplicado
- `USER_NOT_ACTIVE`: Usuario inactivo
- `TRANSACTION_FAILED`: Error en transacción

**InfrastructureException**
- `DATABASE`: Error de base de datos
- `EXTERNAL_SERVICE`: Fallo en servicio externo
- `AUTHENTICATION`: Error de autenticación
- `AUTHORIZATION`: Error de permisos

---

## 🔒 Seguridad

### Gestión de Configuración (SSM Parameter Store)
- **Cognito:** User Pool ID, Client ID, Client Secret (encriptado)
- **Database:** Connection URL (encriptado)
- **SNS:** Topic ARN

**Ventajas:**
- Secretos fuera del código
- Encriptación nativa con AWS KMS
- Configuración centralizada y versionada

### Autenticación
- **JWT tokens** emitidos por Cognito
- Validación en cada request protegido
- Controladores base manejan autenticación automáticamente

---

## 📚 Shared Toolkit

Librería NPM reutilizable que exporta:
- Excepciones tipadas por capa
- Value Objects base (UuidValueObject)
- Interfaces de reglas y eventos
- Manejador centralizado de errores
- Constructor de respuestas HTTP
- Controladores base con autenticación JWT
- Cargador de configuración SSM

**Beneficio:** Consistencia y reutilización en múltiples microservicios.

---

## 🎯 Aspectos Destacables

 **Arquitectura Limpia:** Dependencias apuntan hacia el dominio  
 **Testeable:** Inyección de dependencias facilita mocking  
 **Mantenible:** Código autodocumentado y estructura predecible  
 **Escalable:** Serverless + CQRS + eventos asíncronos  
 **Seguro:** Gestión de secretos, validación exhaustiva, autenticación robusta  
 **Observable:** Sistema de excepciones con trazabilidad completa

---

## 📊 Decisiones Técnicas Clave

| Desafío | Solución | Beneficio |
|---------|----------|-----------|
| Consistencia entre sistemas | Transacciones compensatorias | Rollback automático |
| Acoplamiento | Arquitectura hexagonal | Cambios tecnológicos sin afectar dominio |
| Escalabilidad | CQRS + Serverless | Escala independiente lectura/escritura |
| Complejidad de errores | Sistema de excepciones estructurado | Debugging eficiente |
| Procesamiento pesado | Arquitectura de eventos | Ejecución asíncrona no bloqueante |

---

## 🚀 Resultado

Microservicio de producción empresarial que demuestra:
- Arquitectura hexagonal y DDD
- Principios SOLID y Clean Architecture
- Cloud-native con AWS
- TypeScript estricto
- Patrones de diseño avanzados
- Código mantenible y escalable
