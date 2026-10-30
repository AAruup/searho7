# Sea.rho7 Agentic Runtime on AWS (Mumbai)

## Decision

Run the proactive agent as a separate ECS Fargate service in ap-south-1. Do not deploy it as Firebase Functions and do not share the live Sea.rho7 task lifecycle. The existing user-facing service and load balancer remain unchanged.

This is the target architecture, not a deployment manifest or authorization to change the live AWS account.

## Target topology

Sea.rho7 existing ECS service
  -> authenticated, scoped internal agent API
  -> new private ECS Fargate agent API/orchestrator
  -> DynamoDB for goals, run state, checkpoints and audit events

EventBridge Scheduler -> SQS -> separate ECS Fargate agent worker
Agent worker -> model provider through server-side Secrets Manager credentials
Agent worker -> allow-listed capability adapters with approval gates

CloudWatch receives structured logs, metrics and alarms. IAM task roles grant least-privilege access separately to API and worker.

## AWS resources in ap-south-1

1. ECS service searho7-agent-api: independent task definition, deployment circuit breaker, health check and autoscaling. Private subnets, no public IP. Reachable only through an explicitly configured internal route/API integration. Separate CPU and memory limits from the live Sea.rho7 service.
2. ECS worker searho7-agent-worker: consumes SQS jobs, performs one bounded run at a time, writes checkpoints and acknowledges only after durable completion. Scale from queue depth and enforce per-user/global concurrency limits.
3. EventBridge Scheduler: dispatches due-goal wakeups to SQS. Scheduler does not run model reasoning. Use idempotency keys and jitter.
4. SQS: work queue plus dead-letter queue, bounded visibility timeout, retry policy and redrive controls.
5. DynamoDB: goals, execution leases/checkpoints and append-only audit events. Use conditional writes, version checks and idempotency. Apply TTL only to explicitly temporary records.
6. Secrets Manager and IAM: model credentials stay server-side. Separate task roles for API and worker. No static AWS keys in images, environment files or frontend bundles. Restrict permissions to exact resources/actions.
7. CloudWatch: structured logs with correlation IDs; queue age/depth, run duration, retries, estimated model cost, approval backlog and failure metrics. Alarm on DLQ messages, repeated task crashes, high queue age and abnormal spend.

## Safety model

- The agent may autonomously plan, research through explicitly enabled adapters, draft, summarize and update its own goal state.
- Every capability is registered server-side with a schema, timeout, budget and permission scope.
- Sending messages, publishing, purchases/payments, deleting user data, changing production infrastructure, merging code and other irreversible or externally visible actions require fresh, action-specific approval.
- Approval is bound to the exact action payload, target, amount/content and expiry. A material change invalidates approval.
- A global kill switch stops new runs. Per-goal pause/stop is checked before every tool call.
- Tool calls and approvals are audited. Model output is untrusted input and cannot grant itself permissions.
- No arbitrary shell, unrestricted browser, arbitrary AWS API or unrestricted network access in the initial release.

## Integration boundary

Integrate with the existing Sea.rho7 server through a narrowly scoped authenticated internal API. Do not assume Firebase Authentication or Firestore is the source of truth for the AWS agent. Before implementing identity, inspect the live app's actual sign-in/session mechanism and map verified identity to a stable internal user ID. Never trust a user ID supplied only in the request body.

The existing app UI should call the agent API through the established backend session, not directly call DynamoDB, SQS or model providers.

## Delivery sequence

1. Read-only inspection of current ECS service, task definition, VPC/subnets, security groups, ALB listeners, ECR image, IAM roles, secrets and deployment pipeline.
2. Confirm the app authentication/session contract and container build/release process.
3. Add isolated agent API and worker infrastructure in a staging AWS environment in ap-south-1.
4. Implement goal storage, scheduler-to-queue flow, bounded worker, audit trail and kill switch.
5. Add one harmless capability first, such as producing a research brief saved as an agent artifact.
6. Test security, concurrency, retries, cost limits, pause/stop and failure recovery.
7. Only after explicit owner approval, plan production rollout. Do not modify or replace the existing Sea.rho7 ECS service.

## Current branch caveat

The earlier Firebase Functions/Firestore implementation on this branch was based on an incorrect infrastructure assumption. Treat it as a prototype only: do not merge or deploy it. The AWS implementation must replace that approach, not layer a second backend on top of it.
