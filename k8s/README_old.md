# Desafio 03

Iremos explicar neste README como realizar um setup para execução do projeto no kubernetes.

## Requisitos

As seguintes ferramentas devem estar instaladas no sistema:

- docker
- kind (https://kind.sigs.k8s.io) - para execução do cluster localmente
- kubectl (https://kubernetes.io/docs/tasks/tools)

## Setup

Caso vá utilizar um cluster numa cloud, pode pular direto para o passo de setup do [MongoDB](#Mongo-DB)

### Criar um cluster com o kind

Pode seguir o tutorial da ferramenta do [kind](https://kind.sigs.k8s.io).

Se tiver o GO (1.11+) e docker instalados execute o comando abaixo para instalar o kind e criar o cluster

```bash
GO111MODULE="on" go get sigs.k8s.io/kind@v0.10.0 && kind create cluster
```

### Mongo DB

Na nossa aplicação utilizamos o mongo DB como base de dados das rotas.
Você tem a opção de utilizar um mongo externo ou instalar um mongo db no seu cluster de kubernetes.

Para instalar o mongo em nosso cluster utilizamos o helm do [bitnami][helm-bitnami-mongodb].

Você pode seguir o tutorial do próprio helm [helm-bitnami-mongodb]. Mas simplificando, os passos serão os seguintes:

1. Instalar o mongodb

```bash
$ helm install mongodb bitnami/mongodb --set=auth.rootPassword="root",auth.database="nest",auth.username="root"
```

2. Acessar o container do mongo db

Ao instalar o helm, algumas instruções são exibidas na tela de comandos.

```bash
$ export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace default mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 --decode)

$ kubectl run --namespace default mongodb-client --rm --tty -i --restart='Never' --env="MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD" --image docker.io/bitnami/mongodb:4.4.5-debian-10-r0 --command -- bash
```

3. Conectar ao banco

```bash
$ mongo admin --host "mongodb" --authenticationDatabase admin -u root -p $MONGODB_ROOT_PASSWORD
```

4. Realizar inserção inicial dos dados

Este é um passo opcional, porém já traz um setup de informações/dados para testarmos nossa aplicação.

```
 use nest
```

```js
db.routes.insertMany([
  {
    _id: "1",
    title: "Primeiro",
    startPosition: { lat: -15.82594, lng: -47.92923 },
    endPosition: { lat: -15.82942, lng: -47.92765 },
  },
  {
    _id: "2",
    title: "Segundo",
    startPosition: { lat: -15.82449, lng: -47.92756 },
    endPosition: { lat: -15.8276, lng: -47.92621 },
  },
  {
    _id: "3",
    title: "Terceiro",
    startPosition: { lat: -15.82331, lng: -47.92588 },
    endPosition: { lat: -15.82758, lng: -47.92532 },
  },
  {
    _id: "4",
    title: "Quarto",
    startPosition: { lat: -22.82331, lng: -47.92588 },
    endPosition: { lat: -15.82758, lng: -44.92532 },
  },
  {
    _id: "5",
    title: "Quinto",
    startPosition: { lat: -15.82331, lng: -22.92588 },
    endPosition: { lat: -33.82758, lng: -99.92532 },
  },
]);
```

## Instalação da aplicação

### Backend

#### Ajustar configurações do k8s

Alterar a linha 7 do arquivo [configmap.yaml](backend/configmap.yaml) para corresponder à conexão do seu mongo db.
Ex: `MONGO_DSN=mongodb://root:root@mongodb/nest?authSource=admin`

#### Instalar backend no kubernetes

Após realizar as configurações, podemos instalar o backend no kubernetes

```bash
$ kubectl apply -f backend/configmap.yaml
$ kubectl apply -f backend/deploy.yaml
$ kubectl expose -f backend/deploy.yaml
```

#### Validação

Os comandos irão gerar elementos dentro do kubernetes, entre eles uma pod com o container e imagem do backend e um ClusterIP.

    $ kubectl get configmap

```console
NAME               DATA   AGE
backend-conf       1      55s
kube-root-ca.crt   1      19h
```

    $ kubectl get pods

```console
NAME                        READY   STATUS    RESTARTS   AGE
backend-6d5f948b76-2ns6t    1/1     Running   0          55s
mongodb-565c58b4c8-ftsv8    1/1     Running   0          1d1h
```

    $ kubectl get svc

```console
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)          AGE
backend            ClusterIP      10.96.76.54     <none>           3000/TCP        55s
kubernetes         ClusterIP      10.96.0.1       <none>           443/TCP          2d10h
mongodb            ClusterIP      10.96.127.184   <none>           27017/TCP        1d1h
```

Realizar o port-forward do container para poder acessar localmente.

kubectl port-forward service/backend 3000

Acessar `http://localhost:3000/routes`, substituindo o IP pelo gerado no servidor.
Este endereço deverá retornar um JSON com as rotas cadastradas no mongodb.

### Frontend

#### Instalar frontend no kubernetes

Após realizar as configurações, podemos instalar o frontend no kubernetes

```bash
$ kubectl apply -f frontend/deploy.yaml
$ kubectl expose -f frontend/deploy.yaml
```

#### Validação

Os 2 comandos irão gerar elementos dentro do kubernetes, entre eles uma pod com o container e imagem do frontend e um ClusterIP.

    $ kubectl get pods

```console
NAME                        READY   STATUS    RESTARTS   AGE
backend-6d5f948b76-2ns6t    1/1     Running   0          2h
frontend-69847d844d-2mbjb   1/1     Running   0          45s
mongodb-565c58b4c8-ftsv8    1/1     Running   0          1d3h
```

    $ kubectl get svc

```console
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)          AGE
backend            ClusterIP      10.96.76.54     <none>           3000/TCP        55s
frontend           ClusterIP      10.96.83.65     <none>           80/TCP        55s
kubernetes         ClusterIP      10.96.0.1       <none>           443/TCP          2d12h
mongodb            ClusterIP      10.96.127.184   <none>           27017/TCP        1d3h
```

Realizar o port-forward do container para poder acessar localmente.

kubectl port-forward service/frontend 3001:80

Acessar `http://localhost:3001`, substituindo o IP pelo gerado no servidor.
Este endereço deverá retornar a página com uma tabela das rotas.

![tela de rotas](doc/rotas_front.png)

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[lb-kind]: https://kind.sigs.k8s.io/docs/user/loadbalancer
[helm-bitnami-mongodb]: https://github.com/bitnami/charts/tree/master/bitnami/mongodb
