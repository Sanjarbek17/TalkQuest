#!/usr/bin/env bash
# TalkQuest manual deploy: pull latest main and rebuild. Run by hand after pushing.
#   ssh school "~/dev/TalkQuest/deploy.sh"
set -euo pipefail
cd /home/bhgroup/dev/TalkQuest
git fetch origin main
git reset --hard origin/main
docker compose build            # if build fails, set -e stops here and the running stack is untouched
docker compose up -d
docker image prune -f
echo "$(date -Is) deploy complete"
