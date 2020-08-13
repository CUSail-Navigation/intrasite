---
layout: post
author: Courtney McBeth
categories: ['Basics of Sailing']
logo: glossary_logo.png
title: Terminology
---

<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

## Velocity Made Good (VMG)
<p>
In sailing, velocity made good (VMG) refers to the speed at which the sailboat is moving in a given direction. Commonly, this direction is either directly upwind or downwind. In our implementation, this direction is toward the target waypoint. We define velocity made good as the dot product of the boat's velocity vector, \(\vec{v_b}\) and the unit vector representing the difference between the target position and the boat position, \(\vec{t_0}\).
\[vmg = \vec{v_b} \cdot \vec{t_0} \]
</p>

In the example below, the difference between absolute velocity and velocity made good can be seen. Here, the target is directly upwind.

![VMG]({{ site.baseurl }}/images/vmg.jpg "VMG")

## Polar Diagram

A polar diagram (or polar plot) is used to determine the maximum velocity of a sailboat for a given apparent wind direction and wind speed. Here, the true wind angle is the wind angle experienced by the boat (or the relative wind direction).

![Polar Diagram]({{ site.baseurl }}/images/polar_diagram.png "Polar Diagram")

Each sailboat has its own unique polar diagram based on its size and shape. For most sailboats, a simplified polar diagram that does not rely on wind speed can be used without experiencing much difference.

## Angle of Attack

TODO