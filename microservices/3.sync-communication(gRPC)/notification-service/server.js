import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync('../protos/notification.proto');
const proto = grpc.loadPackageDefinition(packageDef).notification;

function sendNotification(call, callback) {
    const { orderId, userId } = call.request;

    console.log(`Sending notification for order ${orderId} to user ${userId}`);

    callback(null, { status: 'sent' });
}

const server = new grpc.Server();
server.addService(proto.NotificationService.service, { sendNotification });

server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log('Notification gRPC server running on 50051');
    },
);
