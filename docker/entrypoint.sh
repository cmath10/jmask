#!/usr/bin/env bash
set -e

if [[ -z "${UID}" ]]; then
    echo "UID environment variable is required"
    exit 1
fi

if [[ -z "${GID}" ]]; then
    echo "GID environment variable is required"
    exit 1
fi

#TODO: check is GID & UID change is necessary

groupmod -g ${GID} hostuser
usermod -u ${UID} hostuser  > /dev/null 2>&1

exec runuser -u hostuser "$@"