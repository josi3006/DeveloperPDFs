const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const util = require("util");
const puppeteer = require("puppeteer");

const writeFileAsync = util.promisify(fs.writeFile);


// Code below takes user name and favorite color input 

async function getInput() {
    inquirer
        .prompt([
            {
                message: "Enter your GitHub username:",
                name: "username"
            },
            {
                message: "What is your favorite color?",
                name: "favColor"
            }
        ])
        .then(function ({ username, favColor }) {
            const queryURL = `https://api.github.com/users/${username}`;
            const queryURLstars = `https://api.github.com/users/${username}/starred`;

            makeCall(queryURL, queryURLstars, favColor);

        })
}


// Code below makes call to GitHub

function makeCall(queryURL, queryURLstars, favColor) {

    let fileData = [];

    axios
        .get(queryURL)
        .then(function (res) {

            const userName = res.data.login;
            const fullName = res.data.name;
            const picURL = res.data.avatar_url;
            const location = res.data.location;
            const blogURL = res.data.blog;
            const bio = res.data.bio;
            const noRepos = res.data.public_repos;
            const noFollowers = res.data.followers;
            const noFollowing = res.data.following;

            fileData = {
                fullName: fullName,
                userName: userName,
                picURL: picURL,
                location: location,
                blogURL: blogURL,
                bio: bio,
                noRepos: noRepos,
                noFollowers: noFollowers,
                noFollowing: noFollowing,
            };

            console.log(fileData);

        }).then(function () {
            axios
                .get(queryURLstars)
                .then(function (res) {

                    const noStarred = res.data.length;
                    console.log('# starred repos: ' + noStarred)

                    const data = generateHTML(fileData, noStarred, favColor);

                    writeFile(data);
                });
        });
}


// Code below creates HTML page and renders data onto it

function generateHTML(fileData, noStarred, favColor) {

    const { picURL, fullName, location, userName, blogURL, noRepos, noFollowers, noFollowing, bio } = fileData;

    return `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="index.js" defer></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src='https://kit.fontawesome.com/22772263e9.js' crossorigin='anonymous'></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>
<body>
    <div class='container container-fluid justify-content-center'>
        <div class='row justify-content-center my-5'>                        
            <div class='col text-center' id='pic-box'>
                <img class='rounded-circle img-thumbnail' style="height: 200px" src='${picURL}'>
            </div>
        </div>
        <div class='row'>
            <div class='col-12 rounded' style='background-color: ${favColor}'>
                        <h5 class="display-2 text-center text-white" id='name'>Hi!</h5>
                        <h5 class='display-3 text-center text-white'>My name is ${fullName}</h5>
                        <h3 class='display-5 text-center text-white'>
                        <i class="fas fa-map-marker"></i>
                            <a href='https://www.google.com/maps/place/${location}'>${location}</a>&nbsp;
                            <i class="fab fa-github ml-5"></i>
                            <a href='https://github.com/${userName}'>${userName}</a>&nbsp;
                            <i class="fas fa-blog ml-5"></i>
                            <a href=${blogURL}>Blog</a>
                        </h3>
            </div>
        </div>
        <div class='row text-center text-white my-4 justify-content-center'>
        <div class='col-8'>
        <h4 style='color: ${favColor}'>${bio}</h4>
        </div>
    
        
        </div>
        <div class='row justify-content-center my-5'>
            <div class='col-4 mx-3'>
                <div class='card'>
                    <div class='card-body rounded' style='background-color: ${favColor}'>
                        <h3 class='card-title text-white text-center' id='repos'>Public Repositories</h3>
                        <h3 class='text-white text-center'>${noRepos}</h3>
                    </div>
                </div>
            </div>
            <div class='col-4 mx-3'>
                <div class='card'>
                    <div class='card-body rounded' style='background-color: ${favColor}'>
                        <h3 class='card-title text-white text-center'>GitHub Stars</h3>
                        <h3 class='card-title text-white text-center'>${noStarred}</h3> 
                    </div>
                </div>
            </div>
        </div>
        <div class='row justify-content-center mb-5'>
            <div class='col-4 mx-3'>
                <div class='card'>
                    <div class='card-body rounded' style='background-color: ${favColor}'>
                        <h3 class='card-title text-white text-center' id='followers'>Followers</h3>
                        <h3 class='text-white text-center'>${noFollowers}</h3>
                    </div>
                </div>
            </div>
            <div class='col-4 mx-3'>
                <div class='card'>
                    <div class='card-body rounded' style='background-color: ${favColor}'>
                        <h3 class='card-title text-white text-center'>Following</h3>
                        <h3 class='card-title text-white text-center'>${noFollowing}</h3>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    </div>
</body>
</html>`
}


// Code below writes HTML page to a pdf

function writeFile(fileData) {
    writeFileAsync("profile.html", fileData)
        .then((async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(fileData);
            await page.pdf({ path: 'PDF.pdf', format: 'A4' });

            await browser.close();
        }
        ));
}

getInput();     // This function starts the whole thing