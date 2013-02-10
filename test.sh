# URL: http://<url naar app:poort van app>/services/dir/list/
# (vervolg) <json of html>/pad
wget -qO- http://localhost:3000/services/dir/list/json/public | less
