import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Look up AMI based on SSM Parameter name
const ami = pulumi.output(aws.ssm.getParameter({ name: "/aws/service/ami-windows-latest/Windows_Server-2019-English-Full-Base" }));

// Create EC2 Instance
const ec2Instance = new aws.ec2.Instance("windows-machine", {
  ami: ami.value,
  instanceType: "t3.large"
});

// output machine ip address
export const ipAddress = ec2Instance.publicIp;