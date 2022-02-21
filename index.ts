import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";

// Look up AMI based on SSM Parameter name
const ami = pulumi.output(aws.ssm.getParameter({ name: "/aws/service/ami-windows-latest/Windows_Server-2019-English-Full-Base" }));

// Create Key Pair
const keyPairName = "windows-machine-key-pair";
const tlsKey = new tls.PrivateKey("tls-key", {
  algorithm: "RSA"
});
const keyPair = new aws.ec2.KeyPair(keyPairName, {
  publicKey: tlsKey.publicKeyOpenssh,
  keyName: keyPairName
});

// Create EC2 Instance
const ec2Instance = new aws.ec2.Instance("windows-machine", {
  ami: ami.value,
  instanceType: "t3.large",
  keyName: keyPairName
});

// Output machine IP address
export const ipAddress = ec2Instance.publicIp;
// Output key pair
export const privateKey = tlsKey.privateKeyPem;
export const publicKey = tlsKey.privateKeyPem;
