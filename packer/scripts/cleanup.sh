#!/bin/bash
set -e

which git || echo 'Git is not installed'
sudo apt-get remove -y git
which git || echo 'Git is not installed'