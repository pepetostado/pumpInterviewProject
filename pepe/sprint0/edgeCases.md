* Login
    1. boyd :: 401
    2. unknown email :: 401

* GET /me
    1. expired/bad :: 401 → /login

* PATCH /me
    1. balance, _id, pw :: 400
    2. empty :: 200 

* SEED 
    1. rerun :: idempotent 

* PROD (DOCKER)
    1. no db.json :: seed
   
* UI
    1. stale token :: 401 /me (clears storage)