import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";

// Stack name
const name = "ubuntu-migration-server";

// Look up AMI based on SSM Parameter name
const ami = pulumi.output(aws.ssm.getParameter({ name: "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2" }));

// Create Key Pair
const keyPairName = `${name}-key-pair`;
const tlsKey = new tls.PrivateKey(name, {
  algorithm: "RSA"
});
const publicKey = tlsKey.publicKeyOpenssh;
const keyPair = new aws.ec2.KeyPair(keyPairName, {
  publicKey: publicKey,
  keyName: keyPairName
});

// Create IAM role and attach policies (SSM related)
const assumeRolePolicy: aws.iam.PolicyDocument = {
  Version: "2012-10-17",
  Statement: [{
    Action: ["sts:AssumeRole"],
    Effect: "Allow",
    Principal: { Service: "ec2.amazonaws.com" }
  }],
};
const iamRole = new aws.iam.Role(name, {
  assumeRolePolicy: assumeRolePolicy
});
new aws.iam.RolePolicyAttachment(name, {
  role: iamRole,
  policyArn: aws.iam.ManagedPolicy.AmazonSSMManagedInstanceCore
});
// Create instance profile from the role
const iamInstanceProfile = new aws.iam.InstanceProfile(name, {
  role: iamRole
});

// Create EC2 Instance
const ec2Instance = new aws.ec2.Instance(name, {
  ami: ami.value,
  instanceType: "t3.large",
  keyName: keyPairName,
  iamInstanceProfile: iamInstanceProfile
});

// Output machine IP address
export const ipAddress = ec2Instance.publicIp;
// Output private key
export const privateKey = pulumi.unsecret(tlsKey.privateKeyPem);
