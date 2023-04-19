const UserDataModel = require("../models/UserDataModel");
const { route } = require("../uploadFile");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const storage = getStorage();



const registerPatient = async (req, res, next) => {
    const { dob, userid, height, weight } = req.body
    const files = req.files;
    let dpData
    
    const medRec = []
    const giveCurrentDateTime = () => {
        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime = date + ' ' + time;
        return dateTime;
    };
    try {
        await files.forEach(async element => {
            if (element.fieldname === "displayPic") {
                const dateTime = giveCurrentDateTime();

                const storageRef = ref(storage, `files/${userid}/${"Dp"+"-"+userid+"_"+dateTime}`);
        
                // Create file metadata including the content type
                const metadata = {
                    contentType: element.mimetype,
                    info: "User Display Picture"
                };
                const snapshot = await uploadBytesResumable(storageRef, element.buffer, metadata);
                //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
        
                // Grab the public url
                let URL = await getDownloadURL(snapshot.ref);
                 dpData ={
                    path:URL,
                    metadata:metadata 
                }
            }
            else if(element.fieldname === "records"){
                const dateTime = giveCurrentDateTime();

                const storageRef = ref(storage, `files/${userid}/${"Record"+"-"+userid+"_"+dateTime}`);
        
                // Create file metadata including the content type
                const metadata = {
                    contentType: element.mimetype,
                    info: "User medical records"
                };
                const snapshot = await uploadBytesResumable(storageRef, element.buffer, metadata);
                //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
        
                // Grab the public url
                let recordURL = await getDownloadURL(snapshot.ref);
                let Data = {
                    path:recordURL,
                    metadata:metadata 
                }
                medRec.push(Data)
            }

            // console.log(dpData,medRec);
        })
        const BMI = parseInt(weight/(height*height))
        const userData =new UserDataModel({
            DisplayPic: dpData,
            DOB: dob,
            user:userid,
            height: height,
            weight:weight,
            bmi:BMI,
            medicalRecords:medRec
        })
        await userData.save()

        // const savedUserData = await 
        // console.log(dpData,medRec);
        res.json(userData);
    } catch (error) {
        return res.status(400).send(error.message)
    }
}


module.exports = {registerPatient};