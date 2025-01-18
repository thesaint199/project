import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class HelloWorldProjectStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc');

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
    });

    const db = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      databaseName: 'hello_db',
    });

    const fargateTask = new ecs.FargateTaskDefinition(this, 'TaskDef');
    fargateTask.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromRegistry('hello-world-app'),
      environment: {
        DB_HOST: db.instanceEndpoint.hostname,
        DB_USER: 'postgres',
        DB_PASSWORD: db.secret?.secretValueFromJson('password')?.toString() || '',
        DB_NAME: 'hello_db',
      },
    });

    new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition: fargateTask,
    });
  }
}
