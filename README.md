# SCDMS Continuity Check

## About
This is a web-based application designed for the Super Cryogenic Dark Matter Search Laboratory at UC Berkeley to conduct and record continiuity tests on detection equipment.
It is currently configurable through locally-hosted SQL databases, although I plan to add the ability to alter tables of expected values, etc through a web interface in the future.

I have yet to complete the install scripts for various dependencies of this application. They are forthcoming.

## Installation
Before installing this application, you will need the following:

+ MySQL
+ Python 3.7+
+ Redis
+ NPM

First, you will need to create an SQL database called `continuity-check`, and give the user `cdms` (password: `cdms`) full permissions on this database. 
(This will be configurable in the future, but for testing purposes it will suffice).

