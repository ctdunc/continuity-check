# SCDMS Continuity Check

## About
This is a web-based application designed for the Super Cryogenic Dark Matter Search Laboratory at UC Berkeley to conduct and record continiuity tests on detection equipment.
It is currently configurable through locally-hosted SQL databases, although I plan to add the ability to alter tables of expected values, etc through a web interface in the future.



## Installation
Before installing this application, you need the following programs.

+ MySQL
+ Python 3.7+
	+ and the python package installer `pip`.
+ [Redis](https://redis.io/)
+ [ Node Package Manager ]( https://npmjs.com )

First, clone this repository into a folder `continuity-check` using `git clone https://github.com/ctdunc/continuity-check.git`.

Second, you will need to set up an SQL database called `continuity_check`, and give the user `cdms` (password: `cdms`) full permissions on this database ([MySQL documentation]( https://dev.mysql.com/doc/ ))

Third, you must create a virtual environment to install neccesary python dependencies. Install `virtualenv` using `pip install virtualenv` (this may require root permission).

Once installed, enter the `continuity-check` folder and execute `virtualenv env` to create a virtual environment called `env`.

To activate this environment, execute `source env/bin/activate` from `continuity-check`. On most UNIX systems, your shell prompt should now read `(env) [user@computer]$`.

Now you can install the requirements of this program with `pip install -r install/py-requirements.txt`.

With these requirements installed, enter `install/sql-setup`, and execute each of the python programs in that folder individually. These will enter some sample data into the SQL database.

Finally, enter the `view` folder, and execute `npm install` to download the neccesary node modules.

## Startup
To start this application, simply execute `startup.sh`, and use firefox (I haven't finished the CSS for Chrome/other browsers yet) to navigate to `127.0.0.1:5000/`.


