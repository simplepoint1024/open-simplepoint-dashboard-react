#!/usr/bin/bash
pnpm build:host
pnpm build:common
cp -r ./apps/simplepoint-host/dist/* /home/ymsl/IdeaProjects/open-simplepoint-dashboard/simplepoint-services/simplepoint-service-host/src/main/resources/static/
cp -r ./apps/simplepoint-common/dist/* /home/ymsl/IdeaProjects/open-simplepoint-dashboard/simplepoint-services/simplepoint-service-common/src/main/resources/static/