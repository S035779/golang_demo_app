#!/bin/bash

latest=$(docker images | grep latest | awk -F" " '{ print $3 }')
echo ${latest}

if [ "${latest}" != "" ]; then
  echo "deleted latest images..."
  docker rmi ${latest} -f
fi

docker system prune
docker volume prune

docker images
echo
docker system df
