---
layout: post
author: Courtney McBeth
categories: ['Website']
logo: sphinx_logo.png
title: Updating the Documentation
---

<link rel="stylesheet" href="{{site.baseurl}}/css/code_styles/hybrid.css">
<script src="{{site.baseurl}}/js/highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>

## Writing Documentation
To make sure that future Navigation team members can easily understand and work on our project, it is important that we clearly document our code. I've setup our Raspberry Pi codebase to use Sphinx, a Python documentation generator, to make this easy for us. The version of Sphinx that we use, Napoleon, requires our docstrings to be written according to the [Google Style Guide](https://github.com/google/styleguide/blob/gh-pages/pyguide.md#38-comments-and-docstrings). I'll summarize the important points below.

Most important to remember is that Sphinx will run all _module-level_ code (not within a function or class) when generating its HTML files. This is something we want to avoid. So, instead of writing something like this:

<pre>
<code class="python">
from somewhere import whatever

s = "This is module-level code..."
print(s)

class Useless:
  pass

def something():
  pass

</code>
</pre>

You should write something like this:

<pre>
<code class="python">
from somewhere import whatever

class Useless:
  pass

def something():
  pass

def main():
  s = "This is NOT module-level code..."
  print(s)

if __name__ == '__main__':
  main()

</code>
</pre>

Enclosing the previous module-level code within the main method will not change how you run the code from the command line, but will prevent Sphinx from running it. It's a little stylistically nicer too.

Now, let's consider how we should write the docstrings that will be turned into our documentation. First, let's consider modules. If you're writing a test file, or some file that is not just a class definition, you should include a module-level docstring that explains the purpose of the code included in that file. Here's an example:

<pre>
<code class="python">
"""A one line summary of the module or program, terminated by a period.

Leave one blank line.  The rest of this docstring should contain an
overall description of the module or program.  Optionally, it may also
contain a brief description of exported classes and functions and/or usage
examples.

  Typical usage example:

  foo = ClassFoo()
  bar = foo.FunctionBar()
"""

</code>
</pre>

Next, there should be a class-level docstring for each class (outer and inner) in your file. If you're overwritting the *\_\_init\_\_* method, you should also describe the arguments and possible raised exceptions for that method here using *Args* and *Raises*, which are coved in more detail below. Here's one class-level docstring that I wrote for the NMEA parser:

<pre>
<code class="python">
class NMEA:
    """A parser for National Marine Electronics Association (NMEA) sentences.

    The Parallax SIM33EAU GPS module transmits six different types of NMEA
    sentences: RMC: Recommended minimum data for GPS, VTG: Vector track and 
    speed over the ground, GGA: Fix information, GSA: Overall satellite data, 
    GSV: Detailed satellite data, and GLL: Latitude/Longitude data. This parser 
    can account for each of these types. More information about NMEA sentences
    can be found here: https://www.gpsinformation.org/dale/nmea.htm.

    The parsed information can be accessed through attributes of the NMEA
    object, which may be `None` if that attribute does not exist in the given
    sentence type.

    Args:
        sentence (str): An NMEA sentence to parse.
    
    Raises:
        TypeError: If the input sentence is not a string.
        ValueError: If the input is not a valid NMEA sentence.

    Attributes:
        utc (UTC): The UTC time at which the NMEA sentence was generated.
        status (bool): Whether the NMEA sentence contained valid data.
        latitude (float): The numeric latititude measurement.
        north (bool): Whether the latitude is N (true) or S (false).
        longitude (float): The numeric longitude measurement.
        west (bool): Whether the longitude is W (true) or E (false).

    """
    pass

</code>
</pre>

The docstrings that you're likely encounter the most are function-level. These should again include a description of their purpose. They should also include specifications of their arguments and return values, as well as whatever exceptions they may raise. You can omit any of these specifications if they do not apply. When writing a docstring for a class method, you do not have to include a description of the 'self' argument. The types of the arguments are given as shown below:

<pre>
<code class="python">
def func(arg1, arg2):
    """Summary line.

    Extended description of function.

    Args:
        arg1 (int): Description of arg1.
        arg2 (str): Description of arg2.

    Raises:
        TypeError: Description of when TypeError is raised.

    Returns:
        bool: Description of return value.

    """
    pass

</code>
</pre>

## Installing Sphinx
Spinx is a Python extention, so you'll need to install it before building any documentation files. You can do this using pip. Remember that we are using Python 3, so you may need to use 'pip3' instead of pip if you also have Python 2 installed. If you are using a virtual environment, remember to activate it before installing.

<pre>
<code class="shell">
pip install -U sphinx

</code>
</pre>

We are using a third-party Sphinx theme for our HTML files because it looks marginally better than the pre-installed ones. (Sidenote, if anyone has time to make a nicer looking theme, you'll earn my eternal gratitude.) This can also be installed using pip.

<pre>
<code class="shell">
pip install sphinx_rtd_theme

</code>
</pre>

Now, you're ready to generate the documenation files!

## Generating the Updated HTML
Spinx generates HTML, CSS, and JavaScript files that I've setup to be hosted on our GitHub Pages site [here](https://cusail-navigation.github.io/raspberrypi/html/index.html). It's also linked to under _Documentation_ in the navigation bar of the [intrasite](https://cusail-navigation.github.io/intrasite/). This gets updated everytime that someone pushes to the *raspberrypi* repository with updated documentation files. These files are stored in the _docs/_ directory, but you don't need to know that. Here's how you generate updated files:

First, you must be inside of the _sphinx_ directory (use *cd spinx* from the terminal on mac, or *chdir sphinx* from command prompt on Windows, but hopefully you already knew that). Now, generate the source files - the text files that Sphinx will use to generate HTML. Run the following command (don't omit the periods, these represent directories):

<pre>
<code class="shell">
sphinx-apidoc -f -e -o . .. ../nav_algo/tests

</code>
</pre>

The final step is to actually generate the HTML. Do this by running:

<pre>
<code class="shell">
make html

</code>
</pre>

If you get errors in any of these steps, you probably either didn't install Sphinx, the Sphinx theme we use, or you have module-level code in one of your files.