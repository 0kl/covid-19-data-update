grabs the current db version
downloads an arbitrary set of files and for each one:
hashes the file(the new db migration which is... here https://github.com/0kl/demand-modeler/tree/0kl/dbupdates)
if we are in v5+ of the db then it will check to see if the hash exists in the db, if it does we do not proceed
then each file is cleaned with a find and replace from a set of values
inserts any counties that do not have county fip data, but do have matching state name and state fip data
prints out any state name or county name conflicts where the geoid 's are the same between the incoming csv and the existing data set
remaps the csv according to an arbitrary adapater (e.g. csbs , or any other county data that we get)
inserts the data based on db version. If it's v3 we see the same conflics as before. If v5+ then we will see an upsert when the geoid, entry_date, and data_src have a conflict.