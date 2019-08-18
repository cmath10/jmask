#!/usr/bin/env bash

RUNNING_CONTAINER_ID="$(docker ps -qf "name=jmask_node")"

if [[ -z "${RUNNING_CONTAINER_ID}" ]]
then
    export uid=$(id -u)
    export gid=$(id -g)
    export port_node=4280
    export port_karma=4276

    docker-compose run --rm --service-ports node bash
else
    echo "Connecting to container ${RUNNING_CONTAINER_ID}..."
    docker exec -it --user hostuser ${RUNNING_CONTAINER_ID} bash
fi