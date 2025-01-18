---
layout: post
author: Nikil Shyamsunder
categories: ['ROS']
logo: bsd_daemon.png
title: Running ROS on Startup
---

<link rel="stylesheet" href="{{site.baseurl}}/css/code_styles/hybrid.css">
<script src="{{site.baseurl}}/js/highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>

## Automating ROS on Startup

When launching the boat, we aim to power up the mini PC and have ROS and all associated services running immediately. This setup eliminates the need for manual intervention, allowing seamless communication with the system solely through the webserver. To achieve this, we use **systemd** in conjunction with shell scripts.

### What is systemd?

Systemd is an init system and service manager widely used in Linux distributions. It allows you to define and manage services that start automatically at boot, restart on failure, and execute tasks in a specific order. For our purposes, systemd ensures that ROS, NGROK, and other essential services start reliably whenever the mini PC boots up.


### Managing the `ros_startup.service` File

The `ros_startup.service` file is a systemd service definition file. It is typically located in the `/etc/systemd/system/` directory. This is where custom service files are stored to be recognized by systemd. Systemd uses these files to understand how to manage and control the services on the system.

A **service** in systemd is a unit of configuration that defines how a specific process should be started, stopped, restarted, and managed. Services can be background processes (daemons) like ROS nodes or any script that needs to be run at specific times (e.g., on system startup).

Below is the `systemd` service configuration we use to manage the startup process:

<pre>
<code class="shell">
[Unit]
Description=ROS Startup Script
After=network.target

[Service]
ExecStart=/home/cusail/sailbot/sys/startup.sh
User=cusail
Restart=always

[Install]
WantedBy=multi-user.target
</code>
</pre>

### Refreshing systemd to Recognize New Services

Whenever you create or modify a service file, you need to refresh the systemd daemon so it recognizes the changes. To do this, use the following command:

<pre>
<code class="shell">
sudo systemctl daemon-reload
</code>
</pre>

### Enabling and Disabling the Service

Once the service file is in place and the daemon has been reloaded, you can enable the service so it starts automatically at boot:

<pre>
<code class="shell">
sudo systemctl enable ros_startup.service
</code>
</pre>

If you need to disable the service and prevent it from starting at boot, use:

<pre>
<code class="shell">
sudo systemctl disable ros_startup.service
</code>
</pre>

### Starting and Stopping the Service Manually

To start the service immediately without rebooting, run:

<pre>
<code class="shell">
sudo systemctl start ros_startup.service
</code>
</pre>

If you want to stop the service, use:

<pre>
<code class="shell">
sudo systemctl stop ros_startup.service
</code>
</pre>

### What Does the Shell Script Do?

The shell script located at `/home/cusail/sailbot/sys/startup.sh`, which is called by systemd based on the configuration we just made, handles the following:
1. Sets up the environment by sourcing the necessary ROS setup files.
2. Starts the ROS nodes and any required processes.
3. Launches NGROK to create a public tunnel for the `rosbridge` server on 9090.
4. Logs all output for debugging and monitoring purposes.

For more details, you can review the script in the GitHub repository.

### How do we access this from the webserver
You should see the tunnel on your ngrok account, and then input the tunnelling link into the webserver to connect to ROS.
