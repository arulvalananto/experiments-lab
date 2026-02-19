# Run docker

```bash
docker run -d \
  --name elastic \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "ELASTIC_PASSWORD=mySecretPassword" \
  -e "xpack.security.http.ssl.enabled=false" \
  elasticsearch:9.3.0
```
