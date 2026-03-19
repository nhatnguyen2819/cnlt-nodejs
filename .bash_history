cd
mkdir
mkdir cnlt-nodejs
mkdir TH1 TH2 TH3 TH4 TH5 TH6 TH7 TH8 TH9 TH10
cd TH1
touch index.js
code .
node index.js
cd
cd TH1
git init
git remote add origin https://github.com/nhatnguyen2819/cnlt-nodejs.git
git branch -M main
sudo chown -R $USER:$USER .git
git branch -M main
git push -u origin main
