#!/bin/bash
set -e
set -x

#adding cloudwatch configuration
echo "CloudWatch Agent downloading..."
cd /tmp
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

echo "Cloudwatch agent downloaded successfully!!"

# Configure CloudWatch Agent
log "Configuring CloudWatch agent..."
cat > /tmp/cloudwatch-config.json << 'EOL'
{
  "agent": {
    "metrics_collection_interval": 5,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/webapp.log",
            "log_group_name": "/webapp/logs",
            "log_stream_name": "{instance_id}-application",
            "timestamp_format": "%Y-%m-%d %H:%M:%S",
            "timezone": "UTC"
          },
          {
            "file_path": "/opt/app/app.log",
            "log_group_name": "/webapp/logs",
            "log_stream_name": "{instance_id}-winston",
            "timestamp_format": "%Y-%m-%d %H:%M:%S",
            "timezone": "UTC"
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "statsd": {
        "service_address": ":8125",
        "metrics_collection_interval": 5,
        "metrics_aggregation_interval": 5,
        "metrics_collected": {
          "api": {
            "metrics_collection_interval": 5,
            "metrics": [
              "calls",
              "timing"
            ]
          },
          "db": {
            "metrics_collection_interval": 5,
            "metrics": [
              "timing"
            ]
          },
          "s3": {
            "metrics_collection_interval": 5,
            "metrics": [
              "timing"
            ]
          }
        }
      }
    },
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}"
    }
  }
}
EOL

# Move config and start agent
log "Moving CloudWatch config and starting agent..."
sudo mv /tmp/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

rm -f amazon-cloudwatch-agent.deb