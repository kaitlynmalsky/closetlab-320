![GitHub last commit (branch)](https://img.shields.io/github/last-commit/kaitlynmalsky/closetlab-320/main)

# closetlab-320
This is the repository for Closet Lab, our CS 320 project.

Contributors: Vincent Babu, Wei Fu, Emir Korukluoglu, Kaitlyn Malsky, Leah Sellam, Luke Walsh

## Source Distribution
Our source distribution can be found at this repository. The source distribution is a React Native app that can be run on web, as well as on 
Android and iOS devices.

To run the source distribution, install the source code and then navigate to the ClosetLab directory and run the expo app.

```
cd ClosetLab
npm install
npx expo start
```

Our functionality is mostly centered around a mobile experience. To use the source distribution as a mobile app, scan the QR code provided in the terminal. You will need to install the Expo Go app on your mobile device. Alternatively, you can press **w** in the terminal to open the project as a web app in your browser. Functionality as a web app might be limited, though. 

## Binary installation

Since our project is a web-based React project, there is no installable distribution. Our app is hosted at the URL [https://closet-lab.vercel.app/](https://closet-lab.vercel.app/).

## Using our app

Our app has three main functionalities: the **item list**, the **outfit list**, and the **calendar**. 

### Item list

Press the **+** icon to add a new clothing item to your personal item list. This will access your device's camera, allowing you to take a photo of your clothing.

After have taken a picture of your clothing item, you can assign **tags** to it, which can be in the category of **type**, **brand**, **color**, or **other**. Tags aren't necessary, but they allow you to further organize your wardrobe.

A unique feature that our application has is the **donation reminders** attribute. Donation reminders for a clothing item can be toggled by tapping the bell (change this if the icon changes according to feedback) top right corner. When donation reminders are on, you will be reminded to donate your clothing item if you haven't worn it for a certain amount of time.

Once a clothing item has been added to your wardrobe, you can edit your existing item's photo and add/remove tags. You can also remove items of clothing from your wardrobe if you wish.


### Outfit list

The outfit list allows you to organize your clothing items into outfits, ready to be worn on future days.

(add more here as outfit list is developed)

### Calendar

The calendar feature allows you to plan your outfit for a specified date in the future. To assign one of your outfits to a day, choose a day on the calendar, navigate through your outfit list, and select an assignment.


# Running backend locally:
```
cd ClosetLab/Backend/
pip install flask flask-cors pymongo rembg boto3 pillow
python app.py , or gunicorn --worker 3 --bind 0.0.0.0:5000
```

Keep in mind that since we use aws s3 buckets for image storage, you need to create your own s3 bucket to be used and an user on IAM page in aws.
