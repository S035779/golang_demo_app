#!/bin/sh
openssl req \
    -newkey rsa:2048 \
    -nodes \
    -new \
    -x509 \
    -sha256 \
    -days 3650 \
    -keyout goproxy-dev-key.pem \
    -out goproxy-dev-cert.pem
