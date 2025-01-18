---
layout: post
author: Nikil Shyamsunder
categories: ['ROS']
logo: networking_icon.jpg
title: Webserver Networking
---

<link rel="stylesheet" href="{{site.baseurl}}/css/code_styles/hybrid.css">
<script src="{{site.baseurl}}/js/highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>

## Setting Up the Network Interface with QMI Mode

This page is focused on how the webserver networking works, assumign the cellular service is already set up on the system. To recreate our setup, we use parts similar to those mentioned in [Jeff Geerling's blog](https://www.jeffgeerling.com/blog/2022/using-4g-lte-wireless-modems-on-raspberry-pi). Simply follow the blog for configuring in QMI mode. This allows us to establish a network interface as `wwan0`.

### Bringing the connection up and down

To turn on and off the cellular connection, use 
<pre>
<code class="shell">
sudo ifup wwan0
sudo ifdown wwan0
</code>
</pre>

You will want to do this to make sure we only use cellular data when we absolutely need (in order to not rack up a bill).

## Webserver Architecture

For developers interested in deeper details, the architecture of the system is documented in [Communicating with ROS using roslibjs](https://cusail-navigation.github.io/intrasite/ros/roslibjs.html). However, the TLDR version is as follows: 

At the core of the system is a ROS node known as `rosbridge`, which operates as an HTTP server. This server is responsible for receiving requests and returning ROS data in a JSON format. The `rosbridge` node functions as a bridge between the web interface and the broader ROS ecosystem running on the autonomous sailboat. It provides a way to interact with ROS topics, services, and parameters through a structured and standardized protocol.

The second critical component is the webserver. This webserver also operates as an HTTP server and acts as an intermediary. It sends requests to the `rosbridge` server and processes the JSON responses to make the ROS data accessible and interpretable by users on the ground. While the `rosbridge` node runs onboard the sailboat alongside the rest of the ROS environment, the webserver is hosted separately on a ground-based system, ensuring a clear separation of roles and responsibilities in the architecture.

This division enables real-time communication and monitoring, where data from the sailboat's onboard ROS system is relayed through the `rosbridge` server to the ground-based webserver. From there, it can be accessed through the web interface, providing an intuitive and responsive way to interact with the sailboat's systems remotely.

## Network Tunneling

To make the `rosbridge` server accessible via a public IP and enable communication with the webserver, we use a technique called network tunneling. This approach is essential when the `rosbridge` server is running on a private network or behind a firewall, as it allows external clients, like the ground-based webserver, to access it through the public internet.

Network tunneling works by creating a secure and encrypted pathway between two systems over the internet. It effectively bypasses the restrictions of private networks by forwarding data between the local server (in this case, `rosbridge`) and a publicly accessible endpoint. This allows requests and responses to flow seamlessly between the ROS environment on the sailboat and the webserver.

For this purpose, we use the popular tunneling service **ngrok**. [Ngrok](https://www.sitepoint.com/use-ngrok-test-local-site/) simplifies the process of setting up a tunnel by dynamically creating a public URL that securely forwards traffic to the local server. To use ngrok with `rosbridge`, we run the service on the sailboat alongside ROS. Ngrok assigns a public URL to the local `rosbridge` server, allowing the webserver on the ground to access it without requiring any complex network configuration. This ensures that the ROS data can be accessed and visualized in real-time, even when the sailboat operates in remote or dynamic network environments.

## Running with NGROK

To enable communication between the `rosbridge` server and the webserver, we use NGROK to create a public tunnel. Here's how to set it up:

First, on the boat system running ROS, launch ROS with the `rosbridge` node. In the current sailbot configuration, `rosbridge` runs on port `9090`. Once ROS is active, you can set up the NGROK tunnel. Open a terminal on the same system and run the following command:

<pre>
<code class="shell">
ngrok http 9090
</code>
</pre>

This tells NGROK to create a tunnel for the HTTP server running on port `9090`. Once the tunnel is active, NGROK will display output similar to the example below:

![NGROK Example]({{ site.baseurl }}/images/ngrok-example.png "NGROK Output Example")

Pay attention to the line labeled **Forwarding: {public link} -> {local link}**. The `{public link}` is the NGROK-generated URL that acts as a public endpoint for the `rosbridge` server. This is the URL you will use to access the server from outside the local network.

Next, on your own ground-based machine, launch the webserver. The webserver requires the NGROK public link to communicate with `rosbridge`. Enter the NGROK-generated URL into the webserver's configuration or connect it directly. With this setup, the webserver can send requests to the `rosbridge` server on the sailboat, allowing real-time interaction with the ROS environment.

