# Train of Though 

1. Saw the ui, wireframe, I've decided to go with mobile first and react

2. Looked at `users.json` thought 'either i will have to create a script to create those entries once i deal with lowdb or lowdb will have a way of doing this itself'

3. Realized that for each user entry, the password is already there (email too), but passwords exist in plaintext format so I'm thinking about encrypting for when storing in DB (since I've worked with django in the past i am thinking of someway to create a mapping/migration between a UserModel, and whichever other models I might need to interact with the database, still haven't gone through lowdb docs at this point)

4. Realized there is an isActive field on each user so might have to do something about this per the requirements (new idea on definitions/assumptions)

5. guid vs _id... which one to use as unique identifier?? will figure it out later... I'll just setup docker for now

6. valid user -> match(email,password) && isActive... also if time allows JWT would be nice for backend frontend easier interaction without the extra store setup for session ids