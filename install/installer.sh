#source python binaries to begin with
source env/bin/activate

#Begin process
echo 'Welcome to Continuity Check Setup. This will guide you through the process of configuring your system!
Please enter the administrator account and username for your MySQL server. 
This will be used to create an account that can only access this database, with read permissions.'

sqlgood=1

#read in user input, make sure login info is valid.
while [ $sqlgood -eq 1 ]
do
	read -p 'Administrator Username: ' uname
	read -sp 'Administrator Password: ' upass
	echo
	read -p 'Database Name': dbname
	echo

	mysql -u$uname -p$upass $dbname -eexit
	sqlgood=$?
done
echo

#get info for bot account
echo 'Please enter a username and password for a bot account
This account will have only read permissions for your database, and should not have the same password or username as your administrator.
The password for this account will be stored as plaintext, so make sure that the password is not shared by any other accounts!
If you are installing this on a web server, be sure that this file is not accessible by httpd.
(a more secure storage method is coming in future versions)'

bpass='a'
bpasscon='b'

read -p 'Bot Username: ' bname
while [ "$bpass" != "$bpasscon" ]
do
	read -sp 'Bot Password: ' bpass
	echo
	read -sp 'Confirm Password: ' bpasscon
	echo
done

echo 'passwords match! continuing...'

echo >.botconfig
echo "username:$bname">>.botconfig
echo "password:$bpass">>.botconfig
echo "database:$dbname">>.botconfig

echo 'creating bot account...'

# create bot account
mysql -u$uname -p$upass -e \
	"CREATE USER '$bname'@'localhost' IDENTIFIED BY '$bpass'; GRANT SELECT,INSERT ON $dbname.* TO '$bname'@'localhost';"

echo 'created bot!'
echo 
echo 'Would you like to automatically insert the sample data? (y=yes, any other key=no)'

read autodata
echo
if [ "$autodata" == "y" ]
then
echo 'inserting data...'
# do python script
python -c "import sys; sys.path.append('./install/'); from insertdata import insertdata as ins; ins('$uname','$upass','$dbname')"
echo 'data inserted!'
fi

echo 'complete!'


