#!/bin/bash

STAGE=dev

# Usage info
show_help() {
cat << EOF
Usage: ${0##*/} [-p]

By default, deploy to dev environment on AWS account 8126-4485-3088

	-p          PRODUCTION (1924-5899-3663)

EOF
}

while getopts "p" opt
do
	case $opt in
		p)
			echo "PRODUCTION" >&2
			STAGE=prod
			;;
		*)
			show_help >&2
			exit 1
			;;
	esac
done
AWS_PROFILE=lmb-$STAGE
shift "$((OPTIND-1))"   # Discard the options and sentinel --

if ! test -x /usr/local/bin/ecs-cli
then
	curl -o /usr/local/bin/ecs-cli https://s3.amazonaws.com/amazon-ecs-cli/ecs-cli-linux-amd64-latest && chmod +x /usr/local/bin/ecs-cli
fi

# /usr/local/bin/ecs-cli compose --aws-profile lmb-dev -p meteor -f docker-compose-meteor.yml service create --target-group-arn arn:aws:elasticloadbalancing:ap-southeast-1:812644853088:targetgroup/meteor/0617ca622a59e7e2 --container-name meteor --container-port 3000 --load-balancer-name meteor

ecs-cli configure --cluster master --region ap-southeast-1 --compose-service-name-prefix ecscompose-service-
test -f aws-env.$STAGE && source aws-env.$STAGE

envsubst < AWS-docker-compose-meteor.yml > docker-compose-meteor.yml

/usr/local/bin/ecs-cli compose --aws-profile $AWS_PROFILE -p meteor -f docker-compose-meteor.yml service up
