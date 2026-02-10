// order-service/client.js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync('../protos/notification.proto');
const proto = grpc.loadPackageDefinition(packageDef).notification;

const client = new proto.NotificationService(
    'localhost:50051',
    grpc.credentials.createInsecure(),
);

export function sendNotification(orderId, userId) {
    return new Promise((resolve, reject) => {
        client.SendNotification({ orderId, userId }, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}
