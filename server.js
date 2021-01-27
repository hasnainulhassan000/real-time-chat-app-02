
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var app = express();
var path = require("path")
var SERVER_SECRET = process.env.SECRET || "1234";
var jwt = require('jsonwebtoken')
var { userModel, tweetmodel } = require('./dbcon/module');
var authRoutes = require('./route/auth')
var http = require("http");
var socketIO = require("socket.io");
var server = http.createServer(app);
var io = socketIO(server);
var fs = require("fs")
var multer = require("multer")
// var admin = require("firebase-admin")



const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})

var upload = multer({ storage: storage })

const admin = require("firebase-admin");

// var serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
var serviceAccount = {
    "type": "service_account",
    "project_id": "tweeter-14c51",
    "private_key_id": "48bb372d0f38efd67b2016ba01d6c60e296fba3f",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVqjz8Mbasw07W\nb7E9tzc1URuOWGj1HrUuXLTgxvgLCnwen/T6bcsu27MbqlztsocDovOMB4FYH95X\neY6SISxHLIWolDtsloEipLkarDnjuCZ8h3dkE25ut2hX0jyafw7fe4xmNRAwyH87\nARA3U4zXUXlAkwYzSjRapVm8Dnq2gDvw3ikMIAKo48H1ZJh4LK109Kp7xsZCzxJp\nb2zWRX4B7PQ9/BZWg4Y8p2vO0gtKlxb4pIlvN77Wqvotm/YR0H3yrzkRLhM4QjnQ\ncm/6X0d1ha9IAQd9QChKBKsDTRRE1S59m1mCSTvlovpWUrFWt4D+DwD81Y0xkIk+\n5lGFyZknAgMBAAECggEAOnJ4jX52meJN8/U7cOAPid1KVx0UpAEhfWEL7CoXrOwj\ny6vo9jGRYxO+TwQJdXQ+QL/Ov7UgoIMVh/C7KjsVORhcfBijWkUuWhKdDRsMIm+E\nbCZVDDqAanFqqL08GJOdAc6UZke7smliMm84X3rb6ixxnzOrfLUyW+Ht+MBo0MML\neTj66VQ3l3issLEboTZ6xNmjyBak5Z+874A52R34ksNssCPyrLifVUrPFL+S5ShO\n556i5oEsUiOHIc9c+nHmsJsmFvER6tDuzK/pxliYSO0UzgeU09a9Ef8w1rw0XFl2\nnrLSNvMN4TD0CA1aniqCmX6icCgeyu+yR2WZRDt8rQKBgQDIQkXBpWqaZJaxzpvH\nqskyes1+ic+F7zryZu5ztgMnrlQG1Ss+mpXDrQ0IR01HE7rKmwYwQBd9iKJyXXj4\nbdV4GvbsmtYt64f8jRnI9v8FNxoQ4Oo9TkvLIgZiHzJgjS05GuF71fwJ1OlWj++U\nUzOkf7qnE0OXoln96LwamIN0iwKBgQC/UtPWcPmV3IrB0/SWqhGLdUKbeKF5giEL\nk8OaAODCslyIU//IDvT0zz9xJGq6eXm1KHRjNIlg55vcN1FjwiZAoKR937k3gbjy\npJa/oHjiOq+PBxX2A+2O3dJlLdAFqF0sw1nlvMXl3lgSn3+ZT2IQqBuWZRNwBmNw\nQ4bBpM2VVQKBgBWkq/tY0GOtWWgQJ1/2Ala1VP5HEKmuCFXob/8Lfd3NBoHSiiDy\n/hqu2ki5xA1ZgYeiJ5IRaziDCuOHXKqk3Dxl1agOt/UwjnrqGQ5SO4+pu+R1GnvT\nuXdTzxLNwlkTCP8x+4qxvtKlMy7K0Z7bOyqdL2QdPeHmhwldHO9W6mYvAoGAKh03\nWCrCJcTIHmZjno6NEh+bq9Ff6flFAOFj2xB6aSEN0Ux8LzNrpD/CfUtA2w9GRSRE\nilnUK6qP2meq2MSx2uQBkVufz6IUbgTg0gmm0lWMs3Uh1meC8UHOwErXUYeACwxt\nS27EORc6V88YLU0WDwiSGgbhwnUFin6yuQln34kCgYEAkpQO4TI39RRPOFQ4es8r\n1kzlnZsqZUN5q91THtiABNaaOqwjdWPeybLoIDoXJ82SprJGJIrx3YUYwUM3seMK\nI8WeO6r3+uojNKgPt+8vXIlaq1d5lOOwA38K05HyohnRfUHFehwHGzrAEQdPFapn\nOSNzsEtWbrwX5aea+0ggSSk=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-pilmd@tweeter-14c51.iam.gserviceaccount.com",
    "client_id": "111668100040037426229",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-pilmd%40tweeter-14c51.iam.gserviceaccount.com"
  }
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tweeter-14c51-default-rtdb.firebaseio.com/"
});
const bucket = admin.storage().bucket("gs://tweeter-14c51.appspot.com");

//==============================================


io.on("connection", () => {
    console.log("user Connected")
})


app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));

app.use("/", express.static(path.resolve(path.join(__dirname, "public"))))

app.use('/', authRoutes);
// app.use('/',authRoutes);

app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies.jToken);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {

    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone gender  createdOn profilePic',
        function (err, doc) {
            if (!err) {
                res.send({
                    profile: doc
                })

            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})
app.post(`/tweet`, (req, res, next) => {


    userModel.findOne({ email: req.body.userEmail }, (err, user) => {
        // console.log("khsajhfkjdha" + user)
        if (!err) {
            tweetmodel.create({
                "name": req.body.userName,
                "tweet": req.body.tweet,
                "profilePic": user.profilePic
            }).then((data) => {
                // console.log( "jdjhkasjhfdk" +  data)
                res.send({
                    status: 200,
                    message: "Post created",
                    data: data
                })

                console.log(data)
                io.emit("NEW_POST", data)

            }).catch(() => {
                console.log(err);
                res.status(500).send({
                    message: "user create error, " + err
                })
            })
        }
        else {
            console.log(err)
        }
    })

})

// app.post('/tweet', (req, res, next) => {
//     // console.log(req.body)

//     if (!req.body.userName && !req.body.tweet || !req.body.userEmail) {
//         res.status(403).send({
//             message: "please provide email or tweet/message"
//         })
//     }
//     var newTweet = new tweetmodel({
//         "name": req.body.userName,
//         "tweet": req.body.tweet
//     })
//     newTweet.save((err, data) => {
//         if (!err) {
//             res.send({
//                 status: 200,
//                 message: "Post created",
//                 data: data
//             })
//             console.log(data.tweet)
//             io.emit("NEW_POST", data)
//         } else {
//             console.log(err);
//             res.status(500).send({
//                 message: "user create error, " + err
//             })
//         }
//     });
// })

app.get('/getTweets', (req, res, next) => {

    console.log(req.body)
    tweetmodel.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
            // data = data[data.length -1]
            res.send(data)
        }
    })
})

/////////////////////////////// profile

app.post("/upload", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    console.log("req.body: ", JSON.parse(req.body.myDetails));
    console.log("req.files: ", req.files);

    console.log("uploaded file name: ", req.files[0].originalname);
    console.log("file type: ", req.files[0].mimetype);
    console.log("file name in server folders: ", req.files[0].filename);
    console.log("file path in server folders: ", req.files[0].path);

    bucket.upload(
        req.files[0].path,
        // {
        //     destination: `${new Date().getTime()}-new-image.png`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
        // },
        function (err, file, apiResponse) {
            if (!err) {
                // console.log("api resp: ", apiResponse);

                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 
                        console.log(req.body.email)
                        userModel.findOne({ email: req.body.email }, (err, users) => {
                            console.log(users)
                            if (!err) {
                                users.update({ profilePic: urlData[0] }, {}, function (err, data) {
                                    console.log(users)
                                    res.send({
                                        status: 200,
                                        message: "image uploaded",
                                        picture: users.profilePic
                                    });
                                })
                            }
                            else {
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)

                        } catch (err) {
                            console.error(err)
                        }


                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})