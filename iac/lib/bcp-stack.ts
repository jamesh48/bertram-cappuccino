import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface BCPStackProps extends cdk.StackProps {
  aws_env: {
    AWS_DEFAULT_SG: string;
    AWS_CLUSTER_ARN: string;
    AWS_VPC_ID: string;
    AWS_ALB_LISTENER_ARN: string;
  };
  svc_env: {};
}

export class BCPStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BCPStackProps) {
    super(scope, id, props);

    const bcpFargateService = new ecs.FargateService(this, 'bcp-service', {
      assignPublicIp: true,
      desiredCount: 1,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      taskDefinition: new ecs.FargateTaskDefinition(
        this,
        'bcp-task-definition',
        {
          taskRole: iam.Role.fromRoleName(
            this,
            'jh-ecs-task-definition-role',
            'jh-ecs-task-definition-role'
          ),
          executionRole: iam.Role.fromRoleName(
            this,
            'jh-ecs-task-execution-role',
            'jh-ecs-task-execution-role'
          ),
        }
      ),
      cluster: ecs.Cluster.fromClusterAttributes(this, 'jh-imported-cluster', {
        securityGroups: [
          ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'imported-default-sg',
            props.aws_env.AWS_DEFAULT_SG
          ),
        ],
        clusterName: 'jh-e1-ecs-cluster',
        clusterArn: props.aws_env.AWS_CLUSTER_ARN,
        vpc: ec2.Vpc.fromLookup(this, 'jh-imported-vpc', {
          vpcId: props.aws_env.AWS_VPC_ID,
        }),
      }),
      enableExecuteCommand: true,
    });

    const container = bcpFargateService.taskDefinition.addContainer(
      'bcp-container',
      {
        image: ecs.ContainerImage.fromAsset('../'),
        logging: new ecs.AwsLogDriver({
          streamPrefix: 'bcp-container',
          logRetention: logs.RetentionDays.FIVE_DAYS,
        }),
        environment: {
          ...props.svc_env,
        },
      }
    );

    container.addPortMappings({
      containerPort: 3000,
      hostPort: 3000,
    });

    const importedALBListener = elbv2.ApplicationListener.fromLookup(
      this,
      'imported-https-listener',
      {
        listenerArn: props.aws_env.AWS_ALB_LISTENER_ARN,
      }
    );

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'bcp-tg', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [bcpFargateService],
      vpc: ec2.Vpc.fromLookup(this, 'jh-imported-vpc-tg', {
        vpcId: props.aws_env.AWS_VPC_ID,
      }),
      healthCheck: {
        path: '/api/healthcheck',
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200',
        healthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
        port: '3000',
        timeout: cdk.Duration.seconds(10),
      },
    });

    importedALBListener.addTargetGroups('bcp-listener-tg', {
      targetGroups: [targetGroup],
      priority: 65,
      conditions: [
        elbv2.ListenerCondition.hostHeaders([
          'www.bertramcappuccino.com',
          'bertramcappuccino.com',
        ]),
      ],
    });
  }
}
