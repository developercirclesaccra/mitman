# Mitman

Mitman is a [#DevCHack](https://developercircles.devpost.com/) project which seeks to help developers manage meetups. It will help organisers of such meetups seamlessly obtain data and analytics and also incentivise attendees to engage before, during and after the meetup.

To run Mitman locally

1. Clone repo
`git clone git@github.com:developercirclesaccra/mitman.git`

2. Install dependencies
`npm install`

3. Set environment variables
As obtained from your [Facebook app](https://developers.facebook.com/docs/messenger-platform), set both *VERIFICATION_TOKEN* and *PAGE_ACCESS_TOKEN* in a **.env** file in the root of the project.

4. Launch server
`npm start`

5. Serve app over a tunnel (https)
Use a tunneling tool like [Ngrok](https://ngrok.com/) or [LocalTunnel](https://github.com/localtunnel/localtunnel) to serve your app and set webhook address and verification token on Facebook app.