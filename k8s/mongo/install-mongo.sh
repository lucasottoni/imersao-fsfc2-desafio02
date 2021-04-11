helm install mongodb bitnami/mongodb --set=auth.rootPassword="root",auth.database="nest",auth.username="root"

export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace default mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 --decode)
kubectl run --namespace default mongodb-client --rm --tty -i --restart='Never' --env="MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD" --image docker.io/bitnami/mongodb:4.4.5-debian-10-r0 --command -- bash

#### run inside container
 mongo admin --host "mongodb" --authenticationDatabase admin -u root -p $MONGODB_ROOT_PASSWORD

#### run inside mongo
 use nest
 db.routes.insertMany([
  {
    _id: '1',
    title: 'Primeiro',
    startPosition: { lat: -15.82594, lng: -47.92923 },
    endPosition: { lat: -15.82942, lng: -47.92765 },
  },
  {
    _id: '2',
    title: 'Segundo',
    startPosition: { lat: -15.82449, lng: -47.92756 },
    endPosition: { lat: -15.8276, lng: -47.92621 },
  },
  {
    _id: '3',
    title: 'Terceiro',
    startPosition: { lat: -15.82331, lng: -47.92588 },
    endPosition: { lat: -15.82758, lng: -47.92532 },
  },
  {
    _id: '4',
    title: 'Quarto',
    startPosition: { lat: -22.82331, lng: -47.92588 },
    endPosition: { lat: -15.82758, lng: -44.92532 },
  },
  {
    _id: '5',
    title: 'Quinto',
    startPosition: { lat: -15.82331, lng: -22.92588 },
    endPosition: { lat: -33.82758, lng: -99.92532 },
  },
]);
