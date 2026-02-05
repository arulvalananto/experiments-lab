# Node.js App with Ingress, ConfigMap & HPA

This directory demonstrates a complete Kubernetes setup for a Node.js application with ConfigMap-based configuration, Ingress routing, and Horizontal Pod Autoscaling.

## Architecture Overview

- **Deployment**: Node.js Express app running on port 3000
- **Service**: ClusterIP service exposing the app internally
- **Ingress**: NGINX ingress controller for external HTTP access
- **ConfigMap**: Externalized environment configuration
- **HPA**: Automatic pod scaling based on CPU utilization

## Files

```table
| File | Purpose |
|------|---------|
| `deployment.yaml` | Defines the Node.js app deployment with ConfigMap injection |
| `service.yaml` | ClusterIP service for internal routing |
| `ingress.yaml` | NGINX ingress for external access at `node-app.local` |
| `configmap.yaml` | Environment variables (APP_ENV, MESSAGE) |
| `hpa.yaml` | Horizontal Pod Autoscaler (scales 1-5 replicas based on 50% CPU) |
| `server.js` | Express server with `/` and `/cpu` endpoints |
| `Dockerfile` | Container image definition |
| `package.json` | Node.js dependencies |
```

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t node-k8s-demo:latest .
```

### 2. Apply Kubernetes Manifests

```bash
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

Or apply all at once:

```bash
kubectl apply -f .
```

### 3. Configure Your Local `/etc/hosts` File

Add this entry to `/etc/hosts` to route local traffic to the ingress:

```bash
127.0.0.1 node-app.local
```

**Note**: On macOS, use `sudo nano /etc/hosts` to edit. Save with `Ctrl+X`, then `Y`, then `Enter`.

### 4. Access the Application

```bash
# Main endpoint
curl http://node-app.local/

# CPU burn endpoint (for testing HPA scaling)
curl http://node-app.local/cpu
```

## Configuration

### ConfigMap

Edit `configmap.yaml` to customize environment variables:

```yaml
data:
  APP_ENV: "production"      # Change to production/development
  MESSAGE: "Custom message"  # Displayed in response
```

Apply changes:

```bash
kubectl apply -f configmap.yaml
kubectl rollout restart deployment/node-app
```

### HPA Scaling

Modify `hpa.yaml` to adjust scaling behavior:

- **minReplicas**: 1 (minimum pods running)
- **maxReplicas**: 5 (maximum pods allowed)
- **averageUtilization**: 50 (scale up when CPU > 50%)

## Testing

### Monitor Pod Scaling

Open a terminal and watch pods:

```bash
kubectl get pods -w
```

### Trigger Scaling (CPU Burn)

In another terminal, repeatedly call the CPU endpoint:

```bash
# This will consume CPU and trigger autoscaling
for i in {1..10}; do curl http://node-app.local/cpu & done
```

Monitor HPA status:

```bash
kubectl get hpa node-app --watch
```

## Troubleshooting

### Ingress Not Working

**Issue**: `curl http://node-app.local/` returns connection refused

**Solution**: Verify `/etc/hosts` entry:

```bash
cat /etc/hosts | grep node-app.local
```

Should show:

```bash
127.0.0.1 node-app.local
```

### Pods Not Starting

```bash
# Check pod status
kubectl get pods

# View pod logs
kubectl logs -l app=node-app

# Describe pod for detailed errors
kubectl describe pod <pod-name>
```

### ConfigMap Changes Not Reflected

ConfigMap changes don't automatically update running pods. Restart the deployment:

```bash
kubectl rollout restart deployment/node-app
```

### HPA Not Scaling

1. Verify metrics-server is installed:

   ```bash
   kubectl get deployment metrics-server -n kube-system
   ```

2. Check HPA status:

   ```bash
   kubectl describe hpa node-app
   ```

3. Ensure resource requests are set in deployment (required for HPA to work)

## Cleanup

```bash
kubectl delete -f .
```

Or individual resources:

```bash
kubectl delete deployment node-app
kubectl delete service node-app-service
kubectl delete ingress node-app-ingress
kubectl delete configmap node-app-config
kubectl delete hpa node-app
```
