# DAWI Frontend - Sistema de Reservas de Hoteles

Frontend desarrollado en **Angular 20** con **Tailwind CSS**. Aplicación SPA con portal de cliente y panel administrativo.

## Información del Proyecto

| Propiedad | Valor |
|-----------|-------|
| Angular | 20.3.0 |
| Node.js | 18+ (recomendado 20+) |
| Puerto (dev) | 4200 |
| CSS Framework | Tailwind CSS 4.1.17 |
| Charts | Chart.js 4.4.1 |
| PDF | jspdf 2.5.2 |

## Estructura del Proyecto

```
dawi_frontend/
├── src/
│   ├── app/
│   │   ├── admin/                    # Panel administrativo
│   │   │   ├── departamento/pages/   # CRUD departamentos
│   │   │   ├── hotel/pages/          # CRUD hoteles
│   │   │   ├── habitacion/pages/     # CRUD habitaciones
│   │   │   ├── reserva/pages/        # Gestión reservas
│   │   │   ├── layout/               # Layout admin + sidebar
│   │   │   └── pages/dashboard-page/ # Dashboard
│   │   │
│   │   ├── auth/                     # Autenticación
│   │   │   ├── guards/               # authGuard, adminGuard
│   │   │   ├── interceptors/         # JWT interceptor
│   │   │   ├── pages/                # Login, Register
│   │   │   └── services/             # AuthService
│   │   │
│   │   ├── home/                     # Portal cliente
│   │   │   ├── components/           # card-hotel, etc.
│   │   │   ├── layout/               # navbar, footer
│   │   │   ├── pages/                # Home, Hoteles, Reservas...
│   │   │   └── services/             # ReservaPublicService
│   │   │
│   │   ├── services/                 # Servicios compartidos
│   │   ├── interfaces/               # DTOs/Interfaces
│   │   ├── enviroments/              # environment.ts
│   │   ├── app.routes.ts             # Rutas principales
│   │   └── app.config.ts             # Configuración
│   │
│   ├── styles.css                    # Estilos globales
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
├── tsconfig.json
└── .postcssrc.json
```

## Módulos y Rutas

### Auth (`/auth`)
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/auth/login` | LoginPage | Inicio de sesión |
| `/auth/register` | RegisterPage | Registro de usuario |

### Home - Portal Cliente (`/home`)
| Ruta | Componente | Guard |
|------|------------|-------|
| `/home` | HomePage | - |
| `/home/departamentos` | DepartamentosPage | - |
| `/home/hoteles/:depId` | HotelesPage | - |
| `/home/hotel/:hotelId/reservar` | ReservaPage | - |
| `/home/reserva/:id/pago` | PagoPage | authGuard |
| `/home/reserva/:id/confirmacion` | ConfirmacionPage | authGuard |
| `/home/mis-reservas` | MisReservasPage | authGuard |
| `/home/notificaciones` | NotificacionesPage | authGuard |
| `/home/contacto` | ContactoPage | - |

### Admin - Panel Administrativo (`/admin`)
| Ruta | Componente | Guard |
|------|------------|-------|
| `/admin/dashboard` | DashboardPage | adminGuard |
| `/admin/hotel/list` | ListHotel | adminGuard |
| `/admin/hotel/create` | CreateHotel | adminGuard |
| `/admin/departamento/list` | ListDepartamento | adminGuard |
| `/admin/habitacion/list` | ListHabitacion | adminGuard |
| `/admin/reserva/list` | ListReserva | adminGuard |

## Configuración de Entornos

### Desarrollo (`src/app/enviroments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};
```

### Producción (`src/app/enviroments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com',
};
```

## Servicios y API

Todos los servicios usan el `apiUrl` del environment + `/api/v1`:

| Servicio | Endpoints Base |
|----------|---------------|
| AuthService | `/api/v1/auth/*`, `/api/v1/users/*` |
| DepartamentoService | `/api/v1/departamentos/*` |
| HotelService | `/api/v1/hoteles/*` |
| HabitacionService | `/api/v1/habitaciones/*` |
| ReservaService | `/api/v1/reservas/*`, `/api/v1/admin/*` |
| NotificacionService | `/api/v1/notificaciones/*` |
| DashboardService | `/api/v1/dashboard/*` |

---

## Docker

### Dockerfile

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY dawi_frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY dawi_frontend/ .

# Build de producción
RUN npm run build -- --configuration=production

# Stage 2: Nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar build de Angular
COPY --from=builder /app/dist/dawi_frontend/browser /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logs
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/rss+xml application/atom+xml image/svg+xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Angular routing - SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (opcional - si el frontend y backend están en mismo dominio)
        # location /api/ {
        #     proxy_pass http://api-gateway:8080/api/;
        #     proxy_http_version 1.1;
        #     proxy_set_header Upgrade $http_upgrade;
        #     proxy_set_header Connection 'upgrade';
        #     proxy_set_header Host $host;
        #     proxy_set_header X-Real-IP $remote_addr;
        #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        #     proxy_set_header X-Forwarded-Proto $scheme;
        #     proxy_cache_bypass $http_upgrade;
        # }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hotel-frontend
    ports:
      - "80:80"
    environment:
      - API_URL=http://api-gateway:8080
    depends_on:
      - api-gateway
    networks:
      - hotel-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Si necesitas proxy al API Gateway
  api-gateway:
    image: api-gateway:latest
    container_name: api-gateway
    ports:
      - "8080:8080"
    networks:
      - hotel-network

networks:
  hotel-network:
    external: true
```

### Dockerfile con Environment Variables Runtime

```dockerfile
# Dockerfile.dynamic
FROM node:20-alpine AS builder

WORKDIR /app

COPY dawi_frontend/package*.json ./
RUN npm ci

COPY dawi_frontend/ .

# Build sin environment específico
RUN npm run build -- --configuration=production

FROM nginx:alpine

# Script para reemplazar API_URL en runtime
RUN apk add --no-cache bash

# Copiar archivos
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/dawi_frontend/browser /usr/share/nginx/html

# Script de inicio
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

### docker-entrypoint.sh

```bash
#!/bin/bash
set -e

# Reemplazar API_URL en los archivos JS
if [ -n "$API_URL" ]; then
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8080|$API_URL|g" {} \;
    echo "API_URL replaced with: $API_URL"
fi

exec "$@"
```

### Comandos Docker

```bash
# Compilar
cd dawi_frontend
npm install
npm run build -- --configuration=production

# Construir imagen
docker build -t hotel-frontend:latest .

# Ejecutar
docker run -d \
  --name hotel-frontend \
  -p 80:80 \
  hotel-frontend:latest

# Con API_URL dinámica
docker run -d \
  --name hotel-frontend \
  -p 80:80 \
  -e API_URL=http://api-gateway:8080 \
  hotel-frontend:latest

# Verificar
curl http://localhost/health

# Logs
docker logs -f hotel-frontend
```

---

## Kubernetes

### Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hotel-frontend
  namespace: hotel-system
  labels:
    app: hotel-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hotel-frontend
  template:
    metadata:
      labels:
        app: hotel-frontend
    spec:
      containers:
        - name: hotel-frontend
          image: ${ACR_NAME}.azurecr.io/hotel-frontend:latest
          ports:
            - containerPort: 80
          env:
            - name: API_URL
              value: "http://api-gateway:8080"
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: hotel-frontend
  namespace: hotel-system
spec:
  type: ClusterIP
  selector:
    app: hotel-frontend
  ports:
    - port: 80
      targetPort: 80
      name: http
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hotel-frontend-ingress
  namespace: hotel-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - tu-dominio.com
        - www.tu-dominio.com
      secretName: frontend-tls
  rules:
    - host: tu-dominio.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hotel-frontend
                port:
                  number: 80
    - host: www.tu-dominio.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hotel-frontend
                port:
                  number: 80
```

### ConfigMap para Nginx

```yaml
# k8s/configmap-nginx.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: hotel-system
data:
  nginx.conf: |
    events {
        worker_connections 1024;
    }
    http {
        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        gzip on;
        gzip_types text/plain text/css application/json application/javascript;

        server {
            listen 80;
            root /usr/share/nginx/html;
            index index.html;

            location / {
                try_files $uri $uri/ /index.html;
            }

            location /health {
                return 200 "healthy\n";
            }
        }
    }
```

### HorizontalPodAutoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hotel-frontend-hpa
  namespace: hotel-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hotel-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Comandos Kubernetes

```bash
# Aplicar manifiestos
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verificar
kubectl get pods -n hotel-system -l app=hotel-frontend
kubectl get svc -n hotel-system hotel-frontend
kubectl get ingress -n hotel-system

# Ver logs
kubectl logs -f deployment/hotel-frontend -n hotel-system

# Port-forward para testing
kubectl port-forward svc/hotel-frontend 8080:80 -n hotel-system
```

---

## Azure

### 1. Variables de Entorno

```bash
export RESOURCE_GROUP="rg-hotel-reservas"
export LOCATION="eastus"
export ACR_NAME="acrhotelreservas"
export AKS_CLUSTER="aks-hotel-reservas"
export STORAGE_ACCOUNT="sthotelreservas"
```

### 2. Construir y Subir a ACR

```bash
# Login en ACR
az acr login --name $ACR_NAME

# Build en ACR
az acr build \
  --registry $ACR_NAME \
  --image hotel-frontend:v1.0.0 \
  --image hotel-frontend:latest \
  --file Dockerfile \
  .

# Verificar
az acr repository show-tags \
  --name $ACR_NAME \
  --repository hotel-frontend \
  --output table
```

### 3. Azure Static Web Apps (Alternativa Recomendada)

```bash
# Crear Static Web App
az staticwebapp create \
  --name swa-hotel-frontend \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source https://github.com/tu-usuario/dawi-frontend \
  --branch main \
  --app-location "/dawi_frontend" \
  --output-location "dist/dawi_frontend/browser" \
  --login-with-github

# Configurar variables de entorno
az staticwebapp appsettings set \
  --name swa-hotel-frontend \
  --resource-group $RESOURCE_GROUP \
  --setting-names "API_URL=https://api.tu-dominio.com"
```

### 4. Azure Blob Storage + CDN (Hosting Estático)

```bash
# Crear Storage Account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2

# Habilitar hosting estático
az storage blob service-properties update \
  --account-name $STORAGE_ACCOUNT \
  --static-website \
  --index-document index.html \
  --404-document index.html

# Build local
cd dawi_frontend
npm run build -- --configuration=production

# Subir archivos
az storage blob upload-batch \
  --account-name $STORAGE_ACCOUNT \
  --source dist/dawi_frontend/browser \
  --destination '$web' \
  --overwrite

# Obtener URL
az storage account show \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query "primaryEndpoints.web" -o tsv

# Crear CDN Profile
az cdn profile create \
  --name cdn-hotel-frontend \
  --resource-group $RESOURCE_GROUP \
  --sku Standard_Microsoft

# Crear CDN Endpoint
az cdn endpoint create \
  --name hotel-frontend \
  --profile-name cdn-hotel-frontend \
  --resource-group $RESOURCE_GROUP \
  --origin $(az storage account show --name $STORAGE_ACCOUNT --query "primaryEndpoints.web" -o tsv | sed 's/https:\/\///' | sed 's/\/$//') \
  --origin-host-header $(az storage account show --name $STORAGE_ACCOUNT --query "primaryEndpoints.web" -o tsv | sed 's/https:\/\///' | sed 's/\/$//')
```

### 5. Deployment en AKS

```yaml
# k8s/azure-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hotel-frontend
  namespace: hotel-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hotel-frontend
  template:
    metadata:
      labels:
        app: hotel-frontend
    spec:
      containers:
        - name: hotel-frontend
          image: acrhotelreservas.azurecr.io/hotel-frontend:v1.0.0
          ports:
            - containerPort: 80
          env:
            - name: API_URL
              value: "http://api-gateway:8080"
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 6. Azure DevOps Pipeline

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - dawi_frontend/**

variables:
  dockerRegistryServiceConnection: 'acr-connection'
  imageRepository: 'hotel-frontend'
  containerRegistry: 'acrhotelreservas.azurecr.io'
  dockerfilePath: 'Dockerfile'
  tag: '$(Build.BuildId)'
  nodeVersion: '20.x'

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    displayName: 'Build and Push'
    jobs:
      - job: Build
        steps:
          - task: NodeTool@0
            displayName: 'Install Node.js'
            inputs:
              versionSpec: $(nodeVersion)

          - script: |
              cd dawi_frontend
              npm ci
              npm run build -- --configuration=production
            displayName: 'npm install and build'

          - task: Docker@2
            displayName: 'Build and Push Image'
            inputs:
              command: buildAndPush
              repository: $(imageRepository)
              dockerfile: $(dockerfilePath)
              containerRegistry: $(dockerRegistryServiceConnection)
              tags: |
                $(tag)
                latest

  - stage: Deploy
    displayName: 'Deploy to AKS'
    dependsOn: Build
    jobs:
      - deployment: Deploy
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: KubernetesManifest@0
                  displayName: 'Deploy to Kubernetes'
                  inputs:
                    action: deploy
                    kubernetesServiceConnection: 'aks-connection'
                    namespace: hotel-system
                    manifests: |
                      k8s/deployment.yaml
                      k8s/service.yaml
                      k8s/ingress.yaml
                    containers: |
                      $(containerRegistry)/$(imageRepository):$(tag)
```

### 7. GitHub Actions (Alternativa)

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'dawi_frontend/**'

env:
  ACR_NAME: acrhotelreservas
  IMAGE_NAME: hotel-frontend

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: dawi_frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd dawi_frontend
          npm ci

      - name: Build
        run: |
          cd dawi_frontend
          npm run build -- --configuration=production

      - name: Login to ACR
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.ACR_NAME }}.azurecr.io
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build and push Docker image
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }} .
          docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Deploy to AKS
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
          images: |
            ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
          namespace: hotel-system
```

---

## Arquitectura Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CDN / Load Balancer                            │
│              (Azure CDN / NGINX Ingress)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ANGULAR APP (SPA)                              │
│                     Nginx Container                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    MÓDULOS                                   ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  ││
│  │  │   AUTH   │  │   HOME   │  │         ADMIN            │  ││
│  │  │  Login   │  │  Portal  │  │  Dashboard, CRUD Hotels  │  ││
│  │  │ Register │  │  Cliente │  │  Departamentos, Reservas │  ││
│  │  └──────────┘  └──────────┘  └──────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   SERVICIOS                                  ││
│  │  AuthService | HotelService | ReservaService | etc.         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 HTTP INTERCEPTOR                             ││
│  │              (JWT Token Injection)                           ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (:8080)                           │
│                  Spring Cloud Gateway                            │
└─────────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐    ┌──────────┐    ┌───────────┐
      │  Auth   │    │  Hotel   │    │  Reserva  │
      │ Service │    │ Service  │    │  Service  │
      └─────────┘    └──────────┘    └───────────┘
```

---

## Troubleshooting

### Errores comunes

**1. CORS errors en desarrollo**
```bash
# Verificar que el API Gateway tenga CORS configurado para localhost:4200
curl -I -X OPTIONS http://localhost:8080/api/v1/hoteles \
  -H "Origin: http://localhost:4200"
```

**2. 404 en rutas de Angular (producción)**
```nginx
# Verificar que nginx tenga configurado:
location / {
    try_files $uri $uri/ /index.html;
}
```

**3. Variables de entorno no se aplican**
```bash
# Verificar que el script docker-entrypoint.sh tenga permisos
chmod +x docker-entrypoint.sh

# Verificar que API_URL esté definida
docker exec hotel-frontend env | grep API_URL
```

**4. Build falla por memoria**
```bash
# Aumentar memoria de Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Verificar build

```bash
# Local
cd dawi_frontend
npm run build -- --configuration=production
ls -la dist/dawi_frontend/browser/

# En contenedor
docker exec hotel-frontend ls -la /usr/share/nginx/html/
```

---

## Ejecución Local

```bash
# Instalar dependencias
cd dawi_frontend
npm install

# Desarrollo
npm start
# Abre http://localhost:4200

# Build producción
npm run build -- --configuration=production

# Servir build local
npx serve dist/dawi_frontend/browser -l 4200

# Tests
npm test
```

---

## Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| start | `ng serve` | Servidor de desarrollo |
| build | `ng build` | Build de producción |
| watch | `ng build --watch` | Build con watch |
| test | `ng test` | Ejecutar tests |

---

## Dependencias Principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| @angular/core | 20.3.0 | Framework principal |
| @angular/router | 20.3.0 | Enrutamiento SPA |
| tailwindcss | 4.1.17 | Framework CSS |
| chart.js | 4.4.1 | Gráficos dashboard |
| jspdf | 2.5.2 | Generación PDFs |
| rxjs | 7.8.0 | Programación reactiva |
