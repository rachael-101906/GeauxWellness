## Inspiration

A theme as encompassing as happiness was a difficult and broad area to start with for our WiCS hackathon project. However, we became inspired by the importance of mental health on LSU's campus and the hidden struggles that many students face every day. Mental health outlets in Louisiana are few and far between, especially those specifically for college students and young adults. The intention of our application is to show students they are not alone in their feelings; everyone struggles, and often these struggles go unseen. However, through emotion tracking, journal entries, and an emotional heatmap, students can better understand themselves and the community around them.

## What it does

When a user logs into the application, Geaux Wellness redirects to the home page, which displays the main components of the app. The welcome page and mission statement greet the user, while the hotspot map and its filters display on the right. The purpose of the heatmap is to show trends across campus, using "hot spots" to display where other users tracked their emotions and which ones they logged.

Scrolling further, a rainbow gradient showcasing the most common emotions and their general definitions spreads across the page.

Directly under this is the quiz card. Taking this quiz allows the application to track your emotions for the day, with options such as Happy, Angry, Flirty, Hungry, Anxious, and Sad. After selecting an emotion, the user is prompted to write the reasoning behind their selected emotion. Finally, the user is asked if they would like to share their location. With this data, the user's emotion, journal entry, and location are stored in our database and shown on our map along with the other entries of LSU students in the area.

The bottom of the application displays the footer containing the title for Geaux Wellness and the copyright information.

At the top of the application on the navbar, the user can select the quiz, insights, profile, or log out.

The quiz redirects them to the quiz on the homepage.

The insights page displays two charts: one for the user's moods and the other for the general moods around them at their university.

Finally, the profile page contains the user's information such as their email, date joined, and first name. Below this, all of the past journal entries and moods that the user has logged are displayed along with the timestamp.

## How we built it

We built Geaux Wellness using React.js, HTML, and CSS for both the front end and back end. Firebase Authentication and Firestore were used as the backend database to store user information such as login details, mood tracking, location, and journal entries.

## Challenges we ran into

Designing the Geaux Wellness website was not always a smooth-sailing process. Our team dealt with a tumultuous amount of problems, including but not limited to ghost images, installation issues, CSS formatting issues, a team member's malfunctioning computer, heatmap color distortion, and continuous Wi-Fi connectivity problems. However, despite these challenges, we were able to work around them and use critical thinking to push through the setbacks. It not only allowed us to be more efficient with our time but also to work together to find solutions.

## Accomplishments that we're proud of

The accomplishment we are most proud of is creating an application where each unique aspect and component was the result of the hard work and team effort contributed by our members during the minuscule 48 hours. In addition, we are proud of the heatmap, as it required the most programming and integration with the database and took the most time to implement.

## What we learned

We became more experienced with various components of HTML, CSS, and React.js. We encountered a learning curve with some of these technologies but also collaborated in a team environment where work was split up efficiently. We became more proficient in team communication and problem-solving within a time-sensitive environment, resulting in growth in our work ethic and determination.

## What's next for Geaux Wellness

Our next steps include reaching out to other universities to encourage students from different campuses to use our app and log their mental health. This way, students in other parts of the country can see how each other are feeling. This could provide insight into greater self-awareness while also fostering a better-understanding community rooted in kindness and fellowship.
