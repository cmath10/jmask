#!/bin/bash

export uid=$(id -u)
export gid=$(id -g)
export port_node=4280
export port_karma=4276

docker-compose run --service-ports node bash