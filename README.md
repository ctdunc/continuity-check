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

`pip install -r install/py_deps.txt`

With this procedure completed, you can run the `installer` script. MAKE SURE THAT YOU ARE IN THE `continuity-check` DIRECTORY. From this, run  

`./install/installer.sh`

This script will take you through a series of questions that creates an sql database, a bot user, and several tables that you have the choice to populate with sample data (if you work for CDMS, this data is the standard option for our fridge configuration). 

Once you are finished with this script, you are ready to run the app. Simply start the celery worker with `celery worker -A server.celery`, make sure there is a running redis server on your computer, and execute `python server.py`.

To view the webpage, navigate to `127.0.0.1:5000/`.
### Apache Daemon

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

