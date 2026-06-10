import { SNSClient, PublishCommand, SubscribeCommand, CreateTopicCommand } from "@aws-sdk/client-sns";

let client;

function getSNSClient() {
  if (client) return client;

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing AWS SNS configuration. Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.local"
    );
  }

  client = new SNSClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

export async function getOrCreateTopic(topicName) {
  const sns = getSNSClient();
  const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: topicName }));
  return TopicArn;
}

export async function subscribeEmail(topicArn, email) {
  const sns = getSNSClient();
  const { SubscriptionArn } = await sns.send(
    new SubscribeCommand({ TopicArn: topicArn, Protocol: "email", Endpoint: email })
  );
  return SubscriptionArn;
}

export async function subscribeSMS(topicArn, phoneNumber) {
  const sns = getSNSClient();
  const { SubscriptionArn } = await sns.send(
    new SubscribeCommand({ TopicArn: topicArn, Protocol: "sms", Endpoint: phoneNumber })
  );
  return SubscriptionArn;
}

export async function publishMessage(topicArn, subject, message) {
  const sns = getSNSClient();
  const { MessageId } = await sns.send(
    new PublishCommand({ TopicArn: topicArn, Subject: subject, Message: message })
  );
  return MessageId;
}

export async function publishSMS(phoneNumber, message) {
  const sns = getSNSClient();
  const { MessageId } = await sns.send(
    new PublishCommand({ PhoneNumber: phoneNumber, Message: message })
  );
  return MessageId;
}

export default getSNSClient;
