#!/bin/bash

set -o pipefail

function err () {
    echo "upgrade-bash: $*"
    exit 1
}

if ! uname -a; then
    err "failed to run uname"
fi
if ! git --version; then
    err "faile to run git --version"
fi
if ! mkdir -p /etc/apt/sources.list.d; then
    ls -al /etc/apt
    err "failed to create sources list directory"
fi
if ! echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list.d/backports.list; then
    ls -al /etc/apt/sources.list.d
    err "failed to create backport sources list"
fi
if ! apt-get update; then
    err "failed to run apt-get update"
fi
if ! apt-get -t jessie-backports install git; then
    err "failed to upgrade git"
fi
if ! git --version; then
    err "faile to run git --version a second time"
fi
