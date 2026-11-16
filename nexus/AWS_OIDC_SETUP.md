# NEXUS GitHub Actions → AWS OIDC bootstrap

The deployment workflow is **manual only**. It does not deploy from PRs, and a default `CHECK` run performs local tests only. A real run requires typing `LAUNCH`. This is not a production deployment.

## One-time AWS setup (requires authorized AWS admin access)
1. In AWS IAM (ap-south-1 resources), configure GitHub OIDC provider `token.actions.githubusercontent.com`, audience `sts.amazonaws.com` if absent. Do not create duplicate providers.
2. Create a dedicated IAM role whose trust policy restricts the OIDC token to repository `AAruup/searho7` and the **exact approved deployment branch/ref**. Example subject for deployment after merging to main: `repo:AAruup/searho7:ref:refs/heads/main`. Require `aud=sts.amazonaws.com`. Do not trust all GitHub repos, tags, or pull requests.
3. Grant only scoped ECR push, `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`, `ecs:RunTask`, `ecs:DescribeTasks`, and `iam:PassRole` for dedicated NEXUS task and execution roles. Limit ECS task-definition and cluster ARNs where supported, and `iam:PassedToService=ecs-tasks.amazonaws.com`. No IAM admin, secrets read, production ECS service changes, or broad production access.
4. Create dedicated ECR repository and **dedicated ECS cluster containing 'nexus' in its name**, a `nexus-*` Fargate task definition (single container), and `/ecs/nexus-*` CloudWatch log group. Container image must point at the dedicated ECR repository. Set `NEXUS_MAX_RUNS=1`, no app secrets, no database access, no public ingress, 0.25 vCPU / 0.5 GB RAM. Provide outbound HTTPS via appropriately configured NAT/VPC endpoints; workflow disables public IP.
5. In GitHub repository Actions variables, set `NEXUS_AWS_ROLE_ARN`, `NEXUS_ECR_REPO`, `NEXUS_ECS_CLUSTER`, `NEXUS_TASK_FAMILY`, `NEXUS_SUBNET_IDS` and `NEXUS_SECURITY_GROUP_IDS`. Use comma-separated IDs. No static AWS access keys.
6. Merge only after review. From the default branch, manually run **NEXUS manual isolated ECS launch** first with `CHECK`, then `LAUNCH`. Inspect the Actions log and CloudWatch event, verify billing and stop conditions.

## Safety and current status
The workflow cannot create its own AWS trust relationship or AWS resources. Those require an existing authorized AWS execution route. No AWS deployment has occurred. Keep production cluster, service, load balancer and task roles untouched. A successful ECS run only establishes a read-only monitor, not an autonomous decision-making agent.
