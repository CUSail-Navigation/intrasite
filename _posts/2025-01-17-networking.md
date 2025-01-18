---
layout: post
author: Nikil Shyamsunder
categories: ['ROS']
logo: networking_icon.png
title: Webserver Networking
---

<link rel="stylesheet" href="{{site.baseurl}}/css/code_styles/hybrid.css">
<script src="{{site.baseurl}}/js/highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>

## Setup Network Interface with QMI Mode

To set up a Raspberry Pi for webserver networking, we use parts similar to those mentioned in [Jeff Geerling's blog](https://www.jeffgeerling.com/blog/2022/using-4g-lte-wireless-modems-on-raspberry-pi), along with a 4G LTE wireless modem configured in QMI mode. This allows us to establish a network interface as `wwan0`.

### Enabling QMI Mode and Configuring the Interface

1. **Connect the 4G LTE Modem**  
   Insert the modem into the Raspberry Pi and ensure it is detected. You can confirm the modem's presence with the following command:
   <pre>
   <code class="shell">
   ls /dev/cdc-wdm*
   </code>
   </pre>

2. **Install Required Tools**  
   Install the necessary tools for managing QMI interfaces:
   <pre>
   <code class="shell">
   sudo apt install libqmi-utils udhcpc
   </code>
   </pre>

3. **Bring Up the Interface**  
   Use the `qmicli` command to initialize and bring up the modem:
   <pre>
   <code class="shell">
   sudo qmicli --device=/dev/cdc-wdm0 --device-open-net="net-raw-ip|net-no-qos-header" --wda-set-data-format
   sudo ip link set wwan0 up
   </code>
   </pre>

4. **Obtain an IP Address**  
   Use the `udhcpc` utility to obtain an IP address from your network provider:
   <pre>
   <code class="shell">
   sudo udhcpc -q -f -i wwan0
   </code>
   </pre>

   If successful, you should see an IP address assigned to the `wwan0` interface.

### Testing the Connection

To verify the connection, you can use the `ping` command to test the network:
<pre>
<code class="shell">
ping -c 4 google.com
</code>
</pre>

If the modem is correctly configured, you should see replies from the server.

### Set Up a Simple Web Server

Install Python's HTTP server module to set up a basic web server:
<pre>
<code class="shell">
sudo apt install python3
python3 -m http.server 8080
</code>
</pre>

Access the webserver from another device on the same network by navigating to `http://<your_wwan0_IP>:8080`.

This concludes the basic setup for networking and web server deployment using a Raspberry Pi and a 4G LTE modem in QMI mode.
