# NEXUS v0.2 — isolated monitor (first deployable slice)

This is **not** a fully autonomous CEO agent. It is a safe, verifiable first component: a bounded read-only HTTPS availability monitor for Sea.rho7. No production code is changed.

## Test
```bash
cd nexus
python3 agent.py
docker build -t nexus-monitor:v0.2 .
docker run --rm -e NEXUS_MAX_RUNS=1 nexus-monitor:v0.2
```

## ECS Fargate isolated test
- Use an **independent task definition**, no ECS service, load balancer or public ingress.
- Run one task in ap-south-1 with 0.25 vCPU and 0.5 GB memory, appropriate VPC outbound HTTPS, and a dedicated least-privilege execution role.
- CloudWatch Logs: separate log group `/ecs/nexus-test`; verify JSON events and HTTP status.
- Configure `NEXUS_MAX_RUNS=1` for first test; then stop the task if it remains running.
- Verify VPC/NAT, image pull, logging and Fargate charges before launch.
- Do **not** grant AWS write permissions, Instagram credentials, secrets or production database access.
- Do **not** merge this branch or update existing Sea.rho7 production services without a separate review.

## Next stage
Add scoped telemetry ingestion, decision recommendations and audited actions only after a verified sandbox test. All changes to production require a controlled approval path.
