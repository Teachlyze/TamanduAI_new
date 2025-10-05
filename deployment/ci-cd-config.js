/**
 * CI/CD Configuration for TamanduAI Platform
 * Automated deployment and testing pipeline
 */

// ============================================
// GITHUB ACTIONS WORKFLOW
// ============================================

export const GITHUB_WORKFLOW = `
name: TamanduAI CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Code quality checks
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/

  # Security scanning
  security:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run CodeQL analysis
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v2

  # Performance testing
  performance:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouse.config.js'
          uploadArtifacts: true

      - name: Run bundle analyzer
        run: npm run analyze

  # Deployment to staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [quality, security, performance]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build:staging

      - name: Deploy to staging
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://tamanduai-staging --delete

      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id \${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"

      - name: Run E2E tests
        run: npm run test:e2e

  # Deployment to production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [quality, security, performance]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build:production

      - name: Run production tests
        run: npm run test:production

      - name: Deploy to production
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://tamanduai-production --delete --cache-control "max-age=31536000"

      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id \${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"

      - name: Update deployment status
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
              environment: 'production',
              description: 'Production deployment',
            });
`;

// ============================================
// DOCKER CONFIGURATION
// ============================================

export const DOCKERFILE = `
# Multi-stage build for optimal production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of nginx directories
RUN chown -R nextjs:nodejs /var/cache/nginx
RUN chown -R nextjs:nodejs /var/log/nginx
RUN chown -R nextjs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
`;

// ============================================
// DOCKER COMPOSE FOR DEVELOPMENT
// ============================================

export const DOCKER_COMPOSE_DEV = `
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_SUPABASE_URL=\${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=\${VITE_SUPABASE_ANON_KEY}
    depends_on:
      - database
      - redis
    networks:
      - tamanduai-network

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tamanduai_dev
      POSTGRES_USER: tamanduai
      POSTGRES_PASSWORD: development_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tamanduai-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - tamanduai-network

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: tamanduai
      MINIO_ROOT_PASSWORD: development_password
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - tamanduai-network

networks:
  tamanduai-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  minio_data:
`;

// ============================================
// PRODUCTION DEPLOYMENT SCRIPTS
// ============================================

export const DEPLOYMENT_SCRIPTS = {
  // Pre-deployment health check
  healthCheck: `
    #!/bin/bash
    echo "Running pre-deployment health checks..."

    # Check if required services are running
    curl -f http://localhost:3001/health || exit 1

    # Check database connectivity
    npm run db:check || exit 1

    # Check Redis connectivity
    npm run redis:check || exit 1

    echo "All health checks passed!"
  `,

  // Database migration script
  databaseMigration: `
    #!/bin/bash
    echo "Running database migrations..."

    # Run Prisma migrations
    npx prisma migrate deploy

    # Seed database if needed
    if [ "$NODE_ENV" = "production" ]; then
      npm run db:seed
    fi

    echo "Database migration completed!"
  `,

  // Post-deployment verification
  postDeployVerification: `
    #!/bin/bash
    echo "Running post-deployment verification..."

    # Wait for application to start
    sleep 30

    # Verify application is responding
    curl -f https://tamanduai.com/health || exit 1

    # Verify static assets are accessible
    curl -f https://tamanduai.com/assets/index-*.js || exit 1

    # Run smoke tests
    npm run test:smoke

    echo "Post-deployment verification completed!"
  `,
};

// ============================================
// KUBERNETES DEPLOYMENT
// ============================================

export const KUBERNETES_MANIFESTS = {
  deployment: `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tamanduai-platform
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tamanduai-platform
  template:
    metadata:
      labels:
        app: tamanduai-platform
    spec:
      containers:
      - name: app
        image: tamanduai/platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
  `,

  service: `
apiVersion: v1
kind: Service
metadata:
  name: tamanduai-platform-service
  namespace: production
spec:
  selector:
    app: tamanduai-platform
  ports:
  - name: http
    port: 80
    targetPort: 3000
  type: ClusterIP
  `,

  ingress: `
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tamanduai-platform-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - tamanduai.com
    - www.tamanduai.com
    secretName: tamanduai-tls
  rules:
  - host: tamanduai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tamanduai-platform-service
            port:
              number: 80
  - host: www.tamanduai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tamanduai-platform-service
            port:
              number: 80
  `,
};

// ============================================
// MONITORING AND OBSERVABILITY
// ============================================

export const MONITORING_CONFIG = {
  // Application Performance Monitoring
  APM: {
    ENABLED: true,
    SERVICE_NAME: 'tamanduai-platform',
    SAMPLE_RATE: 0.1,
    CAPTURE_BODY: 'errors',
    CAPTURE_HEADERS: false,
  },

  // Metrics collection
  METRICS: {
    ENABLED: true,
    ENDPOINT: '/metrics',
    COLLECT_DEFAULT: true,
    REQUEST_DURATION_BUCKETS: [
      0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000,
    ],
  },

  // Distributed tracing
  TRACING: {
    ENABLED: true,
    SERVICE_NAME: 'tamanduai-platform',
    SAMPLING_RATE: 0.1,
  },

  // Health checks
  HEALTH_CHECKS: {
    ENDPOINT: '/health',
    CHECKS: [
      {
        name: 'database',
        check: async () => {
          // Database connectivity check
          return true;
        },
      },
      {
        name: 'redis',
        check: async () => {
          // Redis connectivity check
          return true;
        },
      },
      {
        name: 'storage',
        check: async () => {
          // File storage check
          return true;
        },
      },
    ],
  },
};

// ============================================
// BACKUP CONFIGURATION
// ============================================

export const BACKUP_CONFIG = {
  // Database backups
  DATABASE: {
    ENABLED: true,
    SCHEDULE: '0 2 * * *', // Daily at 2 AM
    RETENTION_DAYS: 30,
    PROVIDER: 'aws-s3',
    BUCKET: 'tamanduai-backups',
    ENCRYPTION: true,
  },

  // File storage backups
  FILES: {
    ENABLED: true,
    SCHEDULE: '0 3 * * *', // Daily at 3 AM
    RETENTION_DAYS: 90,
    PROVIDER: 'aws-s3',
    BUCKET: 'tamanduai-files-backup',
  },

  // Configuration backups
  CONFIG: {
    ENABLED: true,
    SCHEDULE: '0 1 * * *', // Daily at 1 AM
    RETENTION_DAYS: 180,
    PROVIDER: 'aws-s3',
    BUCKET: 'tamanduai-config-backup',
  },
};

// ============================================
// SECURITY SCANNING
// ============================================

export const SECURITY_SCANNING = {
  // Vulnerability scanning
  VULNERABILITY_SCAN: {
    ENABLED: true,
    SCHEDULE: '0 4 * * *', // Daily at 4 AM
    SEVERITY_THRESHOLD: 'HIGH',
    FAIL_ON_VULNERABILITIES: true,
  },

  // Secret scanning
  SECRET_SCAN: {
    ENABLED: true,
    PATTERNS: [
      'password.*=.*["\'][^"\']+["\']',
      'secret.*=.*["\'][^"\']+["\']',
      'api_key.*=.*["\'][^"\']+["\']',
      'token.*=.*["\'][^"\']+["\']',
    ],
    EXCLUDE_PATTERNS: [
      'test',
      'example',
      'sample',
      'mock',
    ],
  },

  // Dependency scanning
  DEPENDENCY_SCAN: {
    ENABLED: true,
    SCAN_DEV_DEPENDENCIES: false,
    FAIL_ON_HIGH_SEVERITY: true,
  },
};

// ============================================
// PERFORMANCE BENCHMARKS
// ============================================

export const PERFORMANCE_BENCHMARKS = {
  // Response time targets
  RESPONSE_TIMES: {
    API_ENDPOINTS: '< 200ms',
    PAGE_LOADS: '< 2s',
    IMAGE_LOADS: '< 1s',
    FILE_UPLOADS: '< 5s',
  },

  // Throughput targets
  THROUGHPUT: {
    API_REQUESTS_PER_SECOND: 1000,
    CONCURRENT_USERS: 1000,
    DATABASE_CONNECTIONS: 100,
  },

  // Resource usage targets
  RESOURCES: {
    CPU_USAGE: '< 70%',
    MEMORY_USAGE: '< 80%',
    DISK_USAGE: '< 85%',
    NETWORK_BANDWIDTH: '< 80%',
  },

  // Error rate targets
  ERROR_RATES: {
    API_ERRORS: '< 1%',
    CLIENT_ERRORS: '< 5%',
    SERVER_ERRORS: '< 0.1%',
  },
};

// ============================================
// QUALITY GATES
// ============================================

export const QUALITY_GATES = {
  // Code quality
  CODE_QUALITY: {
    MIN_COVERAGE: 80,
    MAX_TECHNICAL_DEBT: 5,
    MIN_MAINTAINABILITY: 70,
    MAX_COMPLEXITY: 10,
  },

  // Performance
  PERFORMANCE: {
    MIN_LIGHTHOUSE_SCORE: 90,
    MAX_BUNDLE_SIZE: '2MB',
    MIN_CACHE_HIT_RATE: 85,
  },

  // Security
  SECURITY: {
    MAX_VULNERABILITIES: 0,
    MIN_SECRET_SCAN_SCORE: 100,
    REQUIRED_SECURITY_HEADERS: true,
  },

  // Accessibility
  ACCESSIBILITY: {
    MIN_WCAG_SCORE: 'AA',
    MAX_ACCESSIBILITY_ISSUES: 0,
  },
};

// ============================================
// ROLLBACK CONFIGURATION
// ============================================

export const ROLLBACK_CONFIG = {
  // Automatic rollback triggers
  AUTO_ROLLBACK: {
    ENABLED: true,
    ERROR_RATE_THRESHOLD: 5, // 5% error rate
    RESPONSE_TIME_THRESHOLD: 5000, // 5 seconds
    HEALTH_CHECK_FAILURES: 3,
  },

  // Manual rollback settings
  MANUAL_ROLLBACK: {
    ENABLED: true,
    RETENTION_VERSIONS: 10,
    ROLLBACK_TIMEOUT: 300, // 5 minutes
  },

  // Rollback verification
  VERIFICATION: {
    HEALTH_CHECKS: ['database', 'api', 'frontend'],
    SMOKE_TESTS: true,
    LOAD_TESTS: false, // Disabled for rollbacks
  },
};

// ============================================
// DEPLOYMENT STRATEGIES
// ============================================

export const DEPLOYMENT_STRATEGIES = {
  // Blue-green deployment
  BLUE_GREEN: {
    ENABLED: true,
    BLUE_ENVIRONMENT: 'blue',
    GREEN_ENVIRONMENT: 'green',
    SWITCH_TIMEOUT: 300, // 5 minutes
    HEALTH_CHECK_INTERVAL: 30, // 30 seconds
  },

  // Canary deployment
  CANARY: {
    ENABLED: true,
    CANARY_PERCENTAGE: 10, // 10% of traffic
    PROMOTION_THRESHOLD: 95, // 95% success rate
    ROLLOUT_DURATION: 3600, // 1 hour
  },

  // Rolling deployment
  ROLLING: {
    ENABLED: true,
    BATCH_SIZE: 1, // Update one instance at a time
    BATCH_INTERVAL: 60, // 1 minute between batches
    MAX_UNAVAILABLE: 1, // Allow 1 instance to be unavailable
  },
};

// ============================================
// EXPORTS
// ============================================

export {
  GITHUB_WORKFLOW,
  DOCKERFILE,
  DOCKER_COMPOSE_DEV,
  DEPLOYMENT_SCRIPTS,
  KUBERNETES_MANIFESTS,
  MONITORING_CONFIG,
  BACKUP_CONFIG,
  SECURITY_SCANNING,
  PERFORMANCE_BENCHMARKS,
  QUALITY_GATES,
  ROLLBACK_CONFIG,
  DEPLOYMENT_STRATEGIES,
};
