# SCDMS Continuity Check

## About
This is a web-based application designed for the Super Cryogenic Dark Matter Search Laboratory at UC Berkeley to conduct and record continiuity tests on detection equipment.
It is currently configurable through locally-hosted SQL databases, although I plan to add the ability to alter tables of expected values, etc through a web interface in the future.

## Installation
Before installing this application, the following dependencies are required.
+ MySQL (personally, I recommend [MariaDB](https://mariadb.org/), as it is opensource)
+ [Pip](https://pypi.org/project/pip/)
+ [Virtualenv](https://virtualenv.pypa.io/en/stable/)
+ [Redis](https://redis.io/)

If you want to make changes to the UI, you will also need the [Node Package Manager](https://www.npmjs.com/).

There are two ways to install this application. The first, and simplest is as a python executable that runs on a localhost server (typically `127.0.0.1`)
This has the benefit of being fairly easy to set up, but requires a VNC connection to use (unless you have physical access to the server that you would like to install this on).

The second, and more complicated is as an Apache Daemon, which will be detailed below.

### Localhost Executable
First, clone this repository onto your system using 

`git clone https://github.com/ctdunc/continuity-check.git`

Then, navigate to the installation directory, and create a python virtual environment using 

`virtualenv env`

Now, activate the environment by running 

`source env/bin/activate`

and make sure your dependencies are up to date, by running 

`pip install -r install/python_deps.txt`

With this procedure completed, you can run the `installer` script. MAKE SURE THAT YOU ARE IN THE `continuity-check` DIRECTORY. From this, run  

`./install/installer.sh`

This script will take you through a series of questions that creates an sql database, a bot user, and several tables that you have the choice to populate with sample data (if you work for CDMS, this data is the standard option for our fridge configuration). 

Once you are finished with this script, you are ready to run the app. Simply start the celery worker with `celery worker -A server.celery`, make sure there is a running redis server on your computer, and execute `python server.py`.

The redis server runs on `redis://localhost:6379/0` by default. If you think the server might be running on a different port, you need to alter `server.py` to reflect those changes for `CELERY_BROKER_URL` and `CELERY_BROKER_BACKEND`, and restart the celery worker to ensure the correct operation of the actual continuity checks.

To view the webpage, navigate to `127.0.0.1:5000/`.
### Apache Daemon
The setup of the Apache Daemon is a bit more involved.
 
Obviously, you should have `httpd` or your operating system's equivalent installed, and know where your relevant configuration files are. 

I will call the location of these files `/httpd/` for the rest of these instructions..

The installation proceeds in three steps:
1. Install and configure Continuity Check app.
2. Ensure Apache WSGI Compatibility.
3. Configure Apache to host our app.

#### Install Continuity Check
This installation proceeds much in the same way as the localhost executable.

The notable exception is the configuration of **group permissions** for your files, and that you **should not install** the application in a directory directly legible by the apache/httpd usergroup, expressed in `.../httpd.conf` as:
```
User [name]
Group [name]
```
The reason for this, is such an installation will make the python code directly downloadable by anyone with access to the webpage (including potential access to passwords!).

Rather, you should choose an installation directory in your standard location for installing applicaations from source (in my case, I use `/opt/` for most such applications).
Talk with your sysadmin to find out exactly which directory they want you to use here.

From here, the installation procedure is virtually identical to that of the *Localhost Executable*, and you should refer to those instructions untill you reach the step that asks you to start the celery worker, at which point, it will be time to set up our Apache Server.

You should also have a user group dedicated to running such daemon processes (in my case, `cdms`), to which you should change the group/user of the folder you are in, using 
```
chgrp -R [groupname] /path/to/application/ 
```

#### Apache+WSGI Setup
We are going to use the `mod-wsgi` apache module to ensure compatibility between our server and apache.
I *highly* recommend referring to the [documentation](https://modwsgi.readthedocs.io/en/develop/) to familiarize yourself with this module, as these instructions are almost guarunteed to have kinks and idiosyncracies (aka fail) for different operating systems/configurations. I am writing about my experience using CentOS 7.

Specifically, **please** read the [installation instructions](https://modwsgi.readthedocs.io/en/develop/user-guides/quick-installation-guide.html) from the lovely people at `mod_wsgi` if you have any issues with your installation, as I will be walking you through how I got this to work on one machine.

Got all that? Here we go.

First, download the most recent source tarball from their [github](https://github.com/GrahamDumpleton/mod_wsgi/releases).
Unpack it into any directory with
```
tar xvfz mod_wsgi-X.Y.tar.gz
```
replacing `x.y`` with the correct version number, and enter the directory.

Now, we need to configure the module to work with python 3.7. `mod-wsgi` configures itself by default by searching for the `python` executable in the `$PATH`, which in many cases is occupied by an older version of python.

We also need to be sure that our [apxs](https://httpd.apache.org/docs/2.4/programs/apxs.html) is properly configured. To make sure this is installed, execute `httpd -l`. If `mod.so` is not part of the displayed list, follow the instructions given at the apache website to configure axps.

If either of these programs is installed in a nonstandard location, we should execute `./configure` with the following options 
```
./configure --with-apxs=/httpd/bin/apxs \
  --with-python=/path/to/python3.7
```

Finally, once configured, you can execute
```
sudo make install
```
to install the module.

If, for some reason, this doesn't work, please consult the documentation for further troubleshooting.

All that remains is to load the module into apache. To do this, simply add the following line to the apache config (usually located in `/httpd/conf.d/httpd.conf`) file:
```
LoadModule wsgi_module modules/mod_wsgi.so
```

Restart the apache server using `apachectl restart`, and you should have `mod-wsgi` compatibility!

#### Calling our Application
Finally, we should navigate to the static web server (typically where all other pages are served from), create a directory for our WSGI file at the desired URL (much like uploading a static html page), and then create the file `continuity-check.wsgi`, which should contain the following lines:
```
activate_this='/path/to/app/install/env/bin/activate_this.py'
import sys
sys.path.append('/path/to/app/install/')
from server import app as application
```

Now, all that remains is to load our module into a virtualhost, a sample of which is as follows
```
<VirtualHost *:80>
	ServerName files.example.com
	ServerAlias files

	DocumentRoot /web/site/html/cdms
	<Directory /web/site/html/cdms>
		Options Indexes FollowSymLinks Includes
		AllowOverride All AuthConfig
		order allow, deny
		allow from all
	</Directory>

	WSGIDaemonProcess cdms processes=2 threads=5 python-home=/path/to/app/install/env
	WSGIProcessGroup [groupname]
	
	WSGIScriptAlias /url/path/of/page /web/site/html/cdms/url/path/of/page/continuity-check.wsgi
</VirtualHost>
```
## Configuration
So far, all configuration must either be done by directly editing SQL tables, or editing source directly. 

The only exception is the .botconfig file, which allows you to change the name of the bot, as well as password, and the database you are using.

The format is as follows

```
[bot name]

[bot pw]

[db name]
```

Also, the code currently executes a random measurement, as opposed to speaking to a DMM, since I do not have a real one on hand. So, if you need to take real measurements, edit `logic/continuity.py` so that every `rand.uniform()` call points to the appropriate function from the `dmm_interface` class. 

This will be changed in a future release, once we are prepared to go beyond testing (there's an issue with the DMM preventing us from using it at low temperatures).
## Planned Improvements
This is still a work in progress. While it is ready to be used as a logging service for our continuity check now, there are still several features that I would like to add.

Improvements are listed below, in order of priority, with 1 being the highest, 5 being the lowest

+ Settings Menu
	+ (1) Edit/Add Tables of Expected Values
	+ (1) Change Signal Types, Channel Numbers through web
	+ (1) Upload csv/xslx expected value tables
	+ (5) Change look/feel of webpage
	
+ Data Export
	+ (2) txt file
	+ (2) visualization (bar graph, etc)

+ Real Time Updater
	+ (1) Failures appear instantly
	+ (1) clicking on progressbar shows message board

## License
This application is distributed under the [GNU Public License](./LICENSE).

